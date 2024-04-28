import { TransId, useTranslation } from "@/i18n";

interface Props extends Record<string, React.ReactNode> {
  id: TransId;
}

const valueRegex = /{([^}]+)}/g;

const Text: React.FC<Props> = ({ id, ...props }) => {
  const { t } = useTranslation();

  const text = t(id);

  if (Object.values(props).length === 0 || !text.match(valueRegex)) {
    return text;
  }

  return Object.keys(props).reduce((prev, key) => {
    return prev.split(`{${key}}`).map((part, i, arr) => {
      return i < arr.length - 1 ? (
        <>
          {part}
          {props[key]}
        </>
      ) : (
        part
      );
    });
  }, text);
};

export default Text;
