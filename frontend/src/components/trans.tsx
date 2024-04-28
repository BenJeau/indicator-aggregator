import { TransId, useTranslation } from "@/i18n";

interface Props {
  id: TransId;
}

const Text: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation();

  return t(id);
};

export default Text;
