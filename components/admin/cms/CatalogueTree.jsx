"use client";

import { useCallback, useEffect, useState } from "react";
import Toast from "../../ui/Toast";
import { authFetch, clearToken } from "../../../lib/client-auth";

/**
 * Catalogue tree — categories, their collections and the products inside
 * those collections, read-only. The references are resolved by the
 * server (one aggregation), so this view can never disagree with the
 * documents that own the data.
 */
function StatusDot({ status }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.18em] ${
        published ? "text-gold" : "text-muted"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1 w-1 rounded-full ${
          published ? "bg-gold" : "bg-muted/70"
        }`}
      />
      {status}
    </span>
  );
}

function Caret({ open }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${
        open ? "rotate-90" : ""
      }`}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function CatalogueTree({ copy }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [openCategories, setOpenCategories] = useState({});
  const [openCollections, setOpenCollections] = useState({});
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await authFetch("/api/admin/catalogue", {
          cache: "no-store",
        });
        if (response.status === 401) {
          clearToken();
          return;
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error("failed");
        if (!active) return;
        setData(payload);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  function toggleCategory(slug) {
    setOpenCategories((current) => ({ ...current, [slug]: !current[slug] }));
  }

  function toggleCollection(slug) {
    setOpenCollections((current) => ({ ...current, [slug]: !current[slug] }));
  }

  if (status === "loading") {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="h-20 animate-pulse rounded-md border border-white/10 bg-white/[0.025]"
          />
        ))}
        <p className="sr-only">{copy.catalogue.loading}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-md border border-red-400/20 bg-red-400/[0.04] p-6">
        <p className="text-sm text-silver">{copy.catalogue.error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex min-h-[42px] items-center rounded-sm border border-gold/50 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-gold"
        >
          {copy.form.retry}
        </button>
      </div>
    );
  }

  const tree = data?.tree ?? [];

  return (
    <>
      <div className="flex flex-col gap-3">
        {tree.map((category) => {
          const open = Boolean(openCategories[category.slug]);
          return (
            <article
              key={category.slug}
              className="overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b]"
            >
              <button
                type="button"
                onClick={() => toggleCategory(category.slug)}
                aria-expanded={open}
                className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.02] sm:px-5"
              >
                <span
                  className={`text-gold transition-transform duration-300 ${
                    open ? "rotate-90" : ""
                  }`}
                >
                  <Caret open={open} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-display text-lg font-bold uppercase tracking-tight text-cream">
                      {category.name}
                    </span>
                    <StatusDot status={category.status} />
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-muted">
                    /{category.slug}
                  </span>
                </span>

                <span className="hidden shrink-0 gap-5 sm:flex">
                  <span className="text-right">
                    <span className="block text-sm font-bold tabular-nums text-cream">
                      {String(category.collectionCount).padStart(2, "0")}
                    </span>
                    <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
                      {copy.catalogue.collections}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-bold tabular-nums text-gold">
                      {String(category.productCount).padStart(2, "0")}
                    </span>
                    <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
                      {copy.catalogue.products}
                    </span>
                  </span>
                </span>
              </button>

              {open ? (
                <div className="border-t border-white/[0.07]">
                  {category.collections.length === 0 ? (
                    <p className="px-5 py-6 text-xs text-muted">
                      {copy.catalogue.noCollections}
                    </p>
                  ) : (
                    <ul className="divide-y divide-white/[0.06]">
                      {category.collections.map((collection) => {
                        const collectionOpen = Boolean(
                          openCollections[collection.slug],
                        );
                        return (
                          <li key={collection.slug}>
                            <button
                              type="button"
                              onClick={() => toggleCollection(collection.slug)}
                              aria-expanded={collectionOpen}
                              className="flex w-full items-center gap-3 pl-8 pr-4 py-3 text-left transition-colors hover:bg-white/[0.02] sm:pl-10"
                            >
                              <span
                                className={`text-muted transition-transform duration-300 ${
                                  collectionOpen ? "rotate-90 text-gold" : ""
                                }`}
                              >
                                <Caret open={collectionOpen} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                  <span className="truncate text-xs font-semibold text-cream">
                                    {collection.name}
                                  </span>
                                  <StatusDot status={collection.status} />
                                </span>
                                <span className="mt-0.5 block truncate text-[10px] text-muted">
                                  /{collection.slug}
                                </span>
                              </span>
                              <span className="shrink-0 text-right">
                                <span className="block text-xs font-bold tabular-nums text-gold">
                                  {String(collection.productCount).padStart(2, "0")}
                                </span>
                                <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
                                  {copy.catalogue.products}
                                </span>
                              </span>
                            </button>

                            {collectionOpen ? (
                              <ul className="border-t border-white/[0.05] bg-black/20">
                                {collection.products.length === 0 ? (
                                  <li className="pl-12 pr-4 py-4 text-[11px] text-muted sm:pl-14">
                                    {copy.catalogue.noProducts}
                                  </li>
                                ) : (
                                  collection.products.map((product) => (
                                    <li
                                      key={product.slug}
                                      className="flex items-center gap-3 py-2.5 pl-12 pr-4 sm:pl-14"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="h-1 w-1 rotate-45 bg-gold/60"
                                      />
                                      <span className="min-w-0 flex-1 truncate text-[11px] text-silver">
                                        {product.name}
                                      </span>
                                      <span className="hidden truncate text-[10px] text-muted sm:block">
                                        /{product.slug}
                                      </span>
                                      {product.price != null ? (
                                        <span className="tnum shrink-0 text-[11px] font-semibold text-cream">
                                          ₹{product.price.toLocaleString("en-IN")}
                                        </span>
                                      ) : null}
                                      <StatusDot status={product.status} />
                                    </li>
                                  ))
                                )}
                              </ul>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
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
