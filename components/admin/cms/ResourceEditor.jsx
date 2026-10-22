"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CmsForm from "./CmsForm";
import Toast from "../../ui/Toast";
import { authFetch, clearToken } from "../../../lib/client-auth";
import { emptyFromFields } from "../../../lib/cms/schema";

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

function blankValue(schema) {
  return {
    ...emptyFromFields(schema.fields),
    ...schema.defaults,
  };
}

function errorMessage(payload, copy) {
  if (payload?.code === "duplicate_slug") return copy.form.duplicateSlug;
  if (payload?.code === "in_use") return copy.form.inUse;
  if (payload?.code === "not_found") return copy.form.notFound;
  if (payload?.errors) {
    const messages = Object.values(payload.errors).filter(Boolean);
    if (messages.length > 0) return messages.slice(0, 2).join(" ");
  }
  return copy.form.errorBody;
}

export default function ResourceEditor({ resource, schema, id = null, copy }) {
  const router = useRouter();
  const [currentId, setCurrentId] = useState(id);
  const [value, setValue] = useState(() => blankValue(schema));
  const [options, setOptions] = useState({});
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);
  const listHref = `/admin/content/${resource}`;
  const creating = !currentId;

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [optionsResponse, itemResponse] = await Promise.all([
          authFetch("/api/admin/options", { cache: "no-store" }),
          id
            ? authFetch(`/api/admin/resources/${resource}/${id}`, {
                cache: "no-store",
              })
            : Promise.resolve(null),
        ]);

        if (optionsResponse.status === 401 || itemResponse?.status === 401) {
          clearToken();
          router.replace("/admin");
          return;
        }

        if (!optionsResponse.ok) throw new Error("options_failed");

        const optionsPayload = await optionsResponse.json().catch(() => ({}));
        if (!active) return;
        setOptions({
          categories: optionsPayload.categories ?? [],
          collections: optionsPayload.collections ?? [],
          stores: optionsPayload.stores ?? [],
        });

        if (itemResponse) {
          const payload = await itemResponse.json().catch(() => ({}));
          if (!active) return;
          if (itemResponse.status === 404) {
            setStatus("missing");
            return;
          }
          if (!itemResponse.ok) throw new Error("item_failed");
          setValue(payload.item);
        }

        if (active) setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, resource, router]);

  async function save() {
    if (saving || status !== "ready") return;
    setSaving(true);
    setToast(null);

    try {
      const endpoint = currentId
        ? `/api/admin/resources/${resource}/${currentId}`
        : `/api/admin/resources/${resource}`;
      const response = await authFetch(endpoint, {
        method: currentId ? "PATCH" : "POST",
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

      if (payload.item) setValue(payload.item);

      if (!currentId && payload.item?.id) {
        setCurrentId(payload.item.id);
        window.history.replaceState(
          null,
          "",
          `/admin/content/${resource}/${payload.item.id}`,
        );
      }

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

  const preview =
    currentId && value?.slug
      ? schema.previewPattern?.replace("{slug}", value.slug)
      : null;

  return (
    <>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Link
              href={listHref}
              className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-muted transition-colors hover:text-gold"
            >
              <span aria-hidden="true">←</span>
              {copy.form.back}
            </Link>
            <p className="mt-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
              <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
              {creating ? copy.form.createEyebrow : copy.form.editEyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-cream sm:text-5xl">
              {creating ? schema.singular : schema.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-silver">
              {schema.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start lg:self-auto">
            {preview ? (
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] items-center justify-center rounded-sm border border-white/10 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/50 hover:text-gold"
              >
                {copy.list.openPage}
              </a>
            ) : null}
            <button
              type="button"
              onClick={save}
              disabled={saving || status !== "ready"}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-40"
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
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-6">
            <p className="text-sm text-silver">{copy.form.notFound}</p>
            <Link
              href={listHref}
              className="mt-4 inline-flex min-h-[42px] items-center rounded-sm border border-gold/50 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-gold"
            >
              {copy.form.back}
            </Link>
          </div>
        ) : null}

        {status === "ready" ? (
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
