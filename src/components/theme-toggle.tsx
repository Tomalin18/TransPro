"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
      title={theme === "dark" ? "切換至淺色模式" : "切換至深色模式"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-zinc-100" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-800" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

