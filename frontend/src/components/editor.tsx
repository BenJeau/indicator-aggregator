import { FC } from "react";
import MonacoEditor from "@monaco-editor/react";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

import { loader } from "@monaco-editor/react";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/editor/editor.all";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

loader.config({ monaco });

import { SourceKind } from "@/types/backendTypes";
import { useTheme } from "@/components/theme-provider";

type Props = {
  value: string;
  onChange?: (value: string) => void;
} & (
  | {
      sourceKind: SourceKind;
    }
  | {
      language: string;
    }
);

const SourceKindLanguageMap: { [key in SourceKind]: string } = {
  [SourceKind.Python]: "python",
  [SourceKind.System]: "rust",
  [SourceKind.JavaScript]: "javascript",
};

export const Editor: FC<Props> = ({ value, onChange, ...props }) => {
  const { computedTheme } = useTheme();

  const numberOfLines = value.split("\n").length;

  const language =
    "language" in props
      ? props.language
      : SourceKindLanguageMap[props.sourceKind];

  return (
    <MonacoEditor
      height={Math.min(numberOfLines, 15) * 19}
      language={language}
      value={value}
      onChange={(value) => {
        onChange && onChange(value ?? "");
      }}
      options={{
        readOnly: !onChange,
        lineNumbers: "off",
        folding: false,
        minimap: { enabled: false },
        bracketPairColorization: { enabled: true },
        theme: computedTheme === "light" ? "vs" : "vs-dark",
      }}
      className="shadow border"
    />
  );
};
