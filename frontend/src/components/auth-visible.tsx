import { useAtomValue } from "jotai";

import { userAtom } from "@/atoms/auth";
import { userHasRoles } from "@/lib/auth";

interface Props {
  roles: string[];
}

const AuthVisible: React.FC<React.PropsWithChildren<Props>> = ({
  roles,
  children,
}) => {
  const user = useAtomValue(userAtom);

  if (user && !userHasRoles(user, roles)) {
    return null;
  }

  return children;
};

export default AuthVisible;
