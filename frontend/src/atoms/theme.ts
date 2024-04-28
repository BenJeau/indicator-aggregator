import { Computer, LucideIcon, Moon, Sun } from "lucide-react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

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

export const useUpdateTheme = () => {
  const rawTheme = useAtomValue(themeAtom);
  const theme = useAtomValue(computedTheme);
  const setSystemTheme = useSetAtom(systemThemeAtom);

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", ({ matches }) => {
        if (rawTheme !== "system") return;
        if (matches) {
          setSystemTheme("dark");
        } else {
          setSystemTheme("light");
        }
      });
  }, [setSystemTheme, rawTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return null;
};
