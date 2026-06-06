# 📋 待办清单 - Electron 桌面应用

一个功能丰富的待办清单桌面应用，基于 Electron + TypeScript 构建，使用 MySQL 持久化存储。

## ✨ 功能特性

### 📝 任务管理
- 任务的增删改查，支持拖拽排序
- 三级优先级标记（高 / 中 / 低）
- 截止日期设置，支持快速选择（今天、明天、下周一）
- 自定义分类（工作 💼 / 生活 🏠 / 学习 📚 + 自定义）
- 标签系统，支持多标签筛选
- 子任务管理，跟踪完成进度
- 任务描述与备注
- 颜色标记（7 种颜色）
- 置顶重要任务
- 循环任务（每天 / 每周 / 每月）
- 任务模板，快速创建重复任务
- 复制任务

### 🔍 搜索与筛选
- 全文搜索（任务名、描述、备注）
- 按状态筛选（全部 / 进行中 / 已完成）
- 按分类筛选
- 按标签筛选
- 多种排序方式（日期、优先级、创建时间、名称）

### 📊 数据统计
- 总览面板（总任务、已完成、完成率、逾期、总耗时）
- 7 天完成趋势图
- 分类分布饼图
- 优先级分布图
- 标签使用统计
- 周统计 / 月统计
- 生产力评分系统（S/A/B/C/D 五档）

### 🍅 番茄钟
- 可自定义工作 / 休息时长
- 关联具体任务
- 完成音效提醒
- 番茄钟历史记录与统计

### ⏱️ 时间追踪
- 为每个任务记录耗时
- 实时计时器显示

### 📅 日历视图
- 月历展示任务分布
- 点击日期快速查看当天任务

### 🗑️ 回收站
- 删除任务自动移入回收站
- 支持恢复或永久删除
- 自动清理（保留最近 100 条）

### 💾 数据管理
- JSON / CSV 格式导出
- JSON 数据导入
- 自动备份（退出时）
- 手动备份与恢复
- 备份文件管理（保留最近 30 天）

### 🎨 界面与体验
- 🌙 暗黑模式
- 🎯 专注模式（只显示当前任务）
- 📐 紧凑视图
- 批量操作（完成、删除、修改优先级）
- 完成任务动画 + 音效
- Toast 通知提示
- 桌面通知（到期提醒、定时提醒）
- 键盘快捷键（Ctrl+F 搜索、Ctrl+D 切换暗黑、Ctrl+N 新建）
- 新手引导

### 👤 用户系统
- 注册 / 登录
- 多用户数据隔离
- 活动日志记录

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [Electron](https://www.electronjs.org/) | 桌面应用框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript |
| [MySQL](https://www.mysql.com/) / [mysql2](https://www.npmjs.com/package/mysql2) | 数据持久化存储 |
| [electron-builder](https://www.electron.build/) | 应用打包分发 |

## 📦 安装与运行

### 前置要求

- [Node.js](https://nodejs.org/) >= 16
- [MySQL](https://www.mysql.com/) >= 5.7

### 1. 克隆项目

```bash
git clone https://github.com/xuan20078888/todo-electron-app.git
cd todo-electron-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

复制环境变量模板并填写你的数据库信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=todo_app
```

然后在 MySQL 中创建数据库：

```sql
CREATE DATABASE todo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 运行应用

```bash
# 开发模式
npm run dev
```

### 5. 打包安装程序

```bash
# Windows
npm run package:win
```

打包后的安装程序在 `release/` 目录下。

## 📁 项目结构

```
my-electron-app/
├── src/
│   ├── main.ts              # Electron 主进程（IPC、窗口、生命周期）
│   ├── preload.ts           # 预加载脚本（安全桥接 API）
│   ├── db.ts                # 数据库模块（MySQL CRUD 操作）
│   ├── global.d.ts          # TypeScript 类型声明
│   └── renderer/
│       ├── index.html       # 页面结构
│       ├── renderer.js      # 渲染进程逻辑（UI 交互）
│       └── style.css        # 样式（支持暗黑模式）
├── .env.example             # 环境变量模板
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + F` | 搜索 |
| `Ctrl + D` | 切换暗黑模式 |
| `Ctrl + N` | 新建任务 |
| `Enter` | 添加任务 |
| `Esc` | 关闭弹窗 / 退出编辑 |

## 📄 License

[MIT](LICENSE)
