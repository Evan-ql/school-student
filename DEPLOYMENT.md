# 智能教学助手 - 飞牛 NAS Docker 部署指南

本文档将指导您如何在支持 Docker 的飞牛（FeiNiu）NAS 上部署智能教学助手应用。本部署方案采用 Docker Compose，包含应用服务、PostgreSQL 数据库以及 Watchtower 自动更新服务。

## 1. 架构概览

部署架构包含三个核心服务：

- **app**: Next.js 应用程序本身。
- **db**: PostgreSQL 数据库，用于存储所有应用数据。
- **watchtower**: 自动更新服务，监控 GitHub Container Registry (ghcr.io) 中的镜像，并在新版本发布时自动拉取并重启 `app` 服务。

数据通过 Docker 卷（Volume）进行持久化，确保在容器重启或更新后数据不会丢失。

| 服务         | 镜像                               | 端口   | 数据卷         | 描述                                     |
| :----------- | :--------------------------------- | :----- | :------------- | :--------------------------------------- |
| `app`        | `ghcr.io/evan-ql/school-student:latest` | `7050` | `uploads_data` | Next.js 应用服务                         |
| `db`         | `postgres:16-alpine`               | `5432` | `postgres_data`| PostgreSQL 数据库服务                    |
| `watchtower` | `containrrr/watchtower`            | N/A    | N/A            | 监控并自动更新 `app` 服务的 Docker 镜像 |

## 2. 部署先决条件

在开始之前，请确保您的飞牛 NAS 满足以下条件：

- **Docker 环境**: 已安装并运行 Docker 和 Docker Compose。
- **Git**: NAS 上已安装 Git 命令行工具。
- **网络访问**: NAS 可以访问互联网，特别是 GitHub 和 Docker Hub。

## 3. 部署步骤

### 步骤 1：获取项目代码

通过 SSH 连接到您的 NAS，然后使用 Git 克隆项目仓库。

```bash
# 克隆仓库
git clone https://github.com/Evan-ql/school-student.git

# 进入项目目录
cd school-student
```

### 步骤 2：配置环境变量

项目使用一个 `.env` 文件来管理敏感信息，主要是 JWT 密钥。您需要从模板文件创建它。

```bash
# 从模板复制 .env 文件
cp .env.example .env
```

接下来，编辑 `.env` 文件，**务必修改 `JWT_SECRET`** 为一个随机且复杂的字符串，以保证应用的安全性。您可以使用以下命令生成一个随机密钥：

```bash
# 生成一个安全的随机密钥并更新 .env 文件
# Linux/macOS 用户
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s|please-change-this-secret-in-production|$JWT_SECRET|" .env

# 查看确认
cat .env
```

> **重要提示**: `DATABASE_URL` 环境变量已在 `docker-compose.yml` 中为 `app` 服务设置好，它将连接到同在此 Compose 文件中定义的 `db` 服务，因此您**不需要**在 `.env` 文件中修改它。

### 步骤 3：登录 GitHub Container Registry (可选)

本项目配置的 GitHub Actions 会将构建好的 Docker 镜像推送到公共的 GitHub Container Registry (`ghcr.io`)。如果您的仓库是公开的，则无需执行此步骤。

如果您的镜像是私有的，您需要在 NAS 上登录 `ghcr.io` 以便 Docker 可以拉取它。您需要一个具有 `read:packages` 权限的 GitHub Personal Access Token (PAT)。

```bash
# 使用您的 GitHub 用户名和 PAT 登录
docker login ghcr.io -u <您的 GitHub 用户名> -p <您的 Personal Access Token>
```

### 步骤 4：启动服务

一切准备就绪后，使用 Docker Compose 启动所有服务。

```bash
# 在后台启动所有服务
docker-compose up -d
```

Docker 将会执行以下操作：

1.  拉取 `postgres` 和 `watchtower` 的镜像。
2.  拉取最新的 `ghcr.io/evan-ql/school-student:latest` 应用镜像。
3.  创建并启动 `db`、`app` 和 `watchtower` 三个容器。
4.  `app` 容器的启动脚本会自动等待 `db` 服务就绪，然后运行数据库迁移（`prisma db push`）。

您可以使用以下命令查看服务状态：

```bash
docker-compose ps
```

### 步骤 5：访问应用

部署成功后，您可以通过浏览器访问您的 NAS IP 地址和 `7050` 端口来使用智能教学助手。

- **地址**: `http://<您的 NAS IP 地址>:7050`

## 4. 自动更新机制

本部署方案实现了全自动更新，工作流程如下：

1.  **代码推送**: 当您将新的代码推送到 GitHub 仓库的 `main` 分支时。
2.  **GitHub Actions**: 预设的 GitHub Actions 工作流（位于 `.github/workflows/docker-build.yml`）会自动被触发。
3.  **构建与推送**: 该工作流将构建一个新的 Docker 镜像，并将其标记为 `latest` 推送到 `ghcr.io`。
4.  **Watchtower 监控**: NAS 上运行的 `watchtower` 服务会定期（默认每 5 分钟）检查 `ghcr.io/evan-ql/school-student:latest` 镜像是否有更新。
5.  **自动部署**: 一旦检测到新版本，Watchtower 会自动拉取最新的镜像，并使用相同的配置优雅地重启 `app` 容器，完成更新。

整个过程无需人工干预，实现了持续部署。

## 5. 数据持久化

应用数据和用户上传的文件都通过 Docker 卷进行持久化，以防止数据丢失。

- **数据库数据**: PostgreSQL 的所有数据都存储在名为 `postgres_data` 的 Docker 卷中。
- **上传文件**: 用户上传的作业图片等文件存储在名为 `uploads_data` 的 Docker 卷中，并挂载到 `app` 容器的 `/app/uploads` 目录。

即使您销毁并重建容器（例如，通过 `docker-compose down` 和 `docker-compose up`），这些数据卷中的内容依然会保留。

## 6. 故障排查

如果在部署或运行过程中遇到问题，可以尝试以下步骤进行排查：

- **查看容器日志**: 这是最直接的排查方式。

  ```bash
  # 查看应用服务的实时日志
  docker-compose logs -f app

  # 查看数据库服务的日志
  docker-compose logs -f db
  ```

- **确认容器状态**: 确保所有容器都处于 `Up` 或 `running` 状态。

  ```bash
  docker-compose ps
  ```

- **检查网络**: 确认 NAS 的网络连接正常，并且可以访问 `ghcr.io`。

- **环境变量**: 检查 `.env` 文件中的 `JWT_SECRET` 是否已正确设置。


部署成功后，您可以通过浏览器访问您的 NAS IP 地址和 `7050` 端口来使用智能教学助手。

- **地址**: `http://<您的 NAS IP 地址>:7050`

## 4. 自动更新机制

本部署方案实现了全自动更新，工作流程如下：

1.  **代码推送**: 当您将新的代码推送到 GitHub 仓库的 `main` 分支时。
2.  **GitHub Actions**: 预设的 GitHub Actions 工作流（位于 `.github/workflows/docker-build.yml`）会自动被触发。
3.  **构建与推送**: 该工作流将构建一个新的 Docker 镜像，并将其标记为 `latest` 推送到 `ghcr.io`。
4.  **Watchtower 监控**: NAS 上运行的 `watchtower` 服务会定期（默认每 5 分钟）检查 `ghcr.io/evan-ql/school-student:latest` 镜像是否有更新。
5.  **自动部署**: 一旦检测到新版本，Watchtower 会自动拉取最新的镜像，并使用相同的配置优雅地重启 `app` 容器，完成更新。

整个过程无需人工干预，实现了持续部署。

## 5. 数据持久化

应用数据和用户上传的文件都通过 Docker 卷进行持久化，以防止数据丢失。

- **数据库数据**: PostgreSQL 的所有数据都存储在名为 `postgres_data` 的 Docker 卷中。
- **上传文件**: 用户上传的作业图片等文件存储在名为 `uploads_data` 的 Docker 卷中，并挂载到 `app` 容器的 `/app/uploads` 目录。

即使您销毁并重建容器（例如，通过 `docker-compose down` 和 `docker-compose up`），这些数据卷中的内容依然会保留。

## 6. 故障排查

如果在部署或运行过程中遇到问题，可以尝试以下步骤进行排查：

- **查看容器日志**: 这是最直接的排查方式。

  ```bash
  # 查看应用服务的实时日志
  docker-compose logs -f app

  # 查看数据库服务的日志
  docker-compose logs -f db
  ```

- **确认容器状态**: 确保所有容器都处于 `Up` 或 `running` 状态。

  ```bash
  docker-compose ps
  ```

- **检查网络**: 确认 NAS 的网络连接正常，并且可以访问 `ghcr.io`。

- **环境变量**: 检查 `.env` 文件中的 `JWT_SECRET` 是否已正确设置。
