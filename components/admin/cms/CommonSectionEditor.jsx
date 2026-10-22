"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Toast from "../../ui/Toast";
import { authFetch, clearToken } from "../../../lib/client-auth";
import CtaSection from "./common/CtaSection";
import NavbarSection from "./common/NavbarSection";
import FooterSection from "./common/FooterSection";

const SECTION_COMPONENTS = {
  cta: CtaSection,
  navbar: NavbarSection,
  footer: FooterSection,
};

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

/**
 * Editor for the site-wide common sections: the closing CTA band, the
 * navbar links and the footer. Each one owns a single slice of a
 * content document, so saving one never rewrites another.
 */
export default function CommonSectionEditor({ section, schema, copy }) {
  const router = useRouter();
  const [value, setValue] = useState(null);
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [beforeSave, setBeforeSave] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);
  const SectionComponent = SECTION_COMPONENTS[section];

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await authFetch(`/api/admin/common/${section}`, {
          cache: "no-store",
        });
        if (response.status === 401) {
          clearToken();
          router.replace("/admin");
          return;
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (active) setStatus("error");
          return;
        }
        if (!active) return;
        setValue(payload.value);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [section, router]);

  async function save() {
    if (saving || !value) return;

    // A section can veto the save — the footer warns before it takes a
    // branch's record away with its link.
    if (typeof beforeSave === "function" && beforeSave() === false) return;

    setSaving(true);
    setToast(null);

    try {
      const response = await authFetch(`/api/admin/common/${section}`, {
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
        const messages = payload?.errors
          ? Object.values(payload.errors).filter(Boolean)
          : [];
        setToast({
          variant: "error",
          title: copy.form.errorTitle,
          message:
            messages.length > 0
              ? messages.slice(0, 2).join(" ")
              : copy.form.errorBody,
        });
        return;
      }

      if (payload.value) setValue(payload.value);

      const warnings = Array.isArray(payload.warnings) ? payload.warnings : [];
      const removed = Array.isArray(payload.removed) ? payload.removed : [];
      const message = [
        ...removed.map((name) => `${name} was removed with its footer link.`),
        ...warnings,
      ].join(" ");

      setToast({
        variant: warnings.length > 0 ? "error" : "success",
        title: warnings.length > 0 ? copy.form.errorTitle : copy.form.savedTitle,
        message: message || copy.form.savedBody,
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
      <div className="flex flex-col gap-6">
        <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-4 border-b border-white/10 bg-ink/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-muted transition-colors hover:text-gold"
              >
                <span aria-hidden="true">←</span>
                {copy.common.back}
              </Link>
              <p className="mt-4 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
                <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
                {copy.common.eyebrow}
              </p>
              <h1 className="mt-3 font-display text-3xl font-black uppercase leading-none tracking-tight text-cream sm:text-4xl">
                {schema.title}
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
                {schema.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start lg:self-auto">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-sm border border-white/10 px-4 text-[9px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/50 hover:text-gold"
              >
                {copy.common.viewSite}
              </a>
              <button
                type="button"
                onClick={save}
                disabled={saving || status !== "ready"}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm bg-gold px-5 text-[9px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-40"
              >
                {saving ? <Spinner /> : null}
                {saving ? copy.form.saving : copy.form.save}
              </button>
            </div>
          </div>
        </div>

        {status === "loading" ? (
          <div className="space-y-4">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-md border border-white/10 bg-white/[0.025]"
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

        {status === "ready" && value && SectionComponent ? (
          <SectionComponent
            value={value}
            onChange={setValue}
            copy={copy}
            registerBeforeSave={setBeforeSave}
          />
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
