import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { userAtom } from "@/atoms/auth";
import { computedTheme, systemThemeAtom, themeAtom } from "@/atoms/theme";

import * as Public from "./public";
import * as Authenticated from "./authenticated";

const Layout = () => {
  const user = useAtomValue(userAtom);

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

  if (user) {
    return <Authenticated.Layout />;
  } else {
    return <Public.Layout />;
  }
};

export default Layout;

export { Public, Authenticated };
