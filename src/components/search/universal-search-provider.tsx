"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type UniversalSearchContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const UniversalSearchContext =
  createContext<UniversalSearchContextValue | null>(null);

/**
 * Project 075 — Command Palette open state + ⌘K / Ctrl+K shortcut.
 * Mounted once in the authenticated Workspace shell.
 */
export function UniversalSearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return;
      if (!(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle }),
    [open, toggle],
  );

  return (
    <UniversalSearchContext.Provider value={value}>
      {children}
    </UniversalSearchContext.Provider>
  );
}

export function useUniversalSearch() {
  const context = useContext(UniversalSearchContext);
  if (!context) {
    throw new Error(
      "useUniversalSearch must be used within UniversalSearchProvider",
    );
  }
  return context;
}

export function useUniversalSearchOptional() {
  return useContext(UniversalSearchContext);
}
