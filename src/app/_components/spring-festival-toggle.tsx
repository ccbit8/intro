"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "home-cny-theme-enabled";
export const DEFAULT_CNY_THEME_ENABLED = true;

function applyHomeTheme(enabled: boolean) {
  document.documentElement.classList.toggle("home-cny-theme", enabled);
}

export default function SpringFestivalToggle() {
  const [enabled, setEnabled] = useState(DEFAULT_CNY_THEME_ENABLED);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initialEnabled = stored === null ? DEFAULT_CNY_THEME_ENABLED : stored === "1";

    setEnabled(initialEnabled);
    applyHomeTheme(initialEnabled);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    applyHomeTheme(enabled);
  }, [enabled, mounted]);

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="w-9 px-0"
        onClick={() => setEnabled((prev) => !prev)}
        title={enabled ? "切换为常规主题" : "开启新春主题"}
        aria-label={enabled ? "切换为常规主题" : "开启新春主题"}
      >
        <span className="text-lg leading-none" role="img" aria-hidden="true">
          🏮
        </span>
      </Button>
      <span className="home-cny-toggle-text text-[10px] leading-none text-muted-foreground">
        {enabled ? "春" : "常"}
      </span>
    </div>
  );
}