import { createContext, useContext, useEffect, useRef, useState } from "react";

export type PageStatus = null | "loading" | "error";

interface PageStatusStore {
  status: PageStatus;
  resetStatus: () => void;
  setLoadingStatus: () => void;
  setErrorStatus: () => void;
}

export function useCreatePageStatusStore(): PageStatusStore {
  const [status, setStatus] = useState<PageStatus>(null);
  const store: PageStatusStore = {
    status,
    resetStatus: () => {
      setStatus(null);
    },
    setLoadingStatus: () => {
      setStatus("loading");
    },
    setErrorStatus: () => {
      setStatus("error");
    },
  };

  return store;
}

export const PageStatusContext = createContext<PageStatusStore | null>(null);

function usePageStatusContext() {
  const context = useContext(PageStatusContext);

  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }

  return context;
}

export function usePageStatusChanages(
  callback: (current: PageStatus, previous: PageStatus) => void,
) {
  const { status } = usePageStatusContext();
  const previousStatus = useRef(status);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const previous = previousStatus.current;

    if (previous === status) return;

    previousStatus.current = status;
    callbackRef.current(status, previous);
  }, [status]);

  return status;
}

export function usePageStatus() {
  const { resetStatus, setLoadingStatus, setErrorStatus } = usePageStatusContext();
  return { resetStatus, setLoadingStatus, setErrorStatus };
}
