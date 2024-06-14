import { TransId, useTranslation } from "@/i18n";

interface Props extends Record<string, React.ReactNode> {
  id: TransId;
}

const valueRegex = /{([^}]+)}/;

const Text: React.FC<Props> = ({ id, ...props }) => {
  const { t } = useTranslation();

  const text = t(id);

  if (Object.values(props).length === 0 || !valueRegex.test(text)) {
    return text;
  }

  return text.split(valueRegex).map((part) => {
    if (part in props) {
      return props[part];
    }
    return part;
  });
};

export default Text;
