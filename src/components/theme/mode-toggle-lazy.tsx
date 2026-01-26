"use client"

import LazyInteraction from '@/components/lazy-interaction'
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export default function ModeToggleLazy() {
  return (
    <LazyInteraction<{ defaultOpen: boolean }>
      loader={() => import("./toggle-mode").then(mod => ({ default: mod.ModeToggle }))}
      fallback={(handleClick) => (
        <Button
          variant="ghost"
          size="sm"
          className="w-9 px-0"
          onClick={handleClick}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      )}
      componentProps={{ defaultOpen: true }}
    />
  )
}