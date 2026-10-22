"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AppLink from "../transitions/AppLink";
import BrandMark from "../brand/BrandMark";
import InstagramLink from "../social/InstagramLink";

/**
 * Site navbar. Slim utility strip (static, scrolls away) over a sticky
 * main bar with gradient depth, gold hairline and a CTA. Full-screen
 * animated menu on mobile. Hides on scroll down, shows on scroll up.
 * Active link in gold. All copy arrives via props from lib/data.js —
 * nothing hard-coded.
 */
export default function Navbar({ items, brand, ui, social }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < 80 || y < lastY || open);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open ]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const isActive = (href) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex !== -1) {
      const path = href.slice(0, hashIndex) || "/";
      const anchor = href.slice(hashIndex);
      return pathname === path && hash === anchor;
    }
    if (href === "/collections" && pathname.startsWith("/collections")) return true;
    if (href === "/collections" && pathname.startsWith("/products")) return true;
    return pathname === href;
  };

  return (
    <>
      {/* Utility strip — static, scrolls away */}
      <div className="strip-shine hidden border-b border-graphite bg-gradient-to-r from-charcoal via-ink to-charcoal md:block">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] lg:px-8">
          <p className="tagline-sh relative pb-2" aria-label={`${brand.tagline} · ${brand.city}`}>
            <span aria-hidden="true">
              {brand.tagline.split(" ").map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="tagline-word"
                  style={{ animationDelay: `${index * 130}ms` }}
                >
                  {word}{" "}
                </span>
              ))}
              <span className="tagline-word" style={{ animationDelay: "300ms" }}>
                · {brand.city}
              </span>
            </span>
            <span aria-hidden="true" className="brush-draw absolute inset-x-0 bottom-0 flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] shrink-0 rotate-45 bg-gold" />
              <span className="h-[2px] w-full rounded-full bg-gradient-to-r from-gold via-gold-highlight to-transparent" />
            </span>
          </p>
          <span className="flex min-h-[32px] items-center normal-case tracking-normal">
            <InstagramLink
              handle={social?.instagramHandle}
              url={social?.instagramUrl}
              label={`${brand.name} ${ui.instagramLinkLabel} (${social?.instagramHandle})`}
            />
          </span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b border-graphite bg-gradient-to-b from-charcoal to-ink transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav
          aria-label={ui.primaryNav}
          className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8"
        >
          <AppLink
            href="/"
            aria-label={`${brand.name} ${ui.homeLabel}`}
            className="group relative flex min-h-[44px] min-w-[44px] shrink-0 items-center after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
            onClick={() => setOpen(false)}
          >
            <BrandMark
              height={72}
              name={brand.name}
              tagline={brand.tagline}
              logo={brand.logo}
              className="transition-all duration-300 group-hover:scale-[1.05] group-hover:brightness-110"
            />
          </AppLink>

          <ul className="hidden items-center gap-8 md:flex">
            {items.map((item) => (
              <li key={item.href}>
                <AppLink
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`group relative py-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-300 ${
                    isActive(item.href)
                      ? "text-gold after:scale-x-100"
                      : "text-cream after:scale-x-0 hover:text-gold-highlight hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </AppLink>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <AppLink
              href="/stores"
              className="inline-flex min-h-[44px] items-center rounded-sm border border-gold bg-gold px-5 text-xs font-bold uppercase tracking-[0.12em] text-ink shadow-[0_0_24px_rgba(230,196,64,0.25)] transition-all duration-300 hover:bg-gold-highlight hover:shadow-[0_0_32px_rgba(230,196,64,0.4)]"
            >
              {ui.findStore}
            </AppLink>
          </div>

          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-cream transition-colors hover:text-gold-highlight md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? ui.closeMenu : ui.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className="relative block h-4 w-6">
              <span
                className={`absolute left-0 top-0 h-0.5 w-full bg-current transition-transform duration-300 ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-full bg-current transition-opacity duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-full bg-current transition-transform duration-300 ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </nav>
        {/* Gold hairline under the bar */}
        <div
          aria-hidden="true"
          className="h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
        />
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 top-24 z-40 flex flex-col bg-ink transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav aria-label={ui.mobileNav}>
          <ul className="flex flex-col px-6 py-8">
            {items.map((item, index) => (
              <li
                key={item.href}
                className={`border-b border-graphite transition-all duration-300 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${index * 60}ms` : "0ms" }}
              >
                <AppLink
                  href={item.href}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`group flex min-h-[64px] items-center gap-3 font-display text-4xl font-bold uppercase transition-all duration-300 hover:translate-x-2 ${
                    isActive(item.href)
                      ? "text-gold"
                      : "text-cream hover:text-gold-highlight"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-px w-0 bg-gold transition-all duration-300 group-hover:w-8 ${
                      isActive(item.href) ? "w-8" : ""
                    }`}
                  />
                  {item.label}
                </AppLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-4 px-6 pb-10">
          <AppLink
            href="/stores"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className="inline-flex min-h-[48px] items-center justify-center rounded-sm bg-gold text-sm font-bold uppercase tracking-[0.12em] text-ink"
          >
            {ui.findStore}
          </AppLink>
          <p className="text-center text-xs uppercase tracking-[0.12em] text-muted">
            {brand.tagline} · {brand.city}
          </p>
        </div>
      </div>
    </>
  );
}

