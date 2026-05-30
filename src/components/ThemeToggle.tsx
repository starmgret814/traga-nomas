"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Contrast } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "nav-dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    root.classList.remove("dark", "nav-dark");
    if (t !== "light") {
      root.classList.add(t);
    }
  };

  const cycleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "nav-dark" : "light";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  };

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Contrast;

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl",
        "bg-[var(--secondary)] hover:bg-[var(--muted)]",
        "text-[var(--foreground)] transition-all duration-200",
        "active:scale-95"
      )}
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
