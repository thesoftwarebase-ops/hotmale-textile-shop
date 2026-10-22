"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CmsForm from "./CmsForm";
import Toast from "../../ui/Toast";
import { authFetch, clearToken } from "../../../lib/client-auth";

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

function errorMessage(payload, copy) {
  if (payload?.code === "not_initialized") return copy.form.notInitialized;
  if (payload?.code === "duplicate_slug") return copy.form.duplicateSlug;
  if (payload?.code === "in_use") return copy.form.inUse;
  if (payload?.errors) {
    const messages = Object.values(payload.errors).filter(Boolean);
    if (messages.length > 0) return messages.slice(0, 2).join(" ");
  }
  return copy.form.errorBody;
}

export default function SingletonEditor({
  kind = "site",
  contentKey,
  schema,
  copy,
  backHref = "/admin/dashboard",
  backLabel,
  viewHref,
  viewLabel,
}) {
  const router = useRouter();
  const [value, setValue] = useState(null);
  const [options, setOptions] = useState({});
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const endpoint =
    kind === "page"
      ? `/api/admin/pages/${contentKey}`
      : `/api/admin/site/${contentKey}`;

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [contentResponse, optionsResponse] = await Promise.all([
          authFetch(endpoint, { cache: "no-store" }),
          authFetch("/api/admin/options", { cache: "no-store" }),
        ]);

        if (contentResponse.status === 401 || optionsResponse.status === 401) {
          clearToken();
          router.replace("/admin");
          return;
        }

        const payload = await contentResponse.json().catch(() => ({}));
        if (!contentResponse.ok) {
          if (!active) return;
          setStatus(payload.code === "not_initialized" ? "missing" : "error");
          return;
        }

        const optionsPayload = await optionsResponse.json().catch(() => ({}));
        if (!active) return;
        setValue(payload.value);
        setOptions(
          optionsResponse.ok
            ? {
                categories: optionsPayload.categories ?? [],
                collections: optionsPayload.collections ?? [],
                stores: optionsPayload.stores ?? [],
              }
            : {},
        );
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [endpoint, router]);

  async function save() {
    if (saving || !value) return;
    setSaving(true);
    setToast(null);

    try {
      const response = await authFetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
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
          message: errorMessage(payload, copy),
        });
        return;
      }

      if (payload.value) setValue(payload.value);
      setToast({
        variant: "success",
        title: copy.form.savedTitle,
        message: copy.form.savedBody,
      });
    } catch {
      setToast({
        variant: "error",
        title: copy.form.errorTitle,
        message: copy.form.errorBody,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-muted transition-colors hover:text-gold"
            >
              <span aria-hidden="true">←</span>
              {backLabel || copy.form.back}
            </Link>
            <p className="mt-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
              <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
              {copy.form.editEyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-cream sm:text-5xl">
              {schema.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-silver">
              {schema.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start lg:self-auto">
            {viewHref ? (
              <a
                href={viewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-sm border border-white/10 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/50 hover:text-gold"
              >
                {viewLabel || copy.list.openPage}
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            <button
              type="button"
              onClick={save}
              disabled={saving || status !== "ready"}
              className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-40"
            >
              {saving ? <Spinner /> : null}
              {saving ? copy.form.saving : copy.form.save}
            </button>
          </div>
        </header>

        {status === "loading" ? (
          <div className="space-y-4">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-md border border-white/10 bg-white/[0.025]"
              />
            ))}
            <p className="sr-only">{copy.form.loading}</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="rounded-md border border-red-400/20 bg-red-400/[0.04] p-6">
            <p className="text-sm text-silver">{copy.form.error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex min-h-[42px] items-center rounded-sm border border-gold/50 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-gold"
            >
              {copy.form.retry}
            </button>
          </div>
        ) : null}

        {status === "missing" ? (
          <div className="rounded-md border border-gold/20 bg-gold/[0.04] p-6">
            <p className="text-sm leading-6 text-silver">
              {copy.form.notInitialized}
            </p>
          </div>
        ) : null}

        {status === "ready" && value ? (
          <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-4 sm:p-6">
            <CmsForm
              fields={schema.fields}
              value={value}
              onChange={setValue}
              options={options}
              copy={copy}
            />
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
