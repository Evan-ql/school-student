# 智能教学助手 - 飞牛 NAS (fnOS) Web 界面部署指南

本文档将指导您如何通过飞牛 NAS (fnOS) 自带的 Docker 管理器（Web UI）轻松部署“智能教学助手”项目。本教程采用 `docker-compose` 方式，操作简单，无需使用 SSH 或命令行。

---

## 部署流程概览

整个部署过程主要分为以下几个步骤：

1.  **准备工作**：在飞牛 NAS 上创建项目所需的文件夹。
2.  **创建 Compose 项目**：在飞牛 Docker 管理器中新建一个 Compose 项目。
3.  **配置项目**：粘贴 `docker-compose.yml` 配置代码，并创建 `.env` 环境变量文件。
4.  **启动并访问**：启动项目，并通过浏览器访问应用。

## 步骤 1：准备工作 - 创建文件夹

首先，我们需要为应用和数据库创建存放配置和数据的文件夹。

1.  打开飞牛 NAS 的“文件管理器”。
2.  进入您的 Docker 应用常用存放路径（例如 `DOCKER` 共享文件夹），或者任意您喜欢的位置。
3.  创建一个名为 `student-learning-system` 的新文件夹，这将作为我们项目的根目录。
4.  进入 `student-learning-system` 文件夹，在内部再创建一个名为 `postgres-data` 的文件夹，用于存放 PostgreSQL 数据库的数据。

完成后的文件夹结构应如下所示：

```
/path/to/your/docker/  (你的 Docker 根目录)
└── student-learning-system/
    └── postgres-data/
```

## 步骤 2：创建 Docker Compose 项目

接下来，我们使用飞牛的 Docker Web UI 来创建项目。

1.  返回飞牛 NAS 桌面，双击打开“Docker”管理器。
2.  在左侧菜单栏中，点击 **Compose**。
3.  点击 **新增项目** 按钮。

## 步骤 3：配置项目

在“新增项目”页面，我们需要进行以下配置：

1.  **项目名称**：输入 `student-learning-system`。

2.  **路径**：点击“浏览”，选择您在 **步骤 1** 中创建的 `student-learning-system` 文件夹。

3.  **Compose**：保持默认的“创建”选项，然后在下方的 YAML 编辑器中，**清空所有默认内容**，并粘贴以下代码：

    ```yaml
    version: '3.8'

    services:
      app:
        image: ghcr.io/evan-ql/school-student:latest
        container_name: student-learning-system-app
        restart: unless-stopped
        ports:
          - "3000:3000"
        environment:
          - DATABASE_URL=${DATABASE_URL}
          - JWT_SECRET=${JWT_SECRET}
          - OPENAI_API_KEY=${OPENAI_API_KEY}
          - OPENAI_BASE_URL=${OPENAI_BASE_URL}
        volumes:
          - ./uploads:/app/uploads
        depends_on:
          db:
            condition: service_healthy

      db:
        image: postgres:16-alpine
        container_name: student-learning-system-db
        restart: unless-stopped
        volumes:
          - ./postgres-data:/var/lib/postgresql/data
        environment:
          - POSTGRES_DB=${POSTGRES_DB}
          - POSTGRES_USER=${POSTGRES_USER}
          - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
          interval: 10s
          timeout: 5s
          retries: 5

      watchtower:
        image: containrrr/watchtower:latest
        container_name: student-learning-system-watchtower
        restart: unless-stopped
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
        command: --cleanup --interval 3600 student-learning-system-app
    ```

4.  **创建环境变量文件**：
    - 在 YAML 编辑器下方，点击 **新增文件** 按钮。
    - 文件名输入 `.env`。
    - 在右侧的文件内容区域，粘贴以下内容，并**根据您的实际情况修改**：

    ```env
    # 数据库连接信息 (请务必修改密码)
    DATABASE_URL="postgresql://user:password@db:5432/mydatabase"
    POSTGRES_DB=mydatabase
    POSTGRES_USER=user
    POSTGRES_PASSWORD=your_strong_password_here  # <--- 务必修改为一个强密码

    # JWT 密钥 (请务必修改为一个复杂的随机字符串)
    JWT_SECRET=your_super_secret_jwt_key_here   # <--- 务必修改为一个复杂的随机字符串

    # AI 服务配置 (可选, 如果需要使用 AI 功能)
    OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxx"
    OPENAI_BASE_URL="https://api.openai.com/v1"
    ```

    > **重要提示**：
    > - `POSTGRES_PASSWORD` 和 `JWT_SECRET` **必须修改**为您自己的复杂密码和密钥，以确保安全。
    > - `DATABASE_URL` 中的 `user` 和 `password` 以及 `mydatabase` 必须与下面的 `POSTGRES_` 变量保持一致。

5.  **确认并完成**：完成以上所有配置后，点击页面底部的 **完成** 按钮。

飞牛 Docker 管理器现在会自动从 Docker Hub 拉取 `postgres`、`containrrr/watchtower` 镜像，并从 GitHub Packages (`ghcr.io`) 拉取 `school-student` 应用镜像。这个过程可能需要几分钟，具体时间取决于您的网络速度。

## 步骤 4：启动并访问应用

1.  项目创建完成后，您会在 Compose 列表中看到 `student-learning-system` 项目。
2.  系统会自动启动所有服务。您可以点击项目名称进入详情页，查看各个容器（app, db, watchtower）的运行状态和日志。
3.  等待 `app` 和 `db` 容器都显示为“running”或“healthy”状态。
4.  打开您的浏览器，访问 `http://<您的飞牛NAS的IP地址>:3000`。

如果一切顺利，您将看到“智能教学助手”的登录页面。恭喜您，部署成功！

## 常见问题 (Troubleshooting)

- **无法访问 3000 端口？**
  - 请检查 `app` 容器的日志，确认服务是否正常启动。常见的错误包括 `.env` 文件配置错误（如数据库密码不匹配）或端口冲突。
  - 确认您的 NAS 防火墙没有阻止 3000 端口。

- **容器反复重启？**
  - 这通常是配置错误导致的。请仔细检查 `app` 和 `db` 容器的日志，定位错误原因。最常见的原因是 `DATABASE_URL` 与 `POSTGRES_` 系列环境变量不匹配。

- **镜像拉取失败？**
  - 可能是网络问题。请检查您的 NAS 网络设置，确保可以正常访问 Docker Hub 和 `ghcr.io`。您可以在 Docker 管理器的“仓库”设置中尝试配置国内镜像加速器。

---

### 参考资料

[1] 飞牛社区. (2024). _详细介绍飞牛NAS（Fn OS）之Docker篇+部署兰空图床（lsky-pro）_. [https://club.fnnas.com/forum.php?mod=viewthread&tid=4462](https://club.fnnas.com/forum.php?mod=viewthread&tid=4462)

[2] CSDN博客. (2025). _在飞牛 NAS 上部署 PanSou：图文指南_. [https://blog.csdn.net/loutengyuan/article/details/150593129](https://blog.csdn.net/loutengyuan/article/details/150593129)
