"use client";
import React from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LangToggle() {
  const [lang, setLang] = React.useState<'en' | 'zh'>('en');
  const handleLangToggle = () => {
    setLang((prev) => (prev === 'en' ? 'zh' : 'en'));
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <Button variant="ghost" size="sm" className="w-9 px-0" onClick={handleLangToggle}>
        <Languages className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      {/* <span className="text-xs text-muted-foreground">{lang === 'en' ? 'English' : '中文'}</span> */}
    </div>
  );
}
