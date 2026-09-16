"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type Theme = "light" | "dark";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { dict } = useLocale();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") {
      setTheme(current);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage môže byť zablokovaný (súkromné okno) — téma sa jednoducho neuloží
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dict.theme.toggleLabel}
      className={[
        "font-mono text-11 uppercase tracking-[0.06em] text-ink-muted hover:text-ink transition-opacity duration-150",
        className,
      ].join(" ")}
    >
      {theme === "dark" ? dict.theme.light : dict.theme.dark}
    </button>
  );
}
