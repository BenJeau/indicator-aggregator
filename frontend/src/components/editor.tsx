import { FC } from "react";
import MonacoEditor from "@monaco-editor/react";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

loader.config({ monaco });

import { SourceKind } from "@/types/backendTypes";
import { useTheme } from "@/components/theme-provider";

interface Props {
  value: string;
  onChange?: (value: string) => void;
  sourceKind: SourceKind;
}

const SourceKindLanguageMap: { [key in SourceKind]: string } = {
  [SourceKind.Python]: "python",
  [SourceKind.System]: "rust",
  [SourceKind.JavaScript]: "javascript",
};

export const Editor: FC<Props> = ({ value, onChange, sourceKind }) => {
  const { theme } = useTheme();

  const numberOfLines = value.split("\n").length;

  return (
    <MonacoEditor
      height={numberOfLines * 19}
      language={SourceKindLanguageMap[sourceKind]}
      value={value}
      onChange={(value) => {
        onChange && onChange(value ?? "");
      }}
      options={{
        lineNumbers: "off",
        folding: false,
        minimap: { enabled: false },
        bracketPairColorization: { enabled: true },
        theme: theme === "light" ? "vs" : "vs-dark",
      }}
      className="rounded shadow border"
    />
  );
};
