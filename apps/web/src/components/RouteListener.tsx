import { usePageStatus } from "@/lib/pageStatus";
import { useEffect } from "react";
import { useLocation } from "react-router";

export default function RouteListener() {
  const location = useLocation();
  const { resetStatus } = usePageStatus();

  useEffect(() => {
    resetStatus();
  }, [location.pathname, resetStatus]);

  return null;
}
