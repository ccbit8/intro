"use client";
import React, { useState } from "react";

export default function ModeToggleDefer() {
  const [Loaded, setLoaded] = useState<React.ComponentType | null>(null);

  const handleClick = async () => {
    if (Loaded) return;
    const mod = await import("./mode-toggle.client");
    setLoaded(() => mod.default as React.ComponentType);
  };

  if (Loaded) {
    const Cmp = Loaded as React.ComponentType;
    return <Cmp />;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Toggle theme"
      className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-transparent hover:bg-muted text-muted-foreground"
      title="Toggle theme"
    >
      <span className="text-xs">Theme</span>
    </button>
  );
}
