import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import Utc from "dayjs/plugin/utc";

dayjs.extend(LocalizedFormat);
dayjs.extend(Utc);
