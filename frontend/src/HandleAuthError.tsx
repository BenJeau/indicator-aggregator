import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/i18n";

const HandleAuthError: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const authError = search.get("authError");

    if (authError) {
      let description = t("auth.error.token.missing");

      if (authError === "disabled") {
        description = t("auth.error.disabled");
      } else if (authError === "invalidToken") {
        description = t("auth.error.token.invalid");
      }

      toast({
        title: t("auth.error.title"),
        description,
      });

      navigate({
        to: "/",
      });
    }
  }, [toast, navigate, t]);

  return null;
};

export default HandleAuthError;
