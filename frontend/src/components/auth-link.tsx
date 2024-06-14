import { Link, LinkProps } from "@tanstack/react-router";
import { useAtomValue } from "jotai";

import { userAtom } from "@/atoms/auth";
import { userHasRoles } from "@/lib/auth";

interface Props
  extends LinkProps,
    Pick<React.HTMLAttributes<HTMLAnchorElement>, "title"> {
  roles?: string[];
}

const AuthLink: React.FC<Props> = ({ roles = [], ...props }) => {
  const user = useAtomValue(userAtom);

  if (user && !userHasRoles(user, roles)) {
    return <>{props.children}</>;
  }

  return <Link {...props} />;
};

export default AuthLink;
