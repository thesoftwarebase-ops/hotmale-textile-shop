"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAdminTransition } from "./AdminTransition";

function NavIcon({ name }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    account: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    homepage: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    catalogue: (
      <>
        <rect x="3" y="3" width="8" height="6" rx="1" />
        <rect x="13" y="3" width="8" height="4" rx="1" />
        <rect x="13" y="9" width="8" height="5" rx="1" />
        <rect x="3" y="11" width="8" height="10" rx="1" />
        <rect x="13" y="16" width="8" height="5" rx="1" />
      </>
    ),
    cta: (
      <>
        <path d="M4 9h16" />
        <path d="M4 15h10" />
        <path d="m17 12 3 3-3 3" />
      </>
    ),
    stores: (
      <>
        <path d="M4 9h16l-1 11H5L4 9Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    pages: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v4h4" />
        <path d="M10 12h6M10 16h6" />
      </>
    ),
    navbar: (
      <>
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h11" />
      </>
    ),
    footer: (
      <>
        <path d="M3 5h18v14H3z" />
        <path d="M3 15h18" />
        <path d="M7 9h6" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      {paths[name]}
    </svg>
  );
}

function Chevron({ open }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function AdminNav({
  label,
  cms,
  dashboard,
  account,
  onNavigate,
}) {
  const pathname = usePathname();
  const { navigate } = useAdminTransition();
  const [homepageOpen, setHomepageOpen] = useState(null);

  const homepageActive =
    pathname === "/admin/content/homepage" ||
    pathname.startsWith("/admin/content/homepage/");
  const expanded = homepageOpen ?? homepageActive;

  const groups = [
    {
      label: cms.navGroups.workspace,
      items: [
        {
          href: "/admin/dashboard",
          label: dashboard,
          icon: "dashboard",
          exact: true,
        },
        {
          href: "/admin/settings",
          label: account,
          icon: "account",
        },
      ],
    },
    {
      label: cms.navGroups.content,
      items: [
        {
          href: "/admin/content/homepage",
          label: cms.nav.homepage,
          icon: "homepage",
          expandable: true,
          children: [
            {
              href: "/admin/content/homepage/hero",
              label: cms.homepage.sections.hero.title,
            },
            {
              href: "/admin/content/homepage/offers",
              label: cms.homepage.sections.offers.title,
            },
            {
              href: "/admin/content/homepage/featured",
              label: cms.homepage.sections.featured.title,
            },
            {
              href: "/admin/content/homepage/featured-categories",
              label: cms.homepage.sections["featured-categories"].title,
            },
            {
              href: "/admin/content/homepage/store-band",
              label: cms.homepage.sections["store-band"].title,
            },
            {
              href: "/admin/content/homepage/faq",
              label: cms.homepage.sections.faq.title,
            },
          ],
        },
        {
          href: "/admin/content/pages",
          label: cms.nav.pages,
          icon: "pages",
        },
      ],
    },
    {
      label: cms.navGroups.common,
      items: [
        {
          href: "/admin/content/common/cta",
          label: cms.common.nav.cta,
          icon: "cta",
        },
        {
          href: "/admin/content/common/navbar",
          label: cms.common.nav.navbar,
          icon: "navbar",
        },
        {
          href: "/admin/content/common/footer",
          label: cms.common.nav.footer,
          icon: "footer",
        },
      ],
    },
    {
      label: cms.navGroups.catalogue,
      items: [
        {
          href: "/admin/catalogue",
          label: cms.catalogue.title,
          icon: "catalogue",
        },
        {
          href: "/admin/stores",
          label: cms.nav.stores,
          icon: "stores",
        },
      ],
    },
  ];

  function handleClick(event, href) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onNavigate?.();
    navigate(href);
  }

  return (
    <nav aria-label={label} className="flex flex-col gap-7">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3.5 text-[9px] font-bold uppercase tracking-[0.3em] text-muted/80">
            {group.label}
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

              return (
                <div key={item.href}>
                  <div
                    className={`group flex min-h-[48px] items-center rounded-sm transition-all duration-200 ${
                      active
                        ? "bg-gold text-ink shadow-[0_10px_30px_-14px_rgba(201,162,83,0.7)]"
                        : "text-silver hover:bg-white/[0.045] hover:text-cream"
                    }`}
                  >
                    <Link
                      href={item.href}
                      onClick={(event) => handleClick(event, item.href)}
                      aria-current={active ? "page" : undefined}
                      className="flex min-h-[48px] min-w-0 flex-1 items-center gap-3.5 rounded-sm px-3.5 text-[11px] font-bold uppercase tracking-[0.16em]"
                    >
                      <span
                        className={
                          active ? "text-ink" : "text-muted group-hover:text-gold"
                        }
                      >
                        <NavIcon name={item.icon} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>

                    {item.expandable ? (
                      <button
                        type="button"
                        onClick={() => setHomepageOpen(!expanded)}
                        aria-expanded={expanded}
                        aria-label={item.label}
                        className={`mr-2.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm transition-colors ${
                          active
                            ? "text-ink/70 hover:text-ink"
                            : "text-muted hover:text-gold"
                        }`}
                      >
                        <Chevron open={expanded} />
                      </button>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={`mr-3.5 h-1 w-1 rotate-45 transition-colors ${
                          active ? "bg-ink/60" : "bg-transparent"
                        }`}
                      />
                    )}
                  </div>

                  {item.expandable && expanded ? (
                    <ul className="mt-1.5 flex flex-col gap-0.5 border-l border-white/10 pl-4">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={(event) => handleClick(event, child.href)}
                              aria-current={childActive ? "page" : undefined}
                              className={`flex min-h-9 items-center gap-2.5 rounded-sm px-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                                childActive
                                  ? "bg-white/[0.07] text-gold"
                                  : "text-muted hover:bg-white/[0.03] hover:text-silver"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`h-1 w-1 rotate-45 ${
                                  childActive ? "bg-gold" : "bg-white/20"
                                }`}
                              />
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
