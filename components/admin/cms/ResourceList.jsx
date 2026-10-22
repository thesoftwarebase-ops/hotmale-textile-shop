"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Toast from "../../ui/Toast";
import { authFetch, clearToken } from "../../../lib/client-auth";

const PAGE_SIZE = 12;

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-3.5 w-3.5 animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    </svg>
  );
}

function StatusBadge({ status, copy }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em] ${
        published
          ? "border-gold/25 bg-gold/[0.06] text-gold"
          : "border-white/10 bg-white/[0.03] text-muted"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1 w-1 rounded-full ${published ? "bg-gold" : "bg-muted"}`}
      />
      {status || copy.list.none}
    </span>
  );
}

function displayValue(field, row, options, copy) {
  const value = row[field.name];

  if (field.type === "status") {
    return <StatusBadge status={value} copy={copy} />;
  }
  if (field.type === "boolean") {
    return (
      <span className={value ? "text-gold" : "text-muted"}>
        {value ? copy.list.yes : copy.list.no}
      </span>
    );
  }
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted">{copy.list.none}</span>;
  }
  if (field.resource) {
    const item = (options[field.resource] ?? []).find(
      (entry) => entry.slug === value,
    );
    if (item) return item.name;
  }
  if (field.type === "number") return new Intl.NumberFormat().format(value);
  return String(value);
}

export default function ResourceList({
  resource,
  schema,
  copy,
  groupLabel = copy.navGroups.catalogue,
}) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState({});
  const [status, setStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [itemsResponse, optionsResponse] = await Promise.all([
          authFetch(`/api/admin/resources/${resource}`, { cache: "no-store" }),
          authFetch("/api/admin/options", { cache: "no-store" }),
        ]);

        if (itemsResponse.status === 401 || optionsResponse.status === 401) {
          clearToken();
          router.replace("/admin");
          return;
        }

        if (!itemsResponse.ok) throw new Error("request_failed");
        const payload = await itemsResponse.json();
        const optionsPayload = await optionsResponse.json().catch(() => ({}));
        if (!active) return;
        setItems(payload.items ?? []);
        setOptions({
          categories: optionsPayload.categories ?? [],
          collections: optionsPayload.collections ?? [],
          stores: optionsPayload.stores ?? [],
        });
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [resource, router]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.slug, item.title, item.question]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [items, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  async function remove(item) {
    if (deleting) return;
    const confirmed = window.confirm(
      `${copy.list.deleteTitle}\n\n${copy.list.deleteBody}`,
    );
    if (!confirmed) return;

    setDeleting(item.id);
    setToast(null);
    try {
      const response = await authFetch(
        `/api/admin/resources/${resource}/${item.id}`,
        { method: "DELETE" },
      );
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearToken();
        router.replace("/admin");
        return;
      }

      if (!response.ok) {
        setToast({
          variant: "error",
          title: copy.form.errorTitle,
          message:
            payload.code === "in_use"
              ? copy.form.inUse
              : copy.form.deleteError,
        });
        return;
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setToast({
        variant: "success",
        title: copy.form.deletedTitle,
        message: copy.form.deletedBody,
      });
    } catch {
      setToast({
        variant: "error",
        title: copy.form.errorTitle,
        message: copy.form.deleteError,
      });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
              <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
              {groupLabel}
            </p>
            <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-cream sm:text-5xl">
              {schema.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-silver">
              {schema.description}
            </p>
          </div>
          <Link
            href={`/admin/content/${resource}/new`}
            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 self-start rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight sm:self-auto"
          >
            {copy.list.add} {schema.singular}
          </Link>
        </header>

        <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">{copy.list.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={copy.list.searchPlaceholder}
              className="h-11 w-full rounded-sm border border-white/10 bg-ink/80 pl-3 pr-10 text-sm text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-gold"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
          </label>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
            {copy.list.showing} {visible.length} {copy.list.of}{" "}
            {filtered.length}
          </p>
        </div>

        <div className="overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b]">
          {status === "loading" ? (
            <div className="space-y-px">
              {[0, 1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="flex animate-pulse items-center gap-4 border-b border-white/[0.05] p-4 last:border-0"
                >
                  <span className="h-8 w-8 rounded-sm bg-white/[0.05]" />
                  <span className="h-3 w-1/3 rounded-sm bg-white/[0.06]" />
                  <span className="ml-auto h-6 w-24 rounded-full bg-white/[0.04]" />
                </div>
              ))}
              <p className="sr-only">{copy.list.loading}</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="p-8 text-center">
              <p className="text-sm text-silver">{copy.list.error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex min-h-[42px] items-center rounded-sm border border-gold/50 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-gold"
              >
                {copy.list.retry}
              </button>
            </div>
          ) : null}

          {status === "ready" && filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-display text-2xl font-bold uppercase text-cream">
                {copy.list.emptyTitle}
              </p>
              <p className="mt-2 text-sm text-muted">{copy.list.emptyBody}</p>
            </div>
          ) : null}

          {status === "ready" && filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    {schema.listFields.map((field) => (
                      <th
                        key={field.name}
                        className="px-4 py-3 text-[8px] font-bold uppercase tracking-[0.22em] text-muted"
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="w-28 px-4 py-3 text-right text-[8px] font-bold uppercase tracking-[0.22em] text-muted">
                      {copy.list.actions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const preview = schema.previewPattern
                      ? schema.previewPattern.replace("{slug}", item.slug)
                      : schema.previewPath;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.06] transition-colors last:border-0 hover:bg-white/[0.018]"
                      >
                        {schema.listFields.map((field) => (
                          <td
                            key={field.name}
                            className={`px-4 py-3.5 text-xs ${
                              field.name === "name"
                                ? "font-semibold text-cream"
                                : "text-silver"
                            }`}
                          >
                            {displayValue(field, item, options, copy)}
                          </td>
                        ))}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {preview ? (
                              <a
                                href={preview}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={copy.list.openPage}
                                title={copy.list.openPage}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-muted transition-colors hover:border-gold/40 hover:text-gold"
                              >
                                <span aria-hidden="true">↗</span>
                              </a>
                            ) : null}
                            <Link
                              href={`/admin/content/${resource}/${item.id}`}
                              className="inline-flex h-8 items-center rounded-sm border border-white/10 px-2.5 text-[8px] font-bold uppercase tracking-[0.14em] text-silver transition-colors hover:border-gold/40 hover:text-gold"
                            >
                              {copy.list.edit}
                            </Link>
                            <button
                              type="button"
                              onClick={() => remove(item)}
                              disabled={deleting === item.id}
                              className="inline-flex h-8 items-center rounded-sm border border-red-400/20 px-2.5 text-[8px] font-bold uppercase tracking-[0.14em] text-red-300 transition-colors hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deleting === item.id ? <Spinner /> : copy.list.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {status === "ready" && pageCount > 1 ? (
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              className="inline-flex min-h-[42px] items-center rounded-sm border border-white/10 px-4 text-[9px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-35"
            >
              {copy.list.previous}
            </button>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
              {safePage} / {pageCount}
            </p>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              disabled={safePage === pageCount}
              className="inline-flex min-h-[42px] items-center rounded-sm border border-white/10 px-4 text-[9px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-35"
            >
              {copy.list.next}
            </button>
          </div>
        ) : null}
      </div>

      <Toast
        open={Boolean(toast)}
        variant={toast?.variant}
        title={toast?.title}
        message={toast?.message}
        dismissLabel={copy.form.dismiss}
        onDismiss={dismissToast}
      />
    </>
  );
}
