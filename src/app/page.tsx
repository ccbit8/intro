import React, { Suspense, lazy } from "react";
import ModeToggleLazy from "@/components/theme/mode-toggle-lazy";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import LangToggle from "@/components/theme/toggle-lang";
// import IndexRadar from "@/app/_components/index-radar";
import TechStack from "@/app/_components/tech-stack";
import Capabilities from "@/app/_components/capabilities";
import Card from "./_components/card";
import { LoadingProvider } from "./_components/loading-context";
import { projects, notes, tools } from "@/data/site-data";
import { Headphones } from "lucide-react";
import { RadarSkeleton } from "@/app/_components/radar-skeleton";
import LazyChat from "@/components/ai/chat-lazy";
import nextDynamic from "next/dynamic";

// 📉 性能优化：动态导入重型组件 (Recharts ~500KB)
// ssr: false 确保它只在客户端渲染，且独立于主 Bundle
// loading 占位符使用骨架屏样式，避免首屏空白
const IndexRadar = nextDynamic(() => import(/* webpackChunkName: "index-radar" */ '@/app/_components/index-radar'), {
  ssr: false,
  loading: () => <RadarSkeleton />,
})

// 延迟加载非关键组件
// const ChatDialog = lazy(() => import('@/components/ai/chat-dialog'))

// const snippets = allSnippets.sort((a, b) => a.order - b.order);

// ✅ 强制静态生成，避免每次请求都重新渲染
export const dynamic = 'force-static'
export const revalidate = 3600 // 每小时重新生成一次

export default function Home() {
  return (
    <main className="flex min-h-screen relative flex-col items-center justify-between p-2 sm:p-8">
      
      <div className="sm:sticky top-0 flex w-full max-w-[1280px] mx-auto">
        <div className="sm:absolute sm:top-2 sm:-right-12 gap-2 p-1 flex-1 flex sm:flex-col justify-center items-center">
          <ModeToggleLazy />
          <LangToggle />
          <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
            <a
              href="https://github.com/undefcc"
              target="_blank"
            >
              <Github className="h-[1.2rem] w-[1.2rem]" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
            <a href="https://chat.caelus.cc">
              <Headphones className="h-[1.2rem] w-[1.2rem]" />
            </a>
          </Button>
          <LazyChat />
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full max-w-[1280px] relative mx-auto flex-1 p-4 border border-border backdrop-blur-[2px] rounded-lg">
        <div className="grid gap-4 text-center mx-auto max-w-2xl mt-12">
          <h1 className="text-3xl font-cal">He xuchao</h1>
          <p className="text-muted-foreground">
            Just A Simple Coder
          </p>
          <div>
            {/* <DateTimePickerForm /> */}

          </div>
        </div>
        <div className="flex-1 min-h-full flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 pb-4">
            <div className="grid pb-4 md:pb-0 md:pr-4">
              <div className="flex flex-col gap-4 pb-4 border-b border-border">
                <h3 className="text-xl font-cal">Tech Stack</h3>
                <TechStack />
              </div>
              <div className="pt-4 flex flex-col gap-4">
                <h4 className="text-sm font-semibold tracking-wide text-muted-foreground">Capabilities</h4>
                <Capabilities />
              </div>
            </div>
            <div className="flex flex-col gap-3 md:border-l border-border md:pl-4 md:pt-0 md:border-t-0 border-t pt-4">
              <h3 className="text-xl font-cal">Visual</h3>
              <LoadingProvider>
                <IndexRadar />
              </LoadingProvider>
            </div>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <h3 className="text-xl font-cal">Projects</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {
                projects.map((project, index) => (
                  <Card key={project.name} project={project} priority={index < 4} />
                ))
              }
            </div>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <h3 className="text-xl font-cal">Notes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {
                notes.map((note, index) => (
                  <Card key={note.name} project={note} priority={false} />
                ))
              }
            </div>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <h3 className="text-xl font-cal">Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {
                tools.map((tool, index) => (
                  <Card key={tool.name} project={tool} priority={false} />
                ))
              }
            </div>
          </div>
        <div>
          <p className="text-center text-muted-foreground text-sm mb-1">
            Powered by{" "}
            <a className="text-foreground underline hover:no-underline" href="https://nextjs.org/" >
              Next.js
            </a>
          </p>
          <p className="text-center text-muted-foreground text-xs">
            <a href="https://beian.miit.gov.cn/" target="_blank" style={{ color: "inherit", textDecoration: "underline" }} >
              粤ICP备2023063699号
            </a>
          </p>
        </div>
      </div>
      </div>
    </main>
  );
}
