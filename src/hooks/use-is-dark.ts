"use client";

import { useEffect, useState } from "react";

// Recharts renders raw SVG, so it can't pick up colors via Tailwind's `dark:`
// variant, it needs the actual color value. This mirrors the `dark` class on
// <html> into React state, updating live when ThemeToggle flips it.
export function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
