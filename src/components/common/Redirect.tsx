import { useEffect } from "react";
import type { Route } from "type-route";
import { routes } from "../../routes";

type RedirectProps = {
  to: () => Route<typeof routes>;
};

export function Redirect({ to }: RedirectProps) {
  useEffect(() => {
    to().push();
  }, [to]);

  return null;
}
