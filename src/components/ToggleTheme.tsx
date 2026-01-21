import { useEffect, useState } from "react";
import { Sun, MoonStar } from "lucide-react";
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
      className="mt-6 px-3 rounded bg-transparent border text-sm dark:text-gray-200"
      onClick={() => setIsDark((v) => !v)}
    >
      {isDark ? (
        <div>
          <Sun className="inline h-4 mx-2" />
          Lights On
        </div>
      ) : (
        <div>
          <MoonStar className="inline h-4 mx-2" />
          Lights Off
        </div>
      )}
    </button>
  );
}

export default ToggleTheme;
