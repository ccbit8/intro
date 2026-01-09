# WebRTC 视频通话架构文档

本文档概述项目中“WebRTC 视频对讲”功能的整体架构、模块职责、数据流以及关键设计决策，帮助快速理解与维护。

## 总览
- 技术栈：Next.js 13（App Router）、React 18（Hooks/Context）、Tailwind + shadcn/ui、WebRTC（PeerConnection/DataChannel/ICE）、Socket.IO 实时信令服务
- 页面入口：`src/app/video-chat/page.tsx`
- 架构模式：Provider（Context）+ 自定义 Hooks（业务逻辑）+ 组件组合（UI）
- 服务端口：
  - **端口 3000**：Next.js 应用（页面、API、HMR）
  - **端口 3001**：独立 Socket.IO WebSocket 服务（信令）

```
VideoChatProvider (Context)
  ├── ControlPanel (左侧控制区)
  │   ├── RoomControls（创建/加入房间）
  │   └── CallControls（音视频开关/挂断）
  └── MediaSection (右侧媒体区)
      ├── ChatPanel（数据通道文字聊天）
      ├── VideoPlayer (remote)
      └── VideoPlayer (local)
```

## 目录结构
```
src/app/video-chat/
  ├── page.tsx                     # 主页面（Provider 包裹 + 两栏布局）
  ├── context/VideoChatContext.tsx # Context Provider + useVideoChatContext
  ├── hooks/
  │   ├── useWebRTC.ts             # WebRTC 连接管理（流/PC/ICE）
  │   ├── useDataChannel.ts        # 数据通道与消息管理
  │   ├── useSocketSignaling.ts   # Socket.IO 信令通信
  │   └── useVideoChat.ts          # 主协调器（房间/协商/控制）
  └── components/
      ├── RoomControls.tsx         # 创建/加入房间 UI
      ├── CallControls.tsx         # 音视频开关/挂断
      ├── ChatPanel.tsx            # 聊天面板
      ├── VideoPlayer.tsx          # 复用视频播放器
      ├── ControlPanel.tsx         # 左侧组合
      └── MediaSection.tsx         # 右侧组合
```

## 模块职责
- `VideoChatProvider`
  - 作用：集中提供视频通话状态与操作，避免 props drilling。
  - 实现：内部调用 `useVideoChat`，将其返回值放入 Context。

- `useVideoChat`
  - 作用：主业务协调器。整合 WebRTC、数据通道、信令调用。
  - 关键能力：
    - `createRoom`/`joinRoom`：创建/加入房间并完成 SDP/ICE 协商。
    - 轮询逻辑：内联 `poll` 处理 `answer` 与对端 ICE candidates。
    - 媒体控制：`toggleVideo`、`toggleAudio`、`hangUp`。
    - 降级策略：无摄像头/麦克风时允许纯数据通道模式。
    - 状态机：`callStatus` = `idle` → `calling`（已发 Offer 等待 Answer）→ `connected`（双向媒体/数据通道可用）。
    - 返回值稳定性：避免把整个 hook 对象放入依赖，改为逐项函数/值，减少不必要重渲染。

- `useWebRTC`
  - 作用：管理 PeerConnection、Local/Remote streams、ICE 状态。
  - 设计要点：
    - `cleanup` 使用函数式 `setState(prev => ...)`，保持引用稳定。
    - `startLocalStream` 三层降级（video+audio → audio-only → empty stream）。
    - 连接监控：根据 `pc.iceConnectionState` 设置 `isConnected`，仅在 `failed/closed` 时清理，不在 `disconnected` 时立刻清理。
    - **Transceiver 统一管理**：在 `addLocalStream` 中统一处理，有本地轨道时 `addTrack`，无轨道时添加 `recvonly` transceiver。
    - **远程流累积**：使用 `remoteStreamRef` 累积多次 `ontrack` 事件的轨道，确保视频和音频都能正确接收。

- `useDataChannel`
  - 作用：统一数据通道的建立、消息发送/接收、系统提示及滚动。
  - 设计要点：
    - 防重复绑定：`isSetupRef` 标志位，确保通道仅初始化一次。
    - `sendMessage` 直接使用当前 `dataChannel` 状态，避免不必要 setState。
    - 自动滚动：监听 `messages` 更新容器滚动。

 - `useSocketSignaling`
   - 作用：通过 Socket.IO 实时事件与服务端通信，替代原有 REST 轮询。
   - 能力：`connect`、`joinRoom`、`sendOffer`、`sendAnswer`、`sendIce`，以及 `onOffer`、`onAnswer`、`onIce` 事件监听。
   - **事件处理器模式**：使用模块级 `handlers` 对象存储回调，Socket 事件只注册一次，通过 handlers 间接调用，避免重复注册问题。

- UI 组件
  - `RoomControls`：创建房间、输入房间 ID 加入、复制房间 ID。
  - `CallControls`：视频/音频开关、挂断、连接状态显示。
  - `ChatPanel`：基于 DataChannel 的文字消息收发与列表展示。
  - `VideoPlayer`：复用型视频组件（local/remote），通过 `useEffect` 自动设置 `video.srcObject`。
  - `ControlPanel`/`MediaSection`：左右两栏组合与排版。

## 数据流与时序
1. 创建房间（房主 / Offer）：
  - 采集本地媒体（降级策略生效）→ `pc.createDataChannel('chat')` → `createOffer` → `setLocalDescription` → `sendOffer`（Socket.IO）。
  - 监听 `onAnswer`、`onIce`（side=answer）事件，收到后 `setRemoteDescription(answer)`、`addIceCandidate(...)`。

2. 加入房间（成员 / Answer）：
  - 采集本地媒体（可为空）→ `joinRoom`（Socket.IO）→ 监听 `onOffer` 事件，`setRemoteDescription(offer)`。
  - `pc.ondatachannel` 接收 `chat` → 初始化数据通道。
  - `createAnswer` → `setLocalDescription` → `sendAnswer`（Socket.IO）。
  - 监听 `onIce`（side=offer）事件，`addIceCandidate(...)`。

3. 数据通道消息：
   - 发送方：`dataChannel.send(text)` → 本地消息入列（isSelf）。
   - 接收方：`channel.onmessage` → 对端消息入列。
   - 防重策略：通道仅初始化一次，避免重复绑定导致多次触发。

### 时序图（Mermaid）
```
sequenceDiagram
  participant A as 房主 (Offer)
  participant S as 信令服务
  participant B as 成员 (Answer)

  A->>A: getUserMedia (video+audio | audio-only | empty)
  A->>A: pc.createDataChannel('chat')
  A->>A: pc.createOffer() + setLocalDescription(offer)
  A->>S: POST offer(roomId, sdp)
  A->>S: POST ice-candidate(type=offer, candidate)

  B->>S: POST join(roomId)
  B->>S: GET get-offer(roomId)
  B->>B: setRemoteDescription(offer)
  B->>B: pc.ondatachannel(channel=chat)
  B->>B: pc.createAnswer() + setLocalDescription(answer)
  B->>S: POST answer(roomId, sdp)
  B->>S: POST ice-candidate(type=answer, candidate)

  A->>S: GET get-answer(roomId)
  A->>A: setRemoteDescription(answer)
  A->>S: GET get-ice-candidates(roomId, side=answer)
  A->>A: pc.addIceCandidate(answer-side)
  B->>S: GET get-ice-candidates(roomId, side=offer)
  B->>B: pc.addIceCandidate(offer-side)

  A-->>B: DataChannel(chat) open
  A->>B: send(text) over chat
  B->>B: onmessage(text)
```

### Socket.IO 信令 API 设计
- **架构**：独立端口模式（避免与 Next.js HMR WebSocket 冲突）
  - Next.js 服务：`http://localhost:3000`
  - Socket.IO 服务：`http://localhost:3001`
- **服务端文件**：`server.js`（自定义 Node 服务器）
- **启动命令**：`npm run dev:socket`（同时启动 Next.js 和 Socket.IO）
- 事件：
  - `join`：加入房间，参数 `roomId`
  - `signal:offer`：发送 offer，参数 `{ roomId, sdp }`
  - `signal:answer`：发送 answer，参数 `{ roomId, sdp }`
  - `signal:ice`：发送 ICE，参数 `{ roomId, side, candidate }`
  - `peer:joined`：新成员加入通知（服务端广播）
- 服务器端将事件转发到同房间其他成员

**为什么使用独立端口？**
Next.js 开发模式下的 HMR (Hot Module Replacement) 会创建自己的 WebSocket 服务，与 Socket.IO 共享同一 HTTP 服务器时会产生冲突，导致 `transport error` 连接断开。使用独立端口完全隔离两者。

注意：Socket.IO 仅用于"信令层"的时序控制与消息交换；媒体/数据通道仍由 WebRTC 直连承担。

服务端伪代码：
```
io.on('connection', (socket) => {
  socket.on('join', (roomId) => {
    socket.join(roomId)
  })
  socket.on('signal:offer', ({ roomId, sdp }) => {
    socket.to(roomId).emit('signal:offer', { sdp })
  })
  socket.on('signal:answer', ({ roomId, sdp }) => {
    socket.to(roomId).emit('signal:answer', { sdp })
  })
  socket.on('signal:ice', ({ roomId, candidate, side }) => {
    socket.to(roomId).emit('signal:ice', { candidate, side })
  })
})
```

### ICE/STUN/TURN 细节
- 当前配置：
  - STUN: `stun:stun.l.google.com:19302`, `stun:stun1.l.google.com:19302`
- 推荐：在生产环境添加 TURN（coturn）以提升对称 NAT/防火墙场景的连通性：
```
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    { urls: ['turn:turn.example.com:3478'], username: 'user', credential: 'pass' }
  ]
})
```
- ICE 状态含义：
  - `new/checking`：正在收集候选与连接检测。
  - `connected/completed`：连接建立，可传输媒体与数据。
  - `disconnected`：短暂失联，通常可恢复，避免立即清理。
  - `failed/closed`：失败或主动关闭，进行清理回收。

## 关键设计与坑位
- ICE 状态：避免在 `disconnected` 时立即清理，仅在 `failed/closed` 时清理。
- React Hooks 引用稳定性：避免依赖整个 hook 返回对象，改为依赖具体函数与值。
- 清理函数：使用函数式更新，防止因依赖变化导致引用不稳定。
- Next.js 客户端组件：`"use client"` 置顶，以确保 WebRTC/DOM API 可用。
- 权限与设备缺失：用户无摄像头/麦克风时仍允许进入房间并使用文字聊天。

### 常见错误与处理
- `NotFoundError: Requested device not found`：设备缺失，降级为 audio-only 或空流，保留文字聊天。
- ICE 长时间 `disconnected`：网络抖动，保持连接，必要时可提示用户检查网络。
- 数据通道消息重复：创建/加入双方的通道初始化去重（`isSetupRef`），并确保仅绑定一次事件。
- SDP 设置顺序错误：始终遵循 `setRemoteDescription` → `createAnswer` → `setLocalDescription` 的顺序（加入方）。

### 无摄像头场景处理（Transceiver 方案）

**问题现象**：
- PC 两个网页（都没摄像头）：正常 ✅
- PC + 手机（一方有摄像头）：消息异常，视频只能看到自己 ❌
- 两个手机（都有摄像头）：消息正常，视频都只能看到自己 ❌

**问题根源**：
1. 最初方案在 `createPeerConnection` 中预先添加 `recvonly` transceiver
2. 然后在 `addLocalStream` 中又调用 `addTrack`，导致**重复的 transceiver**
3. SDP 协商时出现混乱，导致媒体流无法正确建立

**正确解决方案**：在 `addLocalStream` 中统一处理所有情况：

```typescript
const addLocalStream = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
  const hasVideo = stream.getVideoTracks().length > 0
  const hasAudio = stream.getAudioTracks().length > 0
  
  // 如果有本地轨道，直接添加（会自动创建 sendrecv transceiver）
  if (stream.getTracks().length > 0) {
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream)
    })
  }

  // 如果没有视频轨道，添加 recvonly transceiver 以接收对方视频
  if (!hasVideo) {
    pc.addTransceiver('video', { direction: 'recvonly' })
  }

  // 如果没有音频轨道，添加 recvonly transceiver 以接收对方音频
  if (!hasAudio) {
    pc.addTransceiver('audio', { direction: 'recvonly' })
  }
}, [])
```

**关键点**：
- 不在 `createPeerConnection` 中预添加 transceiver，避免重复
- 始终调用 `addLocalStream`（即使 stream 为空）
- `addTrack` 会自动创建 `sendrecv` 方向的 transceiver
- 仅在缺少对应轨道时才添加 `recvonly` transceiver

**远程流累积处理**：

```typescript
const remoteStreamRef = useRef<MediaStream | null>(null)

const handleRemoteTrack = useCallback((event: RTCTrackEvent) => {
  // 使用 ref 累积多次 ontrack 事件的轨道
  if (!remoteStreamRef.current) {
    remoteStreamRef.current = event.streams[0] || new MediaStream()
  }
  
  const stream = remoteStreamRef.current
  
  // 移除相同类型的旧 track，添加新 track
  if (!stream.getTracks().includes(event.track)) {
    stream.getTracks()
      .filter(t => t.kind === event.track.kind)
      .forEach(t => stream.removeTrack(t))
    stream.addTrack(event.track)
  }
  
  // 创建新引用触发 React 更新
  setRemoteStream(new MediaStream(stream.getTracks()))
}, [])
```

### 延迟挂载 Video 元素问题

**问题**：页面布局改为"通话中才显示视频区域"后，调用 `startLocalStream` 时 video 元素还未渲染，导致本地视频看不到。

**原因**：
1. 用户点击"创建房间"，先调用 `startLocalStream` 获取媒体流
2. 此时 `callStatus` 还是 `'idle'`，`MediaSection` 还没渲染
3. `localVideoRef.current` 是 `null`，无法设置 `srcObject`
4. 之后 `callStatus` 变成 `'calling'`，video 元素渲染了，但没有被设置流

**解决方案**：在 `VideoPlayer` 组件中使用 `useEffect` 自动设置 `srcObject`：

```tsx
export function VideoPlayer({ videoRef, stream, ... }) {
  // 当 stream 变化或组件挂载时，自动设置 video.srcObject
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [videoRef, stream])
  
  return (...)
}
```

### Socket.IO 事件监听器重复注册问题

**问题**：每次调用 `onOffer`、`onAnswer` 等方法都会添加新的事件监听器，不会移除旧的，导致事件重复触发或丢失。

**解决方案**：使用模块级 handlers 对象，Socket 事件只注册一次：

```typescript
// 模块级事件处理器存储
const handlers = {
  offer: null as ((sdp: RTCSessionDescriptionInit) => void) | null,
  answer: null as ((sdp: RTCSessionDescriptionInit) => void) | null,
  ice: null as ((payload: {...}) => void) | null,
  peerJoined: null as (() => void) | null,
}

// Socket 连接时一次性注册所有事件
function setupSocketListeners(socket: Socket) {
  socket.off('signal:offer')  // 移除旧监听器
  socket.on('signal:offer', (payload) => {
    handlers.offer?.(payload.sdp)  // 通过 handlers 间接调用
  })
  // ... 其他事件类似
}

// onOffer 只更新 handler，不重复注册 socket 事件
const onOffer = useCallback((handler) => {
  handlers.offer = handler
}, [])
```

**效果对比**：

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| PC × 2（无摄像头） | ✅ 正常 | ✅ 正常 |
| PC + 手机 | ❌ 消息/视频异常 | ✅ 正常 |
| 手机 × 2 | ❌ 只能看到自己 | ✅ 双向视频 |

### 组件与 Hook 接口
- `VideoPlayer`：
  - Props: `videoRef`, `stream`, `title`, `muted`, `placeholder`
  - 行为：当 `stream` 为空显示占位；`muted` 用于本地回声抑制。
- `RoomControls`：
  - 交互：创建房间、输入房间 ID、复制 ID；`callStatus==='idle'` 时显示。
- `CallControls`：
  - 操作：`toggleVideo`、`toggleAudio`、`hangUp`；显示连接状态徽标。
- `useWebRTC`：
  - 返回：`peerConnection`, `localStream`, `remoteStream`, `isConnected`, `localVideoRef`, `remoteVideoRef`, `startLocalStream`, `createPeerConnection`, `addLocalStream`, `handleRemoteTrack`, `cleanup`
- `useDataChannel`：
  - 返回：`dataChannel`, `messages`, `messagesContainerRef`, `setupDataChannel`, `sendMessage`, `addSystemMessage`, `cleanup`
- `useVideoChat`：
  - 返回：房间与通话控制：`roomId`, `callStatus`, `isVideoEnabled`, `isAudioEnabled`, `createRoom`, `joinRoom`, `toggleVideo`, `toggleAudio`, `hangUp` 以及 WebRTC/DataChannel 的组合值。

### 安全与隔离
- 房间 ID 随机 7 位（36 进制），仅在内存信令中存在；生产场景需引入鉴权与过期策略。
- 信令服务未持久化，不做历史保留；提升方案为 Redis + 过期键 + 实例共享。

### 性能与稳定性
- DataChannel 采用 `ordered: true` 保序；可按需启用 `maxRetransmits` 控制可靠性。
- 轮询频率 1s；连接完成后停止轮询，减少负载。
- 组件分层减少重渲染：Context 提供稳定引用，UI 读取必要值。
  - 依赖管理：`useCallback` 仅依赖具体函数与原子值；清理函数使用函数式更新，避免闭包捕获旧值。

### 轮询与事件驱动对比
- 旧方案：REST 轮询，需每秒请求 answer/ICE，存在延迟与负载。
- 新方案：Socket.IO 事件驱动，Offer/Answer/ICE 实时推送，极大提升响应速度与扩展性。
- 客户端通过 `useSocketSignaling` hook 统一管理信令事件。

## 错误处理与日志
- 用户提示：无法访问媒体设备、创建/加入房间失败等，统一通过 `alert` 提示。
- 控制台日志：开发阶段可打开（当前已精简），生产可进一步封装到日志服务。

## 调试指南

### Socket.IO 信令调试
1. 打开浏览器 DevTools → **Network** 面板
2. 点击 **WS** 过滤器（只显示 WebSocket 连接）
3. 找到 `localhost:3001` 的连接
4. 点击该连接，选择 **Messages** 标签页
5. 可以看到所有收发的信令消息，格式如：
   - `42["join","abc123"]` - 加入房间
   - `42["signal:offer",{...}]` - 发送 offer
   - `42["peer:joined",{...}]` - 收到新成员通知

**Socket.IO 消息前缀说明**：
- `0` - 连接（connect）
- `2` - ping
- `3` - pong
- `42` - 事件，后面跟 `[事件名, 数据]`

### WebRTC DataChannel 调试
**注意**：DataChannel 消息在 DevTools Network 面板中**看不到**，因为它走的是 SCTP over DTLS over UDP 协议，完全绕过浏览器网络层。

调试方法：
1. **Console 日志**：代码中已添加 `[DataChannel] 发送/收到消息` 日志
2. **chrome://webrtc-internals/**：查看 WebRTC 连接详情和 DataChannel 统计（不含消息内容）

## Try It（快速体验）
- 开发运行：
```pwsh
# 安装依赖
pnpm install

# 开发模式（启动 Next.js + Socket.IO）
npm run dev:socket

# 或分别启动
# npm run dev          # 仅 Next.js（端口 3000）
# node server.js       # 仅 Socket.IO（需要同时运行 Next.js）

# 构建
pnpm build

# 生产启动
npm run start:socket
```
- 测试步骤：
  - 浏览器 A 打开 `/video-chat`，点击“创建房间”。
  - 复制房间 ID。
  - 浏览器 B 打开 `/video-chat`，输入房间 ID 点击“加入”。
  - 连接建立后，尝试：
    - 聊天发送文字，确认双方显示一次。
    - 切换视频/音频，确认本地轨道启停正常。
    - 挂断后，资源清理（轨道停止、PC 关闭）。

  ### 测试清单（Checklist）
  - 无设备场景：无摄像头/麦克风仍可创建/加入房间并聊天。
  - 双端通话：Offer/Answer 互通，视频画面与音频正常。
  - 数据通道：单条消息只显示一次；通道断开提示正确。
  - 资源清理：挂断后所有轨道停止，PeerConnection 关闭，Context 状态重置。
  - 重入流程：挂断后可再次创建/加入房间，状态机无异常。
  - **混合设备场景**：
    - PC × 2（无摄像头）：消息正常 ✅
    - PC + 手机（一方有摄像头）：消息和视频都正常 ✅
    - 手机 × 2（都有摄像头）：双向视频正常 ✅

## 可扩展方向
- TURN 服务：提升复杂 NAT 条件下的连通性。
- 房间持久化：将内存信令迁移至 Redis/DB，支持多实例与历史记录。
- 多人房间：扩展为 Mesh 或 SFU 架构。
- 文件传输：复用 DataChannel 实现断点续传与校验。
- 状态持久化：引入 Zustand/Redux，或将 Context 切分为更细粒度。

## 后续优化路线（Roadmap）
- 稳定性与网络适配
  - 引入 TURN 并做健康检查/故障切换（优先 STUN，失败自动切 TURN）。
  - ICE 重连策略：`disconnected`/`failed` 时做指数退避重试，提供重连提示与手动重试按钮。
  - 候选过滤：优先 UDP → TCP → TURN 中继，按带宽与延迟排序选择。

- 媒体体验
  - 回声消除/降噪/自动增益：`getUserMedia` 的 `audio: { echoCancellation, noiseSuppression, autoGainControl }`。
  - 自适应码率（ABR）：监控 `RTCPeerConnection.getStats()`，动态调整分辨率与帧率。
  - 屏幕共享：增加 `getDisplayMedia()`，并实现轨道切换与并发流管理。

- 数据通道增强
  - 可靠传输：使用 `maxRetransmits`/`maxPacketLifeTime` 控制可靠性与延迟。
  - 分片与重组：大消息（文件/图片）分片传输，序号/校验与断点续传。
  - 消息持久化：本地持久（IndexedDB）与服务端同步（选配）。

- 信令与房间服务
  - 持久化与横向扩展：信令从内存迁移至 Redis，支持多实例与断电恢复。
  - 房间生命周期：超时回收、踢人/禁言、角色权限（主持人/成员）。
  - 安全：房间口令/一次性 Token、速率限制、CSRF/同源策略防护。

- 可观测性与调试
  - 统计与日志：统一封装日志与 `getStats()` 指标上报（丢包/抖动/往返时延）。
  - 问题定位：SDP/ICE 事件审计、错误分类与前端提示（含导出诊断包）。

- 前端工程化
  - 单测/端到端测试：对 hooks 与信令流程做模拟测试（MSW/Playwright）。
  - 性能监控：渲染性能与内存泄漏检测；严格管理依赖与清理函数。
  - UI 细粒度拆分：减少 Context 读写范围，使用选择性订阅（如 Zustand selector）。

---
维护人：工程团队
最后更新：2025-12-11（修复 VideoPlayer 延迟挂载 + Socket.IO 事件监听器重复注册问题）
