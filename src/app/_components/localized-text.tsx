"use client";

import { useEffect, useState } from "react";

function getCurrentLang() {
  return document.documentElement.classList.contains("lang-zh") ? "zh" : "en";
}

export default function LocalizedText({
  en,
  zh,
  className,
}: {
  en: string;
  zh: string;
  className?: string;
}) {
  const [lang, setLang] = useState<"en" | "zh">("en");

  useEffect(() => {
    const root = document.documentElement;
    const syncLang = () => setLang(getCurrentLang());

    syncLang();

    const observer = new MutationObserver(syncLang);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "lang"] });

    return () => observer.disconnect();
  }, []);

  return <span className={className}>{lang === "zh" ? zh : en}</span>;
}
