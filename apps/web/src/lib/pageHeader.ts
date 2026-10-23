import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface PageHeaderConfig {
  title: string;
  actions?: ReactNode;
}

interface PageHeaderStore {
  config: PageHeaderConfig | null;
  owner: string | null;
  subscribe: (listener: () => void) => () => void;
  getConfig: () => PageHeaderConfig | null;
  set: (owner: string, config: PageHeaderConfig) => void;
  clear: (owner: string) => void;
}

export function createPageHeaderStore(): PageHeaderStore {
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const store: PageHeaderStore = {
    config: null,
    owner: null,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getConfig: () => store.config,
    set: (owner, config) => {
      store.owner = owner;
      store.config = config;
      notify();
    },
    clear: (owner) => {
      if (store.owner !== owner) return;
      store.owner = null;
      store.config = null;
      notify();
    },
  };

  return store;
}

export const PageHeaderContext = createContext<PageHeaderStore | null>(null);

function usePageHeaderStore(): PageHeaderStore {
  const store = useContext(PageHeaderContext);
  if (!store) {
    throw new Error("usePageHeader must be used within a PageHeaderProvider");
  }
  return store;
}

export function usePageHeaderConfig(): PageHeaderConfig | null {
  const store = usePageHeaderStore();
  return useSyncExternalStore(store.subscribe, store.getConfig, store.getConfig);
}

export function usePageHeader(config: PageHeaderConfig): void {
  const store = usePageHeaderStore();
  const ownerId = useId();

  useLayoutEffect(() => {
    store.set(ownerId, config);
    return () => {
      store.clear(ownerId);
    };
  });
}
