import { useEffect, useRef, useState } from "react";
import getVibrantColor from "../utils/color";
import { ChevronDown } from "lucide-react";

type Identity = {
  id: string;
  name: string;
  uniqueString?: string;
};

type Props = {
  identities: Identity[];
  onSelect: (id: string) => void;
  className?: string;
};

export default function IdentityDropdown({
  identities,
  onSelect,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className={`text-left ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full items-center justify-center bg-transparent text-gray-700  dark:text-gray-300 backdrop-blur-xl  dark:border-gray-200"
      >
        <ChevronDown className="dark:text-gray-300 text-gray-800" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-20 w-39 dark:border-gray-300/60 bg-gray-700/50 text-gray-300 dark:bg-white/90 dark:text-gray-800 backdrop-blur-3xl shadow-lg"
        >
          <ul className="max-h-64 overflow-auto">
            {identities.map((i) => {
              const color = getVibrantColor(i.uniqueString ?? i.id);
              return (
                <li key={i.id}>
                  <button
                    role="menuitem"
                    className="flex w-full items-center justify-between text-left hover:bg-gray-500/60 dark:hover:bg-gray-400/50"
                    onClick={() => {
                      onSelect(i.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3 border border-gray-800 border-t-0 w-full">
                      <span
                        className="w-5 h-6"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex flex-col items-start">
                        {i.uniqueString && (
                          <span className="text-[11px]">{i.uniqueString}</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
            {identities.length === 0 && (
              <li className="px-3 py-2 text-sm">No identities</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
