import { SimpleError } from "@/components";
import { TransId } from "@/i18n";

interface Props {
  title?: TransId;
  data?: string;
}

const NotFound: React.FC<Props> = ({ title = "page.not.found", data }) => (
  <SimpleError
    emoji="(ಥ﹏ಥ)"
    title="404"
    subtitle={title}
    data={data ?? window.location.pathname}
    description="page.not.found.description"
  />
);

export default NotFound;
