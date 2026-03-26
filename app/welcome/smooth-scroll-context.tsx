import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "demo-smooth-scroll";

type SmoothScrollContextValue = {
  enabled: boolean;
  setEnabled: (next: boolean) => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(
  null,
);

export function useDemoSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) {
    throw new Error(
      "useDemoSmoothScroll must be used within SmoothScrollProvider",
    );
  }
  return ctx;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v !== null) setEnabledState(v === "true");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* ignore */
    }
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.style.scrollBehavior = enabled ? "smooth" : "auto";
    return () => {
      root.style.scrollBehavior = "";
    };
  }, [enabled, ready]);

  const value = useMemo(
    () => ({ enabled, setEnabled }),
    [enabled, setEnabled],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
