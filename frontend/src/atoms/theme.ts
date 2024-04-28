import { Computer, LucideIcon, Moon, Sun } from "lucide-react";
import { atom } from "jotai";

import { atomWithLocalStorage } from "@/atoms";

const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

type SystemTheme = "dark" | "light";
type Theme = SystemTheme | "system";

export const themeAtom = atomWithLocalStorage<Theme>("theme", "system");
export const systemThemeAtom = atom<Theme>(getSystemTheme());

export const computedTheme = atom((get) => {
  const theme = get(themeAtom);

  if (theme !== "system") {
    return theme;
  }

  return get(systemThemeAtom);
});

export const ThemeCycle: { [key in Theme]: Theme } = {
  dark: "light",
  light: "system",
  system: "dark",
};

export const ThemeIcon: { [key in Theme]: LucideIcon } = {
  dark: Moon,
  light: Sun,
  system: Computer,
};
