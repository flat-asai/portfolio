"use client";

import { useTheme } from "next-themes";
import { useAccessibility } from "@/components/ui/AccessibilityProvider";
import { Switch, Label } from "@/components/ui";
import { Play, Pause, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export const AccessibilityControls = () => {
  const { theme, setTheme } = useTheme();
  const { animationsEnabled, toggleAnimations } = useAccessibility();
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // クライアントサイドでのみテーマを確認
  useEffect(() => {
    setMounted(true);
    setIsDarkMode(theme === "dark");
  }, [theme]);

  // テーマ切り替え関数vg
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
    setIsDarkMode(!isDarkMode);
  };

  // サーバーサイドレンダリング時は何も表示しない
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 max-md:justify-end">
      <div className="flex items-center space-x-2">
        <Switch
          id="animation-mode"
          checked={animationsEnabled}
          onCheckedChange={toggleAnimations}
          aria-label={
            animationsEnabled ? "アニメーションをオフにする" : "アニメーションをオンにする"
          }
        />
        <Label htmlFor="animation-mode" className="hidden lg:inline-block">
          アニメーション {animationsEnabled ? "オン" : "オフ"}
        </Label>
        {animationsEnabled ? (
          <Play className="h-4 w-4 lg:hidden" />
        ) : (
          <Pause className="h-4 w-4 lg:hidden" />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="theme-mode"
          checked={isDarkMode}
          onCheckedChange={toggleTheme}
          aria-label={isDarkMode ? "ライトモードに切り替える" : "ダークモードに切り替える"}
        />
        <Label htmlFor="theme-mode" className="hidden lg:inline-block">
          {isDarkMode ? "ダーク" : "ライト"}モード
        </Label>
        {isDarkMode ? (
          <Moon className="h-4 w-4 lg:hidden" />
        ) : (
          <Sun className="h-4 w-4 lg:hidden" />
        )}
      </div>
    </div>
  );
};
