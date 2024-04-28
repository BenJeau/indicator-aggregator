import { useAtomValue } from "jotai";

import { userAtom } from "@/atoms/auth";
import { useUpdateTheme } from "@/atoms/theme";

import * as Public from "./public";
import * as Authenticated from "./authenticated";

const Layout = () => {
  const user = useAtomValue(userAtom);
  useUpdateTheme();

  if (user) {
    return <Authenticated.Layout />;
  } else {
    return <Public.Layout />;
  }
};

export default Layout;

export { Public, Authenticated };
