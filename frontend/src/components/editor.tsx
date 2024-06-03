import MonacoEditor from "@monaco-editor/react";
import { useAtomValue } from "jotai";

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
import { computedTheme } from "@/atoms/theme";

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

const Editor: React.FC<Props> = ({ value, onChange, ...props }) => {
  const theme = useAtomValue(computedTheme);

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
        theme: theme === "light" ? "vs" : "vs-dark",
      }}
      className="border shadow"
    />
  );
};

export default Editor;
