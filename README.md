# 待办清单 - Electron 桌面应用

一个基于 Electron + TypeScript 开发的待办清单桌面应用。

## 功能

- ✅ 添加、完成、删除待办事项
- 💾 数据持久化（MySQL）
- 🖥️ 跨平台桌面应用

## 技术栈

- **Electron** - 桌面应用框架
- **TypeScript** - 类型安全的 JavaScript
- **MySQL** - 数据存储

## 开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建
npm run build

# 打包 Windows 安装程序
npm run package:win
```

## 项目结构

```
src/
├── main.ts        # Electron 主进程
├── preload.ts     # 预加载脚本
├── db.ts          # 数据库操作
├── global.d.ts    # 类型声明
└── renderer/      # 渲染进程（前端界面）
    ├── index.html
    ├── renderer.js
    └── style.css
```

## License

MIT
