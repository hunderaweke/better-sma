import { useEffect, useState } from "react";

function ToggleTheme() {
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
      className="mt-6 px-3 py-2 rounded bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
      onClick={() => setIsDark((v) => !v)}
    >
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}

export default ToggleTheme;
