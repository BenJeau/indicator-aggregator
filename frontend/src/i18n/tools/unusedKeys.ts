import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

import { languages } from "@/i18n/lang";
import ignoredKeys from "@/i18n/ignoredKeys.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findUnusedKeys = (filesContent: string[], searchableKeys: string[]) => {
  const unusedKeys: string[] = [];

  searchableKeys.forEach((key) => {
    const result = filesContent.some(
      (content) =>
        content.includes(`"${key}"`) ||
        content.includes(`'${key}'`) ||
        content.includes(`\`${key}\``) ||
        ignoredKeys.includes(key),
    );

    if (!result && !unusedKeys.includes(key)) unusedKeys.push(key);
  });

  if (unusedKeys.length) {
    console.error(
      `${unusedKeys.length.toString()} keys that are unused in the project found`,
      unusedKeys,
    );
    console.error("findUnusedKeys check: FAIL\n");
    process.exit(1);
  } else {
    console.log("All keys in en_CA and fr_CA files are used in the project!");
    console.log("findUnusedKeys check: SUCCESS\n");
  }

  return unusedKeys;
};

const getFileContent = async (dir: string, ext: string[]) => {
  const files = await Promise.all(
    ext.map((extension) => getFilesInDirectory(dir, extension)),
  );

  return Promise.all(
    files.flat().map((i) => fs.readFile(i).then((buffer) => buffer.toString())),
  );
};

const getFilesInDirectory = async (dir: string, ext: string) => {
  let files: string[] = [];

  const filesFromDirectory = await fs.readdir(dir);
  await Promise.all(
    filesFromDirectory.map(async (file) => {
      const filePath = path.join(dir, file);
      const stat = await fs.lstat(filePath);
      if (stat.isDirectory()) {
        const nestedFiles = await getFilesInDirectory(filePath, ext);
        files = files.concat(nestedFiles);
      } else if (path.extname(file) === ext) {
        files.push(filePath);
      }
    }),
  );

  return files;
};

const filesContent = await getFileContent(path.join(__dirname, "../.."), [
  ".tsx",
  ".ts",
]);

const keys = Object.values(languages)
  .map((lang) => Object.keys(lang.file))
  .flat()
  .sort();

findUnusedKeys(filesContent, keys);
