import { useEffect, useState } from "react";
import { Sun, MoonStar, SparklesIcon } from "lucide-react";
import type { ToggleThemeProps } from "../types";

function ToggleTheme({ className }: ToggleThemeProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      className={`z-10 inline-flex h-7 w-12 items-center border p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-slate-200 dark:focus-visible:ring-offset-slate-900 ${
        isDark ? "border-gray-200 bg-gray-800" : "border-gray-800 bg-gray-200"
      } ${className ?? ""}`}
      onClick={() => setIsDark((v) => !v)}
    >
      <SparklesIcon
        className={`inline-flex h-5 w-5 p-0.5 items-center justify-center shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-5 bg-white" : "translate-x-0 bg-gray-800"
        }`}
      >
        {isDark ? (
          <Sun className="h-1 aspect-square text-gray-800" />
        ) : (
          <MoonStar className="h-2 w-2 text-gray-200" />
        )}
      </SparklesIcon>
    </button>
  );
}

export default ToggleTheme;
