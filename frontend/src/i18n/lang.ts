import en from "./en_CA.json";
import fr from "./fr_CA.json";

export type TransId = keyof typeof en & keyof typeof fr;
export type TransFile = Record<TransId, string>;

export type LanguageKeys = "en_CA" | "fr_CA";

export type Languages = Record<
  LanguageKeys,
  {
    file: TransFile;
    lang: string;
    short: string;
    other: LanguageKeys;
  }
>;

export const languages: Languages = {
  en_CA: { file: en, lang: "english", short: "en", other: "fr_CA" },
  fr_CA: { file: fr, lang: "français", short: "fr", other: "en_CA" },
};

export interface Language {
  code: LanguageKeys;
  lang: Languages[LanguageKeys];
}
