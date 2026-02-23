# 智能教学助手 - 飞牛 NAS 部署指南

本文档提供两种在飞牛（Feiniu）NAS 上部署智能教学助手应用的方式：

- **方式一：通过飞牛 Docker 管理器（Web UI）** - 推荐，无需命令行
- **方式二：通过 SSH 命令行** - 适合高级用户

在开始之前，请确保您的飞牛 NAS 已安装 Docker 管理器。

---

## 方式一：通过飞牛 Docker 管理器（Web UI）

这种方式通过图形化界面完成所有操作，最简单快捷。

### 步骤 1：创建文件夹

1. 打开飞牛 NAS 的 **文件管理器**。
2. 在您希望存储项目的位置（例如 `volume1/docker`），创建两个文件夹：
   - `school-student`：用于存放配置文件。
   - `school-student-db`：用于存放数据库数据。

![创建文件夹](https://i.imgur.com/your-image-link-1.png) <!-- 占位符，后续替换为真实截图 -->

### 步骤 2：创建 Compose 项目

1. 打开飞牛 **Docker 管理器**。
2. 在左侧菜单中，点击 **Compose**。
3. 点击 **新增项目**。

![新增 Compose 项目](https://i.imgur.com/your-image-link-2.png) <!-- 占位符 -->

### 步骤 3：配置项目

1. **项目名称**：输入 `school-student`。
2. **内容**：将以下 `docker-compose.yml` 的全部内容粘贴到文本框中。

   ```yaml
   services:
     # ========== PostgreSQL 数据库 ==========
     db:
       image: postgres:16-alpine
       container_name: teaching-db
       restart: unless-stopped
       environment:
         POSTGRES_USER: teacher
         POSTGRES_PASSWORD: teacher123
         POSTGRES_DB: teaching_assistant
         TZ: Asia/Shanghai
       volumes:
         - /volume1/docker/school-student-db:/var/lib/postgresql/data # 注意：这里要换成您自己创建的数据库文件夹路径
       ports:
         - "5432:5432"
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U teacher -d teaching_assistant"]
         interval: 10s
         timeout: 5s
         retries: 5

     # ========== Next.js 应用 ==========
     app:
       image: ghcr.io/evan-ql/school-student:latest
       container_name: teaching-app
       restart: unless-stopped
       pull_policy: always # 总是拉取最新镜像
       depends_on:
         db:
           condition: service_healthy
       environment:
         DATABASE_URL: postgresql://teacher:teacher123@db:5432/teaching_assistant?schema=public
         JWT_SECRET: please-change-this-secret-in-production-long-enough
         NODE_ENV: production
         TZ: Asia/Shanghai
         # 管理员账户配置（首次启动时自动创建）
         ADMIN_EMAIL: admin@example.com
         ADMIN_PASSWORD: change-me-to-your-password
         ADMIN_NAME: 管理员
       ports:
         - "7050:3000"
       volumes:
         - /volume1/docker/school-student/uploads:/app/uploads # 注意：这里要换成您自己创建的项目文件夹下的 uploads 路径

     # ========== Watchtower 自动更新 (可选) ==========
     watchtower:
       image: containrrr/watchtower
       container_name: teaching-watchtower
       restart: unless-stopped
       environment:
         WATCHTOWER_CLEANUP: "true"
         WATCHTOWER_POLL_INTERVAL: 300 # 每5分钟检查一次更新
         WATCHTOWER_INCLUDE_STOPPED: "false"
         WATCHTOWER_LABEL_ENABLE: "false"
         TZ: Asia/Shanghai
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
       command: teaching-app # 只监控 teaching-app 这一个容器

   volumes:
     postgres_data:
       driver: local
       driver_opts:
         o: bind
         type: none
         device: /volume1/docker/school-student-db # 对应上方 db 服务的路径
     uploads_data:
       driver: local
       driver_opts:
         o: bind
         type: none
         device: /volume1/docker/school-student/uploads # 对应上方 app 服务的路径
   ```

3. **重要**：请务必将 `docker-compose.yml` 中 `volumes` 部分的路径 `/volume1/docker/school-student-db` 和 `/volume1/docker/school-student/uploads` 替换为您在 **步骤 1** 中创建的实际文件夹路径。

4. 点击 **创建**。

### 步骤 4：启动并访问

1. 创建成功后，项目会自动开始拉取镜像并启动容器。
2. 您可以在 Compose 项目列表中看到 `school-student` 项目，并查看其日志。
3. 等待所有服务（`db` 和 `app`）都显示为绿色健康状态。
4. 打开浏览器，访问 `http://<您的NAS的IP地址>:7050`。
5. 您应该能看到应用的注册/登录页面。

---

## 方式二：通过 SSH 命令行

### 步骤 1：准备文件

1. 使用 SSH 登录到您的飞牛 NAS。
2. 创建项目目录：
   ```bash
   mkdir -p /volume1/docker/school-student/uploads
   mkdir -p /volume1/docker/school-student-db
   cd /volume1/docker/school-student
   ```
3. 创建 `docker-compose.yml` 文件：
   ```bash
   touch docker-compose.yml
   ```
4. 将上方方式一中提供的 `docker-compose.yml` 内容粘贴到这个文件中，并确保路径正确。

### 步骤 2：启动服务

在 `docker-compose.yml` 所在目录执行以下命令：

```bash
docker compose up -d
```

### 步骤 3：访问和更新

- **访问**：浏览器访问 `http://<您的NAS的IP地址>:7050`。
- **查看日志**：`docker compose logs -f`
- **停止服务**：`docker compose down`
- **更新应用**：`docker compose pull app && docker compose up -d --force-recreate`

---

## GitHub Actions 自动构建镜像

本项目已配置 GitHub Actions，当您推送代码到 `main` 分支时，会自动构建新的 Docker 镜像并推送到 `ghcr.io/evan-ql/school-student:latest`。

如果您开启了 Watchtower 服务，它会自动检测到新镜像并更新您的应用，实现全自动部署。

### 如何启用自动构建

由于权限限制，需要您在 GitHub 仓库网页上手动创建工作流文件：

1. **访问链接**：[点击这里直接创建文件](https://github.com/Evan-ql/school-student/new/main?filename=.github/workflows/docker-build.yml)
2. **粘贴内容**：将以下内容完整粘贴到文件中：

   ```yaml
   name: Build and Push Docker Image

   on:
     push:
       branches: [main]
     workflow_dispatch:

   env:
     REGISTRY: ghcr.io
     IMAGE_NAME: ${{ github.repository }}

   jobs:
     build-and-push:
       runs-on: ubuntu-latest
       permissions:
         contents: read
         packages: write

       steps:
         - name: Checkout repository
           uses: actions/checkout@v4

         - name: Set up QEMU
           uses: docker/setup-qemu-action@v3

         - name: Set up Docker Buildx
           uses: docker/setup-buildx-action@v3

         - name: Log in to Container Registry
           uses: docker/login-action@v3
           with:
             registry: ${{ env.REGISTRY }}
             username: ${{ github.actor }}
             password: ${{ secrets.GITHUB_TOKEN }}

         - name: Extract metadata
           id: meta
           uses: docker/metadata-action@v5
           with:
             images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
             tags: |
               type=raw,value=latest,enable={{is_default_branch}}
               type=sha,prefix=,format=short

         - name: Build and push Docker image
           uses: docker/build-push-action@v6
           with:
             context: .
             push: true
             tags: ${{ steps.meta.outputs.tags }}
             labels: ${{ steps.meta.outputs.labels }}
             cache-from: type=gha
             cache-to: type=gha,mode=max
             platforms: linux/amd64,linux/arm64
   ```

3. **提交文件**：点击页面底部的 "Commit changes..." 按钮即可。

之后，每次向 `main` 分支推送代码，都会触发该 Action，自动构建并发布新的 Docker 镜像。
