"use client";
import React from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "home-language";
export const DEFAULT_HOME_LANGUAGE: "en" | "zh" = "en";

function applyLanguage(lang: "en" | "zh") {
  const root = document.documentElement;
  root.classList.toggle("lang-en", lang === "en");
  root.classList.toggle("lang-zh", lang === "zh");
  root.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
}

export default function LangToggle() {
  const [lang, setLang] = React.useState<"en" | "zh">(DEFAULT_HOME_LANGUAGE);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initialLang = stored === "zh" || stored === "en" ? stored : DEFAULT_HOME_LANGUAGE;
    setLang(initialLang);
    applyLanguage(initialLang);
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, lang);
    applyLanguage(lang);
  }, [lang, mounted]);

  const handleLangToggle = () => {
    setLang((prev) => (prev === "en" ? "zh" : "en"));
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button variant="ghost" size="sm" className="w-9 px-0" onClick={handleLangToggle}>
        <Languages className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <span className="text-[10px] leading-none text-muted-foreground">
        {lang === "en" ? "EN" : "中"}
      </span>
    </div>
  );
}
