import { useEffect, useState } from "react";
import { Sun, MoonStar } from "lucide-react";
interface ToggleThemeProps {
  className?: string;
}
function ToggleTheme({ className }: ToggleThemeProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return document.documentElement.classList.contains("dark");
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
      className={`z-10 inline-flex h-7 w-12 items-center border p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900 ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-200"
      } ${className ?? ""}`}
      onClick={() => setIsDark((v) => !v)}
    >
      <span
        className={`inline-flex h-5 w-5 items-center justify-center bg-white shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-5" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5 text-gray-500" />
        ) : (
          <MoonStar className="h-3.5 w-3.5 text-gray-600" />
        )}
      </span>
    </button>
  );
}

export default ToggleTheme;
