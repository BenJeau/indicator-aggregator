import { Languages, languages } from "@/i18n/lang";

const findDuplicates = (arr: string[]) =>
  arr.filter(
    (
      (s) => (v) =>
        s.has(v) || !s.add(v)
    )(new Set()),
  );

const findDuplicateTranslations = (languages: Languages) => {
  let foundDuplicateValues = false;

  Object.values(languages).forEach((lang) => {
    const values = Object.values(lang.file);

    const duplicateValues = findDuplicates(values.map((i) => i.toLowerCase()));

    if (duplicateValues.length > 0) {
      foundDuplicateValues = true;
      console.error(
        `${duplicateValues.length.toString()} duplicate values are in ${lang.lang}:`,
        duplicateValues,
      );
    }
  });

  if (foundDuplicateValues) {
    console.error("findDuplicateTranslations check: FAIL\n");
  } else {
    console.log("There a no duplicate values in the en_CA and fr_CA files!");
    console.log("findDuplicateTranslations check: SUCCESS\n");
  }
};

findDuplicateTranslations(languages);
