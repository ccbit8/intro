# 🕰️ 代码分割演进史：从 `<script>` 到 `import()`

本文档回顾了前端开发中"按需加载"技术的发展历程，以及为什么现代的 `import()` 方案是目前的终极形态。

## 1️⃣ 石器时代 (Pre-2010): 巨型 Bundle
在 Webpack 出现之前，前端代码通常被打包成一个巨大的文件，或者使用多个 `<script>` 标签。

```html
<!-- 所有 JS 打包成一个文件 -->
<script src="bundle.js"></script>  <!-- 可能有 5MB+ -->
```
**问题**:
- ❌ **首屏加载慢**: 用户必须下载所有代码才能看到页面（即使是只会用到 1% 的功能）。
- ❌ **缓存失效**: 修改一行代码，整个 bundle 的缓存都会失效。

## 2️⃣ 手动分割时代 (2010-2015): 依赖地狱
为了解决大文件问题，开发者开始手动拆分文件。

```html
<!-- 手动拆分成多个文件 -->
<script src="jquery.js"></script>
<script src="lodash.js"></script>
<script src="main.js"></script>
<script src="chat-feature.js"></script>
```
**问题**:
- ❌ **依赖顺序**: 必须手动保证加载顺序（jquery 必须在 main 之前）。
- ❌ **全局污染**: 变量都挂载在 `window` 上，容易冲突。
- ❌ **阻塞**: 仍然需要在 HTML 解析时加载，或者手动操作 DOM 插入脚本。

## 3️⃣ AMD/RequireJS 时代 (2011-2015): 运行时异步
出现了像 RequireJS 这样的库，实现了模块化和异步加载。

```javascript
// 定义模块
define('chat', ['jquery'], function($) {
  return {
    open: function() { /*...*/ }
  }
})

// 按需加载
require(['chat'], function(chat) {
  chat.open()
})
```
**特点**:
- ✅ **运行时加载**: 真正实现了按需下载。
- ❌ **语法繁琐**: 编写大量的样板代码。
- ❌ **库依赖**: 即使是简单的功能也需要引入 loader 库。

## 4️⃣ Webpack 1-2 时代 (2015-2017): require.ensure
Webpack 带来了构建时的自动代码分割，但早期使用的是专有语法。

```javascript
// Webpack 专有 API
require.ensure([], function(require) {
  const ChatDialog = require('./chat-dialog').default
}, 'chat-chunk')
```
**特点**:
- ✅ **自动打包**: 构建工具自动生成独立的 chunk 文件。
- ❌ **非标准**: 只能在 Webpack 中使用。
- ❌ **回调地狱**: 仍然依赖回调函数。

## 5️⃣ React.lazy 时代 (2018+): 声明式加载
React 引入了 `Suspense` 和 `lazy`，将代码分割与组件生命周期结合。

```javascript
const ChatDialog = React.lazy(() => import('./chat-dialog'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatDialog />
    </Suspense>
  )
}
```
**特点**:
- ✅ **框架集成**: 完美融入 React 组件树。
- ✅ **Loading 处理**: 声明式地处理加载状态。
- ❌ **局限性**: 只能用于**组件**渲染时，无法在普通点击事件或逻辑中预加载。

### 🤔 问：React.lazy 能实现"点击加载"吗？
**答**：可以，但需要配合 State。

```tsx
// React.lazy 的点击加载模式
const LazyComp = React.lazy(() => import('./comp'))

function App() {
  const [show, setShow] = useState(false) // 1. 需要状态控制
  return (
    <>
      <button onClick={() => setShow(true)}>Load</button> // 2. 点击触发重渲染
      {show && (
        <Suspense fallback="..."> // 3. 渲染引发下载，必须包裹 Suspense
          <LazyComp />
        </Suspense>
      )}
    </>
  )
}
```
**对比我们的 `LazyInteraction` 方案**：
*   `React.lazy` 模式下，点击导致状态变更，触发 Re-render，然后才开始网络请求。
*   我们的 `import()` 模式下，点击直接触发网络请求，下载完再 Re-render。这种**命令式**控制在处理按钮 loading 动画或预加载（Preload）时更灵活，不会因为 Suspense 边界导致布局跳动。

## 6️⃣ 现代方案 (2020+): ES2020 原生 `import()`
ECMAScript 2020 标准正式引入了动态导入语法。这也是我们项目中 `LazyInteraction` 核心使用的方案。

```javascript
// 你的 LazyInteraction 组件内部逻辑
const handleClick = async () => {
  // 原生 Promise 语法，所有现代打包工具（Webpack/Vite/Rollup）都支持
  const module = await import('./chat-dialog')
  setComponent(module.default)
}
```

**为什么它是终极方案？**
1.  **标准化**: 它是 JavaScript 语言标准，不再依赖特定的构建工具或框架。
2.  **灵活性**: 可以在任何地方调用（点击事件、定时器、条件判断中），而不仅限于组件渲染时。
3.  **可控性**: 我们可以完全掌控何时加载、如何显示 Loading、如何处理错误（Try-Catch）。

### 📊 方案对比

| 时代 | 核心技术 | 触发时机 | 标准化 | 复杂度 |
| :--- | :--- | :--- | :--- | :--- |
| 2010 | `<script>` | 页面加载 | ✅ | 低 |
| 2012 | RequireJS | 运行时 | ❌ | 高 |
| 2016 | `require.ensure` | 运行时 | ❌ | 中 |
| 2018 | `React.lazy` | 组件渲染 | ❌ (React独有) | 低 |
| **2024** | **`import()`** | **任意时刻** | ✅ (ES2020) | **极低** |

---

> **我们在项目中的应用**：
> 我们封装的 [`LazyInteraction`](../src/components/lazy-interaction.tsx) 组件正是利用了现代 `import()` 的灵活性，实现了**"仅在用户交互时才下载代码"**的高级优化策略，这在前 React.lazy 时代是很难优雅实现的。