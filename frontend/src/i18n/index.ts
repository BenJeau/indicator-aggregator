import { useCallback, useMemo } from "react";
import { useAtom } from "jotai";

import { languageAtom } from "@/atoms/language";

import { Language, languages, TransId } from "./lang";

export const useTranslation = () => {
  const [lang, setLang] = useAtom(languageAtom);

  const otherLang: Language = useMemo(() => {
    const other = languages[lang].other;
    return { code: other, lang: languages[other] };
  }, [lang]);
  const t = useCallback((id: TransId) => languages[lang].file[id], [lang]);
  const toggle = useCallback(() => {
    setLang((prev) => languages[prev].other);
  }, [setLang]);

  return { lang: languages[lang], t, toggle, otherLang };
};

export type { TransId };
