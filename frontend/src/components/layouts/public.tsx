import { Home, Languages } from "lucide-react";
import { Link, Outlet } from "@tanstack/react-router";
import { useAtom } from "jotai";

import { Button } from "@/components/ui/button";
import { ThemeCycle, ThemeIcon, themeAtom } from "@/atoms/theme";
import Trans from "@/components/trans";
import { useTranslation } from "@/i18n";

export const Layout: React.FC = () => (
  <div className="container relative mx-auto flex min-h-screen flex-col justify-center p-4 dark:text-white">
    <Outlet />
  </div>
);

export const Footer: React.FC<{ showHome?: boolean }> = ({ showHome }) => {
  const [theme, setTheme] = useAtom(themeAtom);
  const { toggle, otherLang } = useTranslation();

  const Icon = ThemeIcon[ThemeCycle[theme]];

  return (
    <>
      <div className="text-sm text-black/50 dark:text-white/50">
        &copy; {new Date().getFullYear()} jeaurond.dev
      </div>
      <div className="flex flex-wrap gap-4">
        {showHome && (
          <Link to="/">
            <Button variant="link" className="gap-2 lowercase">
              <Home size={16} />
              <Trans id="home" />
            </Button>
          </Link>
        )}
        <Button
          variant="link"
          className="gap-2 lowercase"
          onClick={() => {
            setTheme((prev) => ThemeCycle[prev]);
          }}
        >
          <Icon size={16} />
          <span>
            <Trans id="toggle.theme" />
          </span>
        </Button>
        <Button
          variant="link"
          className="gap-2 p-0 text-sm text-black dark:text-white"
          onClick={toggle}
        >
          <Languages size={16} />
          <span className="w-5">{otherLang.lang.short}</span>
        </Button>
      </div>
    </>
  );
};
