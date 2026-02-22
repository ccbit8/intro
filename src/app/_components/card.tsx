"use client"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { memo, useEffect, useRef } from "react"

// 更紧凑的小卡片：减少内边距、显示页面预览图
export interface BasicItem { name: string; nameZh?: string; link: string; image: string; desc?: string }

function CardProject({ project, priority = false }: { project?: BasicItem, priority?: boolean }) {
  // 判断是否为站内详情页（如 /miniapp/xxx）
  // 判断是否为外链：以 http:// 或 https:// 开头即视为外部链接，否则认为是站内路由
  const isExternal = /^https?:\/\//i.test(project?.link || "");
  
  return (
    <div className="w-full p-2">
      <Card className="w-full shadow-sm hover:shadow transition-shadow border-border/60 overflow-hidden">
        <CardContent className="p-2 sm:p-3">
          {isExternal ? (
            <a
              href={project?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
            <div className="aspect-video rounded-sm bg-muted mb-1.5 overflow-hidden relative">
              {project?.image ? (
                <Image 
                  src={project.image}
                  alt={`${project.name} preview`}
                  fill
                  priority={priority}
                  loading={priority ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                  No preview
                </div>
              )}
            </div>
            <CardTitle className="text-[11px] sm:text-xs font-medium mb-0.5 text-center truncate hover:text-primary transition-colors" title={project?.nameZh ? `${project?.name} / ${project?.nameZh}` : project?.name}>
              <span className="home-lang-en">{project?.name}</span>
              <span className="home-lang-zh">{project?.nameZh || project?.name}</span>
              <span className="home-cny-name-lantern"> 🏮</span>
            </CardTitle>
            </a>
          ) : (
            <Link href={project?.link || "#"} className="block">
            <div className="aspect-video rounded-sm bg-muted mb-1.5 overflow-hidden relative">
              {project?.image ? (
                <Image 
                  src={project.image}
                  alt={`${project.name} preview`}
                  fill
                  priority={priority}
                  loading={priority ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                  No preview
                </div>
              )}
            </div>
            <CardTitle className="text-[11px] sm:text-xs font-medium mb-0.5 text-center truncate hover:text-primary transition-colors" title={project?.nameZh ? `${project?.name} / ${project?.nameZh}` : project?.name}>
              <span className="home-lang-en">{project?.name}</span>
              <span className="home-lang-zh">{project?.nameZh || project?.name}</span>
              <span className="home-cny-name-lantern"> 🏮</span>
            </CardTitle>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default memo(CardProject)