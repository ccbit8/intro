"use client";

import React, { memo, useEffect, useState } from "react";

import useMouseMove from "@/hooks/use-mouse-move";

function Background({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  // 仅在客户端挂载后启用鼠标追踪，避免首屏渲染阻塞
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // 首屏加载时使用静态背景
    return (
      <>
        <div className="fixed left-0 top-0 -z-50">
          <div className="bg-muted-foreground/20 absolute inset-0 z-[-1]" />
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern
                id="dotted-pattern"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="black" />
              </pattern>
              <mask id="dots-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect width="100%" height="100%" fill="url(#dotted-pattern)" />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="hsl(var(--background))"
              mask="url(#dots-mask)"
            />
          </svg>
        </div>
        {children}
      </>
    );
  }

  // 客户端加载完成后，启用交互式背景
  return (
    <>
      <InteractiveBg>{children}</InteractiveBg>
    </>
  );
}

function InteractiveBg({
  children,
}: {
  children: React.ReactNode;
}) {
  // --x and --y will be updated based on mouse position
  useMouseMove();
  return (
    <>
      <div className="fixed left-0 top-0 -z-50">
        <div className="sticky left-0 top-0 h-screen w-screen overflow-hidden">
          <div className="bg-muted-foreground/20 absolute inset-0 z-[-1]" />
          <div className="bg-gradient-radial from-muted-foreground/80 absolute left-[--x] top-[--y] z-[-1] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full from-0% to-transparent to-90% blur-md" />
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern
                id="dotted-pattern"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="black" />
              </pattern>
              <mask id="dots-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect width="100%" height="100%" fill="url(#dotted-pattern)" />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="hsl(var(--background))"
              mask="url(#dots-mask)"
            />
          </svg>
        </div>
      </div>

      {children}
    </>
  );
}

export default memo(Background);
