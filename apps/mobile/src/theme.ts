// src/theme.ts
import { useColorScheme } from "react-native";

export function useTheme() {
  const isDark = useColorScheme() === "dark";

  return {
    isDark,

    bg: isDark
      ? (["#0b1220", "#111b2e"] as [string, string])
      : (["#e9f3ff", "#ffffff"] as [string, string]),

    card: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",

    text: isDark ? "#e2e8f0" : "#0f172a",
    text2: isDark ? "#94a3b8" : "#64748b",

    accent: isDark ? "#06b6d4" : "#0284c7",
  };
}
