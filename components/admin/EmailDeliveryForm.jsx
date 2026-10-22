"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import Toast from "../ui/Toast";
import { authFetch, clearToken } from "../../lib/client-auth";

const inputClass =
  "h-12 w-full rounded-sm border border-white/10 bg-ink/80 px-3.5 text-sm text-cream outline-none transition-colors placeholder:text-muted hover:border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/10 disabled:opacity-60";
const labelClass =
  "block text-[9px] font-bold uppercase tracking-[0.22em] text-muted";
const buttonClass =
  "inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-70";

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

function DeliveryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

export default function EmailDeliveryForm({ copy }) {
  const router = useRouter();
  const inputId = useId();
  const hintId = useId();
  const [accessKey, setAccessKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const errorTitle = copy.toast.errorTitle;
  const successTitle = copy.toast.successTitle;
  const genericError = copy.emailDelivery.errors.generic;

  const dismissToast = useCallback(() => setToast(null), []);

  const handleUnauthorized = useCallback(() => {
    clearToken();
    router.replace("/admin");
    router.refresh();
  }, [router]);

  const showError = useCallback(
    (message) => {
      setToast({
        variant: "error",
        title: errorTitle,
        message,
      });
    },
    [errorTitle],
  );

  const showSuccess = useCallback(
    (message) => {
      setToast({
        variant: "success",
        title: successTitle,
        message,
      });
    },
    [successTitle],
  );

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await authFetch("/api/admin/settings/email", {
          cache: "no-store",
        });

        if (response.status === 401) {
          if (active) handleUnauthorized();
          return;
        }

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          throw new Error("load_failed");
        }

        if (active) {
          const key = data.accessKey ?? "";
          setAccessKey(key);
          setSavedKey(key);
        }
      } catch {
        if (active) showError(genericError);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, [genericError, handleUnauthorized, showError]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending || loading) return;

    setToast(null);
    setPending(true);

    try {
      const response = await authFetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.ok && data.ok) {
        const key = data.accessKey ?? "";
        setAccessKey(key);
        setSavedKey(key);
        showSuccess(copy.emailDelivery.success);
        return;
      }

      showError(
        data.code === "invalid"
          ? copy.emailDelivery.errors.invalid
          : copy.emailDelivery.errors.generic,
      );
    } catch {
      showError(copy.emailDelivery.errors.generic);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b]">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-gold/20 bg-gold/[0.06] text-gold">
                <DeliveryIcon />
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-gold/70">
                  03 · {copy.emailDelivery.eyebrow}
                </p>
                <h2 className="mt-1 font-display text-2xl font-black uppercase leading-none tracking-tight text-cream">
                  {copy.emailDelivery.title}
                </h2>
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.22em] ${
                savedKey
                  ? "border-gold/20 bg-gold/[0.06] text-gold/80"
                  : "border-white/10 bg-white/[0.03] text-muted"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1 w-1 rounded-full ${
                  savedKey ? "bg-gold" : "bg-muted"
                }`}
              />
              {savedKey
                ? copy.emailDelivery.statusConfigured
                : copy.emailDelivery.statusMissing}
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-silver">
            {copy.emailDelivery.intro}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
          noValidate
        >
          <div>
            <label htmlFor={inputId} className={labelClass}>
              {copy.emailDelivery.label}
            </label>
            <div className="relative mt-2">
              <input
                id={inputId}
                name="accessKey"
                type={visible ? "text" : "password"}
                value={accessKey}
                onChange={(event) => setAccessKey(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                disabled={loading || pending}
                placeholder={copy.emailDelivery.placeholder}
                aria-describedby={hintId}
                className={`${inputClass} pr-12 font-mono text-xs tracking-wide`}
              />
              <button
                type="button"
                onClick={() => setVisible((shown) => !shown)}
                aria-label={
                  visible
                    ? copy.emailDelivery.hideKey
                    : copy.emailDelivery.showKey
                }
                aria-pressed={visible}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition-colors hover:text-gold"
              >
                {visible ? (
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
                    <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.5 10.5 0 0 1 12 5c5 0 9 4.5 10 7a13.2 13.2 0 0 1-3.1 4.2M6.6 6.6A13.7 13.7 0 0 0 2 12c1 2.5 5 7 10 7a10.8 10.8 0 0 0 4.4-.9" />
                  </svg>
                ) : (
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
                    <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p id={hintId} className="mt-2 text-xs leading-relaxed text-muted">
              {loading ? copy.emailDelivery.loading : copy.emailDelivery.hint}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-relaxed text-muted">
              {copy.emailDelivery.emptyHint}
            </p>
            <button
              type="submit"
              disabled={loading || pending}
              className={`${buttonClass} sm:w-auto sm:min-w-[11rem]`}
            >
              {pending ? <Spinner /> : null}
              {pending
                ? copy.emailDelivery.pending
                : copy.emailDelivery.submit}
            </button>
          </div>
        </form>
      </section>

      <Toast
        open={Boolean(toast)}
        variant={toast?.variant}
        title={toast?.title}
        message={toast?.message}
        dismissLabel={copy.toast.dismiss}
        onDismiss={dismissToast}
      />
    </>
  );
}
