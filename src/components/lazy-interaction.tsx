"use client"

import { useState, ComponentType } from 'react'

// 默认的加载状态 UI
const DefaultLoading = () => (
  <div className="inline-flex items-center justify-center w-9 h-9">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  </div>
)

interface LazyInteractionProps<T = any> {
  /**
   * 动态导入函数，返回要加载的组件
   * @example () => import('./my-component')
   */
  loader: () => Promise<{ default: ComponentType<T> }>
  
  /**
   * 占位 UI（点击前显示）
   * 接收 handleClick 函数，用于触发加载
   */
  fallback: (handleClick: () => void) => React.ReactNode
  
  /**
   * 加载中 UI（可选）
   * 默认显示一个通用的 spinner
   * 传入 null 可禁用 loading 状态（继续显示 fallback）
   */
  loading?: (() => React.ReactNode) | null
  
  /**
   * 传递给目标组件的 props
   */
  componentProps?: T
  
  /**
   * 是否禁用 SSR
   * @default true
   */
  ssr?: boolean
}

/**
 * 通用的交互时延迟加载组件
 * 
 * @example
 * ```tsx
 * <LazyInteraction
 *   loader={() => import('./chat-dialog')}
 *   fallback={(handleClick) => (
 *     <Button onClick={handleClick}>
 *       <Bot />
 *     </Button>
 *   )}
 *   componentProps={{ defaultOpen: true }}
 * />
 * ```
 */
export default function LazyInteraction<T = any>({
  loader,
  fallback,
  loading = DefaultLoading,
  componentProps,
  ssr = false,
}: LazyInteractionProps<T>) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [Component, setComponent] = useState<ComponentType<T> | null>(null)

  const handleClick = async () => {
    if (shouldLoad) return
    setShouldLoad(true)
    
    const mod = await loader()
    setComponent(() => mod.default)
  }

  // 未加载状态：显示占位 UI
  if (!shouldLoad) {
    return <>{fallback(handleClick)}</>
  }

  // 加载中状态：显示 loading UI（如果有）
  if (!Component && loading) {
    return <>{loading()}</>
  }

  // 已加载状态：渲染真实组件
  if (Component) {
    return <Component {...(componentProps as T)} />
  }

  // 加载中但禁用了 loading UI：继续显示 fallback
  return <>{fallback(handleClick)}</>
}
