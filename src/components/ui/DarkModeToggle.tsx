"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({
  className = "",
}: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors ${className}`}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
