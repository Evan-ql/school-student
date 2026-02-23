# 小学生教学管理系统 v1.0

AI驱动的智能教学助手，让批改作业从2小时变成10分钟。

## 核心功能

### 📸 零负担录入
- 老师只需拍照上传作业
- AI自动识别题目和答案
- 自动批改并生成分析报告

### 🎯 精准画像
- 为每个学生生成知识点掌握情况
- 追踪学习进度和薄弱环节
- 个性化学习建议

### 📊 数据驱动
- 班级整体表现分析
- 个人学习轨迹追踪
- 节点（课时/章节）维度统计

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (Supabase)
- **AI**: Claude Opus 4 (Anthropic)
- **存储**: Supabase Storage

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local` 并填入你的配置：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. 初始化数据库

在 Supabase Dashboard 中执行 `supabase/schema.sql`：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 SQL Editor
4. 复制粘贴 `supabase/schema.sql` 内容
5. 点击 Run

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
student-learning-system/
├── app/
│   ├── page.tsx                 # 首页
│   ├── assignments/             # 作业批改
│   ├── classes/                 # 班级管理
│   ├── analytics/               # 数据分析
│   └── api/
│       └── assignments/
│           └── upload/          # 作业上传API
├── lib/
│   ├── supabase.ts             # Supabase客户端
│   └── ai.ts                   # AI分析功能
├── types/
│   └── index.ts                # TypeScript类型定义
└── supabase/
    └── schema.sql              # 数据库Schema
```

## 数据库设计

### 核心表

1. **teachers** - 教师信息
2. **classes** - 班级信息
3. **students** - 学生信息
4. **learning_nodes** - 学习节点（课时/章节）
5. **assignments** - 作业信息
6. **student_assignments** - 学生作业提交
7. **knowledge_points** - 知识点
8. **student_knowledge_progress** - 学生知识点掌握情况

## 使用流程

### 1. 创建班级和学生
- 在"班级管理"中创建班级
- 添加学生信息

### 2. 创建学习节点
- 按课时/章节创建学习节点
- 关联知识点

### 3. 布置作业
- 选择学习节点
- 创建作业任务

### 4. 批改作业
- 拍照上传学生作业
- AI自动识别和批改
- 查看分析报告

### 5. 查看分析
- 班级整体表现
- 个人学习报告
- 知识点掌握情况

## AI功能

### 作业分析
- 自动识别题目和答案
- 判断对错并给出分数
- 分析错误类型
- 提取知识点

### 学习报告
- 整体表现总结
- 优势和薄弱知识点
- 个性化学习建议
- 针对性练习推荐

## 部署

### Vercel部署

```bash
npm install -g vercel
vercel
```

### 环境变量配置

在Vercel Dashboard中配置所有环境变量。

## 开发计划

- [ ] 批量上传作业
- [ ] 班级数据看板
- [ ] 学生学习报告导出
- [ ] 家长端查看功能
- [ ] 移动端适配
- [ ] 语音批改功能

## License

MIT

## 作者

橙子 (Orange AI Assistant)
