"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AdminLoadingScreen from "./AdminLoadingScreen";

const MIN_VISIBLE_MS = 400;
const SAFETY_MS = 5000;
const AdminTransitionContext = createContext(null);

export function useAdminTransition() {
  const value = useContext(AdminTransitionContext);
  if (!value) {
    throw new Error("useAdminTransition must be used inside the admin shell.");
  }
  return value;
}

export default function AdminTransition({
  brand,
  status,
  tagline,
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const active = useRef(false);
  const startedAt = useRef(0);
  const hideTimer = useRef(null);
  const safetyTimer = useRef(null);

  const hide = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    const remaining = Math.max(
      0,
      MIN_VISIBLE_MS - (Date.now() - startedAt.current),
    );
    clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setVisible(false), remaining);
  }, []);

  useEffect(() => {
    if (!active.current) return undefined;
    hide();
    return () => clearTimeout(hideTimer.current);
  }, [pathname, hide]);

  useEffect(
    () => () => {
      clearTimeout(hideTimer.current);
      clearTimeout(safetyTimer.current);
    },
    [],
  );

  const navigate = useCallback(
    (href, { replace = false } = {}) => {
      if (typeof href !== "string" || !href.startsWith("/")) {
        router.push(href);
        return;
      }
      if (href === pathname) return;

      active.current = true;
      startedAt.current = Date.now();
      setVisible(true);
      clearTimeout(safetyTimer.current);
      safetyTimer.current = window.setTimeout(() => {
        active.current = false;
        setVisible(false);
      }, SAFETY_MS);

      if (replace) router.replace(href);
      else router.push(href);
    },
    [pathname, router],
  );

  return (
    <AdminTransitionContext.Provider value={{ navigate, loading: visible }}>
      {children}
      <AdminLoadingScreen
        visible={visible}
        brand={brand}
        status={status}
        tagline={tagline}
      />
    </AdminTransitionContext.Provider>
  );
}
