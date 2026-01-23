# Standalone 模式样式丢失问题修复

## ❌ 问题

使用 `npm run build` 后启动 standalone 服务器，页面样式没有加载。

```bash
node .next/standalone/server.js
# 页面加载但无样式 ❌
```

## 🔍 原因

Next.js 的 `output: 'standalone'` 模式下，构建过程**不会自动复制**：
- `.next/static` 目录（CSS、JS 等静态资源）
- `public` 目录（图片、字体等公共文件）

这导致服务器启动后找不到样式文件。

## ✅ 解决方案

### 1️⃣ 创建构建后脚本

新增 **scripts/post-build.js**，自动复制静态文件到 standalone 目录。

```javascript
// 复制 .next/static → .next/standalone/.next/static
// 复制 public → .next/standalone/public
```

### 2️⃣ 更新 package.json

```json
{
  "scripts": {
    "build": "next build && node scripts/post-build.js",
    "start:standalone": "node .next/standalone/server.js"
  }
}
```

### 3️⃣ 重新构建

```bash
# 方式 1：完整构建（推荐）
npm run build

# 方式 2：仅复制静态文件（已构建过）
node scripts/post-build.js

# 启动服务器
npm run start:standalone
```

## 📊 验证

访问 http://localhost:3000，应该能看到：
- ✅ 样式正确加载
- ✅ 图片正常显示
- ✅ 字体正确渲染

## 📁 文件变更

| 文件 | 改动 | 说明 |
|------|------|------|
| **scripts/post-build.js** | 新增 | 构建后复制静态文件 |
| **package.json** | 修改 | 更新 build 和 start 脚本 |

## 🚀 使用指南

### 开发环境
```bash
npm run dev
# 或
npm run dev:socket  # 带 Socket.IO
```

### 生产环境
```bash
# 1. 构建（自动复制静态文件）
npm run build

# 2. 启动（standalone 模式）
npm run start:standalone

# 3. 访问
# http://localhost:3000
```

### 故障排除

**问题：样式仍然丢失**

检查静态文件是否存在：
```bash
# PowerShell
Test-Path .next/standalone/.next/static
Test-Path .next/standalone/public

# 应该都返回 True
```

如果返回 False，手动运行：
```bash
node scripts/post-build.js
```

**问题：图片无法加载**

确认 public 目录已复制：
```bash
Get-ChildItem .next/standalone/public
# 应该看到 images、fonts 等目录
```

## 📝 技术细节

### Standalone 模式工作原理

Next.js standalone 模式会生成一个最小化的服务器包：
- 仅包含必需的 node_modules
- 不包含开发依赖
- **不包含静态文件**（需要手动复制）

### 为什么不自动复制？

这是 Next.js 的设计选择：
1. 允许使用 CDN 托管静态文件
2. 减少 Docker 镜像体积
3. 支持静态文件分离部署

### 最佳实践

对于生产部署，建议：
1. 使用 CDN 托管 `.next/static` 和 `public`
2. 或在 Docker 构建时复制这些文件
3. 或使用 Nginx 反向代理静态文件

## 🔗 相关资源

- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**状态**: ✅ 已修复  
**影响**: Standalone 模式部署  
**优先级**: 高
