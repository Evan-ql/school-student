# 修复方案

## 问题1: 手机端邮箱验证过严

**原因**: HTML5 `type="email"` 在移动端验证过于严格

**修复**: 
- 改用 `type="text"` + 自定义正则验证
- 或者使用更宽松的邮箱验证规则

## 问题2: PC端没有认证保护

**原因**: 
- 首页和其他页面没有检查登录状态
- 缺少全局认证中间件

**修复**:
- 创建 `middleware.ts` 全局认证
- 或在每个页面添加 `getServerSideProps` 检查

## 问题3: 数据库关联问题

**可能原因**:
- Prisma Client 没有生成
- 数据库没有初始化
- 环境变量配置错误

**修复步骤**:
1. 检查 `.env` 配置
2. 运行 `npx prisma generate`
3. 运行 `npx prisma db push`
4. 检查数据库连接

## 具体修复代码

### 1. 修复登录页面邮箱验证

```tsx
// app/login/page.tsx
// 将 type="email" 改为 type="text"
// 添加自定义验证

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  
  // 自定义邮箱验证
  if (!validateEmail(email)) {
    setError('请输入有效的邮箱地址')
    return
  }
  
  setLoading(true)
  // ... 其余代码
}
```

### 2. 创建全局认证中间件

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // 公开路径
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // 未登录且访问受保护路径
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 已登录且访问登录页
  if (token && isPublicPath) {
    try {
      verifyToken(token)
      return NextResponse.redirect(new URL('/', request.url))
    } catch {
      // Token 无效，允许访问登录页
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 3. 检查数据库配置

```bash
# 1. 检查环境变量
cat .env

# 2. 生成 Prisma Client
npx prisma generate

# 3. 推送数据库 Schema
npx prisma db push

# 4. 查看数据库状态
npx prisma studio
```
