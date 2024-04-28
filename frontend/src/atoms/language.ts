import { LanguageKeys } from "@/i18n/lang";
import { atomWithLocalStorage } from "@/atoms";

export const languageAtom = atomWithLocalStorage<LanguageKeys>(
  "language",
  "en_CA",
);
