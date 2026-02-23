# ========== 阶段1: 依赖安装 ==========
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ========== 阶段2: 构建 ==========
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建 Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# 收集 pg 相关依赖到临时目录，方便一次性复制
RUN mkdir -p /tmp/pg-deps && \
    for pkg in pg pg-pool pg-protocol pg-types pg-int8 pg-connection-string pg-cloudflare pgpass \
               postgres postgres-array postgres-bytea postgres-date postgres-interval split2; do \
      if [ -d "node_modules/$pkg" ]; then cp -r "node_modules/$pkg" "/tmp/pg-deps/$pkg"; fi; \
    done

# ========== 阶段3: 运行 ==========
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json

# 复制 standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 Prisma 生成的客户端（Prisma 7 输出到 lib/generated）
COPY --from=builder /app/lib/generated ./lib/generated
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# 复制 pg 相关依赖
COPY --from=builder /tmp/pg-deps/ ./node_modules/

# 复制运行时必需的依赖
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=builder /app/node_modules/jsonwebtoken ./node_modules/jsonwebtoken
COPY --from=builder /app/node_modules/cookie ./node_modules/cookie

# 安装 prisma CLI 用于迁移
RUN npm install -g prisma@latest

# 创建上传目录
RUN mkdir -p /app/uploads/assignments && chown -R nextjs:nodejs /app/uploads

# 创建启动脚本
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
