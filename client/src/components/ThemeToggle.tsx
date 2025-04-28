import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") return "dark";
    
    // Check system preference
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    
    return storedTheme as "light" | "dark" || systemPreference;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-zinc-500" />
      ) : (
        <Sun className="h-5 w-5 text-zinc-400" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
