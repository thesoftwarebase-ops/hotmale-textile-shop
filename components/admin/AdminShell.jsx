"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "../brand/BrandMark";
import AdminNav from "./AdminNav";
import SignOutButton from "./SignOutButton";
import AdminLoadingScreen from "./AdminLoadingScreen";
import AdminTransition from "./AdminTransition";
import { AdminAuthContext } from "./AdminAuthContext";
import { clearToken, getToken } from "../../lib/client-auth";

export default function AdminShell({ admin, brand, children }) {
  const router = useRouter();
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = admin.shell;

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const token = getToken();
      if (!token) {
        if (active) {
          setStatus("redirecting");
          router.replace("/admin");
        }
        return;
      }

      try {
        const response = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("unauthorized");
        const data = await response.json();
        if (!active) return;
        setUser(data.user);
        setStatus("authenticated");
      } catch {
        if (!active) return;
        clearToken();
        setStatus("redirecting");
        router.replace("/admin");
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function refreshSession() {
    const token = getToken();
    if (!token) {
      setStatus("redirecting");
      router.replace("/admin");
      return;
    }

    const response = await fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      clearToken();
      setStatus("redirecting");
      router.replace("/admin");
      return;
    }

    const data = await response.json();
    setUser(data.user);
  }

  if (status !== "authenticated") {
    return (
      <AdminLoadingScreen
        visible
        brand={brand}
        status={copy.checkingSession}
        tagline={admin.brandLabel}
      />
    );
  }

  return (
    <AdminAuthContext.Provider value={{ user, refreshSession }}>
      <AdminTransition
        brand={brand}
        status={copy.loadingStatus}
        tagline={admin.brandLabel}
      >
        <div className="min-h-svh bg-ink text-cream lg:pl-[17.5rem]">
          {menuOpen ? (
            <button
              type="button"
              aria-label={copy.menuClose}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
            />
          ) : null}

          <aside
            id="admin-sidebar"
            aria-label={copy.navigation}
            className={`fixed inset-y-0 left-0 z-50 w-[17.5rem] max-w-[86vw] border-r border-white/10 bg-[#080808] shadow-2xl transition-transform duration-300 ease-out lg:visible lg:translate-x-0 lg:shadow-none ${
              menuOpen
                ? "visible translate-x-0"
                : "invisible -translate-x-full"
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
            />
            <div className="flex h-full flex-col">
              <div className="relative flex min-h-[92px] items-center border-b border-white/10 px-5">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <BrandMark
                    height={34}
                    name={brand.name}
                    tagline={brand.tagline}
                    logo={brand.logo}
                  />
                </Link>
                <span className="ml-3 border-l border-white/10 pl-3 text-[9px] font-bold uppercase leading-tight tracking-[0.24em] text-muted">
                  {admin.brandLabel}
                </span>
                <button
                  type="button"
                  aria-label={copy.menuClose}
                  onClick={() => setMenuOpen(false)}
                  className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm border border-white/10 text-silver transition-colors hover:border-gold/50 hover:text-gold lg:hidden"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="h-5 w-5"
                  >
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <div className="scroll-slim flex-1 overflow-y-auto overscroll-contain px-4 py-7">
                <AdminNav
                  label={copy.navigation}
                  cms={admin.cms}
                  dashboard={admin.dashboard.navLabel}
                  account={admin.account.navLabel}
                  onNavigate={() => setMenuOpen(false)}
                />
              </div>

              <div className="border-t border-white/10 px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted/60">
                  {brand.city} · {brand.region}
                </p>
                <Link
                  href="/"
                  className="mt-3 flex min-h-[42px] items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:text-gold"
                >
                  {copy.viewSite}
                  <span aria-hidden="true">↗</span>
                </Link>
                <div className="mt-1 border-t border-white/[0.07] pt-1">
                  <SignOutButton copy={copy} />
                </div>
              </div>
            </div>
          </aside>

          <div className="flex min-h-svh flex-col">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md lg:hidden">
              <div className="flex h-[68px] items-center justify-between gap-4 px-4">
                <Link
                  href="/admin/dashboard"
                  className="flex min-w-0 items-center gap-3"
                >
                  <BrandMark
                    height={30}
                    name={brand.name}
                    tagline={brand.tagline}
                    logo={brand.logo}
                  />
                  <span className="border-l border-white/10 pl-3 text-[8px] font-bold uppercase leading-tight tracking-[0.22em] text-muted">
                    {admin.brandLabel}
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label={copy.menuOpen}
                  aria-expanded={menuOpen}
                  aria-controls="admin-sidebar"
                  onClick={() => setMenuOpen(true)}
                  className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-gold text-ink shadow-[0_8px_24px_-10px_rgba(201,162,83,0.8)] transition-transform active:scale-95"
                >
                  <span
                    aria-hidden="true"
                    className="flex w-[18px] flex-col items-end gap-[4px]"
                  >
                    <span className="h-[1.5px] w-full bg-current" />
                    <span className="h-[1.5px] w-full bg-current" />
                    <span className="h-[1.5px] w-[11px] bg-current transition-all group-hover:w-full" />
                  </span>
                </button>
              </div>
            </header>

            <main
              id="admin-main"
              className="relative flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-12"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,83,0.08),transparent_65%)]"
              />
              <div className="relative mx-auto w-full max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </AdminTransition>
    </AdminAuthContext.Provider>
  );
}
