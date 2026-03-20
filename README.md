# Ninesun Blog V2

<div align="center">
  <h3>基于 Spring Boot 3 与 React 19 的现代化个人全栈博客系统</h3>
</div>

## 📖 简介

Ninesun Blog V2 是一套前后端分离、功能丰富的全栈开源博客系统。后端基于 Spring Boot 3 构建，提供了一套安全且高效的 RESTful API 架构；前端由 React 19 配合 Vite 驱动，使用 Chakra UI 及 Framer Motion 打造现代化、响应式的极致用户体验。系统内嵌支持如 Bilibili 视频播放等富媒体扩展的自定义 Markdown 渲染器，并为国际化提供了完整准备。

## ✨ 核心特性

- **🚀 现代技术栈**：Spring Boot 3 + Java 17 + React 19 全新搭配，享受现代化开发的红利。
- **📝 进阶 Markdown 支持**：系统高度集成了富文本和 Markdown 编辑器，提供极致的所见即所得体验。特别支持自定义语法拓展（如 `::bilibili[视频ID]` 挂载外部视频播放器）。
- **🎨 优美且灵动的界面 UI**：前端借助 Chakra UI 和 Framer Motion 组件精心打磨了视觉细节，支持平滑自适应及深色/浅色（Dark / Light）主题模式无缝切换。
- **🔐 健壮的安全认证**：基于 JWT 和 Spring Security 提供可靠的无状态服务体系，安全抵御常规攻击，并随时可拓展 GitHub OAuth 等快速授权登录。
- **速 缓存与加速**：底层使用 Redis 实现接口数据缓存、高频请求拦截以及阅读量等热点数据统计。
- **📁 媒体与文件管理**：独立的本地与云端媒体文件上传管家，原生支持图床特性。
- **🌍 国际化**：全站内置 i18next 配置（多语言即刻切换就绪）。
- **🐳 极简容器化部署**：一站式 `docker-compose` 编排方案，告别复杂的环境配置。

## 🛠️ 技术栈清单

### 后端 (Backend)
- **核心框架**: Java 17 + Spring Boot 3.2.3
- **数据持久层**: Spring Data JPA + PostgreSQL
- **缓存与加速**: Redis (Spring Boot Data Redis)
- **安全拦截**: Spring Security + JJWT 0.12.5 (JWT 令牌)
- **其它支持**: GeoIP2 (访客归属地), Lombok, Jackson

### 前端 (Frontend)
- **核心库**: React 19 + TypeScript + Vite
- **UI 风格组件**: Chakra UI V3 + Emotion + Framer Motion
- **状态 & 异步流**: Zustand 5 + TanStack React Query V5
- **解析与渲染**: React Markdown Editor (`@uiw/react-md-editor`), `react-markdown` (涵盖 GFM/Raw 支持)
- **图标与工具**: React Icons, Echarts, i18next

## 📂 目录结构概述

```text
ninesun-blog-v2/
├── backend/                    # Spring Boot 后端核心服务模块
│   ├── src/main/java/          # Java 业务层、全局拦截器、控制路由、模型
│   ├── src/main/resources/     # 核心配置 (如 application.yml)
│   ├── Dockerfile              # 后端服务自动构建及发布镜像配置
│   ├── pom.xml                 # Maven 依赖描述文件
│   └── uploads/                # 媒体文件、图片本地储存归档目录
│
├── frontend/                   # React 博客客户端及管理控制台模块
│   ├── src/                    # 页面组件、公共钩子、状态树和网络拦截器
│   ├── public/                 # 核心静态公共资源目录
│   ├── Dockerfile              # 使用 Nginx 对前端进行多层阶段打包构建配置
│   ├── nginx.conf              # 前后端转发分离的 Nginx 相关配置
│   └── package.json            # npm/yarn 前端工作空间依赖节点清单
│
├── docker-compose.yml          # 快速起步环境配置 (支持一键拉起依赖组件)
├── docker-compose.prod.yml     # 应用于生产环境的守护与映射配置
└── .env.example                # 基础环境变量配置骨架与预设
```

## 🚀 快速启动

### 准备环境
确保宿主机已正确安装 **Docker** 引擎以及 **Docker Compose** 插件。

### 1. 本地开发与体验

```bash
# 复制并初始化一份环境变量文件 (可根据需求自行配置各项密码与密钥)
cp .env.example .env

# 通过 Docker Compose 构建所有镜像并一键在后台分离启动
docker-compose up -d --build
```
容器构建与拉起成功后：
- 🌐 前端访问门户地址: [http://localhost:8999](http://localhost:8999)
- ⚙️ 后端 API 反代指向: [http://localhost:8089/api](http://localhost:8089/api) (健康探针验证: `/api/health`)

### 2. 线上的生产环境部署

```bash
# 拷贝生产环境变量配置并更改至关重要的敏感信息（数据库密码、JWT私钥等）
cp .env.prod.example .env.prod

# 指定生产环境的编排文件并剥离开发依赖组装拉起
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🚪 API 核心业务端点参考

| 接口意图 | 请求类型 | 端点路径 | 权限要求 |
|:---|:---:|---|:---:|
| 签发登录认证 | `POST` | `/api/auth/login` | 游客公开 |
| 账户注册绑定 | `POST` | `/api/auth/register` | 游客公开 |
| 全局公开档案 | `GET` | `/api/articles` | 游客公开 |
| 查看文章全文 | `GET` | `/api/articles/{id}` | 游客公开 |
| 发布或推入草稿 | `POST` | `/api/articles` | Admin 管理员 |
| 分发媒体附件文件 | `POST` | `/api/files/upload` | 仅注册登录用户 |
| 获取图片二进制 | `GET` | `/api/files/{filename}`| 游客公开 |
| 各项业务统筹处理 | `*` | `/api/admin/*` | Admin 管理员 |

## 🗄️ 数据持久卷挂载 (Volumes)

引擎自动映射以下路径进行容器外数据备份保证持久存储和防丢性：
- `postgres_data` - 存储主库索引内容。
- `redis_data` - 用户热点、阅读指标防重 RDB 快照。
- `uploads_data` - CMS 内容管理所存储的多维媒体静态库。

## 🔑 系统开箱初始管理凭证

初始化部署测试阶段时，使用预置系统账号接管后台操作面板：
> **⚠️ 强安全提示：为了保护您的站点数据，登入后台之后请务必首先在管理员设置进行安全密码更改或销毁替换。**

- **全局管理通行证用户名**: `admin`
- **初始暗号密码**: `admin123`
