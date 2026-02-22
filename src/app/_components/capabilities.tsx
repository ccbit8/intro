"use client"
import { Smartphone, Globe2, Code, Gamepad2 } from "lucide-react"

interface CapabilityItem {
  title: string
  titleZh: string
  icon: React.ReactNode
  desc?: string
}

const items: CapabilityItem[] = [
  { title: "WeChat / Alipay Mini Program", titleZh: "微信 / 支付宝小程序", icon: <Smartphone className="w-4 h-4" /> },
  { title: "Cross-platform Web App (Taro / Uniapp)", titleZh: "跨端 Web 应用（Taro / Uniapp）", icon: <Globe2 className="w-4 h-4" /> },
  { title: "HarmonyOS Native (ArkTS)", titleZh: "鸿蒙原生应用（ArkTS）", icon: <Code className="w-4 h-4" /> },
  { title: "HTML5 Game (Cocos / Egret)", titleZh: "HTML5 游戏（Cocos / Egret）", icon: <Gamepad2 className="w-4 h-4" /> },
]

export default function Capabilities() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map(item => (
        <div
          key={item.title}
          className="home-capability-item flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 hover:bg-muted/70 transition-colors px-3 py-2"
        >
          <div className="home-capability-icon flex items-center justify-center w-7 h-7 rounded-md bg-background/60 shadow-sm text-primary">
            {item.icon}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-foreground home-lang-en">{item.title}</span>
            <span className="text-xs font-medium text-foreground home-lang-zh">{item.titleZh}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
