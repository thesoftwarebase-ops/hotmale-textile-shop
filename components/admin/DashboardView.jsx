"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminTransition } from "./AdminTransition";
import { useAdminAuth } from "./AdminAuthContext";
import { authFetch, clearToken } from "../../lib/client-auth";

function formatDate(value, locale, options) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function ActionIcon({ name }) {
  const paths = {
    contact: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    account: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    site: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    content: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      {paths[name]}
    </svg>
  );
}

export default function DashboardView({ copy, locale }) {
  const { user } = useAdminAuth();
  const { navigate } = useAdminTransition();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadEnquiries() {
      try {
        const response = await authFetch("/api/admin/enquiries", {
          cache: "no-store",
        });
        if (response.status === 401) {
          clearToken();
          router.replace("/admin");
          return;
        }
        if (!response.ok) throw new Error("request_failed");
        const payload = await response.json();
        if (!active) return;
        setData(payload);
        setStatus("ready");
      } catch {
        if (active) {
          setData(null);
          setStatus("error");
        }
      }
    }

    loadEnquiries();
    return () => {
      active = false;
    };
  }, [refreshKey, router]);

  function refresh() {
    if (status === "loading" || status === "refreshing") return;
    setStatus(data ? "refreshing" : "loading");
    setRefreshKey((key) => key + 1);
  }

  function handleInternalClick(event, href) {
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
    navigate(href);
  }

  const enquiries = data?.enquiries ?? [];
  const latest = enquiries[0];
  const latestDate = latest
    ? formatDate(latest.createdAt, locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const total = data?.total ?? 0;
  const lastSevenDays = data?.lastSevenDays ?? 0;
  const sevenDayShare = total
    ? Math.min(100, Math.round((lastSevenDays / total) * 100))
    : 0;
  const number = new Intl.NumberFormat(locale);
  const showFullError = status === "error" && !data;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between lg:pb-9">
        <div>
          <p className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
            <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl break-words font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-cream sm:text-5xl">
            {copy.greeting},{" "}
            <span className="text-gold">{user.name}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-silver">
            {copy.intro}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={status === "loading" || status === "refreshing"}
          className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 self-start rounded-sm border border-white/10 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 ${
              status === "refreshing" ? "animate-spin" : ""
            }`}
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </svg>
          {status === "refreshing" ? copy.refreshing : copy.refresh}
        </button>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19.5rem] xl:items-start">
        <section
          aria-busy={status === "loading"}
          className="overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b]"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl font-black uppercase tracking-tight text-cream">
                  {copy.enquiriesTitle}
                </h2>
                {data ? (
                  <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.07] px-2 py-1 text-[9px] font-bold tabular-nums text-gold">
                    {number.format(total)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                {copy.enquiriesIntro}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="mt-1 hidden h-2 w-2 shrink-0 rotate-45 border border-gold/40 sm:block"
            />
          </div>

          {status === "loading" ? (
            <div>
              <p className="sr-only" role="status">
                {copy.loading}
              </p>
              <div aria-hidden="true" className="divide-y divide-white/5">
                {[0, 1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className="flex animate-pulse gap-4 p-5 sm:p-6"
                  >
                    <span className="h-10 w-10 shrink-0 rounded-full bg-white/[0.06]" />
                    <span className="flex-1 space-y-3">
                      <span className="block h-3 w-1/3 rounded-sm bg-white/[0.07]" />
                      <span className="block h-2.5 w-1/2 rounded-sm bg-white/[0.05]" />
                      <span className="block h-2.5 w-4/5 rounded-sm bg-white/[0.04]" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {showFullError ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-red-400/20 bg-red-400/[0.06] text-red-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="h-5 w-5"
                >
                  <path d="M12 8v5M12 17h.01" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <p className="mt-4 text-sm text-silver">{copy.error}</p>
              <button
                type="button"
                onClick={refresh}
                className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-sm border border-gold/50 px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-ink"
              >
                {copy.retry}
              </button>
            </div>
          ) : null}

          {status !== "loading" && data && enquiries.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/[0.05] text-gold"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-tight text-cream">
                {copy.emptyTitle}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                {copy.emptyBody}
              </p>
            </div>
          ) : null}

          {status !== "loading" && data && enquiries.length > 0 ? (
            <ul className="divide-y divide-white/[0.07]">
              {enquiries.map((enquiry) => {
                const received = formatDate(enquiry.createdAt, locale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <li
                    key={enquiry.id}
                    className="p-5 transition-colors hover:bg-white/[0.018] sm:p-6"
                  >
                    <div className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-display text-xs font-bold text-gold"
                      >
                        {initials(enquiry.name)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                              <h3 className="break-words text-sm font-semibold text-cream">
                                {enquiry.name}
                              </h3>
                              {enquiry.status === "new" ? (
                                <span className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-gold">
                                  <span
                                    aria-hidden="true"
                                    className="h-1 w-1 rounded-full bg-gold"
                                  />
                                  {copy.statusNew}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                              <a
                                href={`mailto:${enquiry.email}`}
                                className="break-all transition-colors hover:text-gold"
                              >
                                <span className="sr-only">
                                  {copy.emailLabel}:{" "}
                                </span>
                                {enquiry.email}
                              </a>
                              {enquiry.phone ? (
                                <a
                                  href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`}
                                  className="transition-colors hover:text-gold"
                                >
                                  <span className="sr-only">
                                    {copy.phoneLabel}:{" "}
                                  </span>
                                  {enquiry.phone}
                                </a>
                              ) : null}
                            </div>
                          </div>

                          {received ? (
                            <div className="shrink-0 sm:text-right">
                              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
                                {copy.received}
                              </p>
                              <time
                                dateTime={enquiry.createdAt}
                                className="mt-1 block text-[10px] leading-5 text-silver"
                              >
                                {received}
                              </time>
                            </div>
                          ) : null}
                        </div>

                        <p className="mt-4 whitespace-pre-wrap break-words border-l border-white/10 pl-3 text-sm leading-6 text-silver">
                          <span className="sr-only">{copy.messageLabel}: </span>
                          {enquiry.message}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
          <section className="overflow-hidden rounded-md border border-gold/25 bg-[linear-gradient(160deg,rgba(201,162,83,0.12),rgba(11,11,11,0.75)_68%)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold/80">
                {copy.summaryTitle}
              </p>
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/20 text-gold"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
            </div>

            <p className="mt-7 font-display text-6xl font-black leading-none tabular-nums text-cream">
              {data ? number.format(total) : copy.none}
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
              {copy.totalEnquiries}
            </p>

            <div
              aria-hidden="true"
              className="mt-5 h-px w-full overflow-hidden bg-white/10"
            >
              <span
                className="block h-full bg-gold transition-[width] duration-700"
                style={{ width: `${sevenDayShare}%` }}
              />
            </div>

            <dl className="mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  {copy.lastSevenDays}
                </dt>
                <dd className="text-sm font-semibold tabular-nums text-cream">
                  {data ? number.format(lastSevenDays) : copy.none}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  {copy.latestEnquiry}
                </dt>
                <dd className="text-right text-xs font-medium text-cream">
                  {data ? latestDate || copy.none : copy.none}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <h2 className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
              {copy.quickTitle}
            </h2>
            <div className="mt-3 divide-y divide-white/[0.07]">
              <Link
                href="/admin/content/homepage"
                onClick={(event) =>
                  handleInternalClick(event, "/admin/content/homepage")
                }
                className="group flex min-h-[48px] items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:text-gold"
              >
                <span className="text-muted transition-colors group-hover:text-gold">
                  <ActionIcon name="content" />
                </span>
                {copy.quickContent}
                <span
                  aria-hidden="true"
                  className="ml-auto transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
              <Link
                href="/contact"
                onClick={(event) => handleInternalClick(event, "/contact")}
                className="group flex min-h-[48px] items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:text-gold"
              >
                <span className="text-muted transition-colors group-hover:text-gold">
                  <ActionIcon name="contact" />
                </span>
                {copy.quickContact}
                <span
                  aria-hidden="true"
                  className="ml-auto transition-transform group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </Link>
              <Link
                href="/admin/settings"
                onClick={(event) =>
                  handleInternalClick(event, "/admin/settings")
                }
                className="group flex min-h-[48px] items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:text-gold"
              >
                <span className="text-muted transition-colors group-hover:text-gold">
                  <ActionIcon name="account" />
                </span>
                {copy.quickAccount}
                <span
                  aria-hidden="true"
                  className="ml-auto transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
              <Link
                href="/"
                className="group flex min-h-[48px] items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:text-gold"
              >
                <span className="text-muted transition-colors group-hover:text-gold">
                  <ActionIcon name="site" />
                </span>
                {copy.quickSite}
                <span
                  aria-hidden="true"
                  className="ml-auto transition-transform group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
