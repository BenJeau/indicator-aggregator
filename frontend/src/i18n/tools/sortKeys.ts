import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

import { languages, Languages, TransId } from "@/i18n/lang";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const writeNewFiles = (languages: Languages, keys: string[]) => {
  Object.entries(languages).forEach(([code, lang]) => {
    const newFile: Record<string, string> = {};

    keys.forEach((key) => {
      newFile[key] = lang.file[key as TransId];
    });

    fs.writeFileSync(
      path.join(__dirname, `../${code}.json`),
      JSON.stringify(newFile, null, 2) + os.EOL,
      "utf8",
    );
  });
};

console.log("\n************ Starting i18n sorting ****************");

const keys = Object.values(languages)
  .map((lang) => Object.keys(lang.file))
  .flat()
  .sort();
const uniqueKeys = [...new Set(keys)];

writeNewFiles(languages, uniqueKeys);

console.log("************ Done i18n sorting     ****************\n");
