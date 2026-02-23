#!/bin/sh
set -e

echo "🚀 智能教学助手 - 启动中..."

# 等待数据库就绪
echo "⏳ 等待数据库连接..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if node -e "
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { PrismaClient } = require('./lib/generated/prisma');
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });
    prisma.\$connect().then(() => { prisma.\$disconnect(); process.exit(0); }).catch(() => process.exit(1));
  " 2>/dev/null; then
    echo "✅ 数据库连接成功"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  重试 $RETRY_COUNT/$MAX_RETRIES..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ 数据库连接超时，请检查 DATABASE_URL 配置"
  exit 1
fi

# 执行数据库迁移
echo "📦 执行数据库迁移..."
npx prisma db push --skip-generate 2>&1 || {
  echo "⚠️ 数据库迁移失败，尝试继续启动..."
}

echo "🎉 启动 Next.js 服务..."
exec node server.js
