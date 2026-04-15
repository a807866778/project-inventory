# 项目进存销管理系统

通讯施工团队专用，支持光缆、摄像头等物料的采购入库、领料出库、项目成本核算。

## 功能特性

- ✅ **物料管理** - 物料台账、采购价/结算价设置、库存预警
- ✅ **入库管理** - 采购入库、供应商关联、照片上传
- ✅ **出库管理** - 领料出库、关联项目、自动扣库存
- ✅ **项目管理** - 项目成本表、产值/成本/利润统计
- ✅ **收益报表** - 日/周/月统计、按项目汇总
- ✅ **权限系统** - 职位权限可配置、多角色支持
- ✅ **多用户** - 员工账号管理、角色分配
- ✅ **响应式** - 支持手机、平板、电脑访问

## 部署到 Cloudflare Pages (Git CI/CD + D1)

### 1. 准备工作

1. 注册 [Cloudflare](https://cloudflare.com) 账号（免费）
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 安装 Wrangler CLI：`npm install -g wrangler`
4. 登录 Cloudflare：`wrangler login`

### 2. 创建 D1 数据库

```bash
# 创建 D1 数据库
wrangler d1 create project-inventory

# 复制输出的 database_id，填入 wrangler.toml
```

### 3. 初始化数据库

```bash
# 安装依赖
npm install

# 生成迁移文件
npm run db:generate

# 推送到本地 D1（开发用）
wrangler d1 execute project-inventory --local --file=drizzle/*.sql

# 推送到远程 D1（生产用）
wrangler d1 execute project-inventory --remote --file=drizzle/*.sql
```

### 4. 配置 Cloudflare Pages (Git CI/CD)

1. 将代码推送到 GitHub/GitLab 仓库
2. 在 Cloudflare Dashboard 进入 **Pages**
3. 点击 **创建项目** → **连接到 Git**
4. 选择你的仓库
5. 配置构建设置：

| 设置项 | 值 |
|--------|-----|
| 生产分支 | `main` |
| 构建命令 | `npm run build:cf` |
| 构建输出目录 | `.open-next/worker` |

6. 点击 **保存并部署**

### 5. 配置环境变量

在 Cloudflare Pages 项目设置中添加：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_APP_URL` | `https://project-inventory.pages.dev` |

**D1 数据库会自动通过 `wrangler.toml` 绑定，无需额外配置环境变量。**

### 6. 完成！

等待 CI/CD 部署完成后，访问你的 Cloudflare Pages URL，使用默认账号登录：

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 超级管理员 |
| cangguan | 123456 | 仓管 |
| xiaoshou | 123456 | 销售 |
| caigou | 123456 | 采购 |
| shigong | 123456 | 施工员 |
| xiangmu | 123456 | 项目经理 |

### 后续更新

每次推送到 `main` 分支，Cloudflare Pages 会自动重新构建和部署。

```bash
git add .
git commit -m "更新内容"
git push
```

## 本地开发

```bash
# 安装依赖
npm install --legacy-peer-deps

# 本地开发
npm run dev

# 打开 http://localhost:3000
```

## 项目结构

```
project-inventory/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # 管理后台页面
│   │   │   ├── materials/      # 物料管理
│   │   │   ├── inbound/        # 入库管理
│   │   │   ├── outbound/       # 出库管理
│   │   │   ├── projects/       # 项目管理
│   │   │   ├── suppliers/      # 供应商管理
│   │   │   ├── reports/        # 报表
│   │   │   └── settings/       # 系统设置
│   │   ├── login/              # 登录页
│   │   └── globals.css         # 全局样式
│   ├── components/             # 公共组件
│   └── lib/
│       ├── db/                 # 数据库
│       │   ├── schema.ts       # Drizzle Schema
│       │   ├── seed.ts         # 种子数据
│       │   └── index.ts        # 数据库连接
│       ├── auth.ts             # 认证逻辑
│       └── actions/            # Server Actions
├── wrangler.toml               # Cloudflare Workers 配置
├── drizzle.config.ts          # Drizzle 配置
└── package.json
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **认证**: Session-based
- **部署**: Cloudflare Pages + Workers
- **适配器**: @opennextjs/cloudflare

## 许可证

MIT
