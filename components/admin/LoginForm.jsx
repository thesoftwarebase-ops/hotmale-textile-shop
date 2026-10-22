"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Toast from "../ui/Toast";
import AdminLoadingScreen from "./AdminLoadingScreen";
import { clearToken, getToken, setToken } from "../../lib/client-auth";

function EyeIcon({ hidden }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {hidden ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.4 10.4 0 0 1 12 5c5.5 0 9 5.2 9 7a11 11 0 0 1-3 4.1" />
          <path d="M6.2 6.2A11.8 11.8 0 0 0 3 12c0 1.8 3.5 7 9 7a10 10 0 0 0 4.3-1" />
        </>
      ) : (
        <>
          <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export default function LoginForm({ copy, brand, tagline }) {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const redirectTimer = useRef(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    variant: "error",
    title: "",
    message: "",
  });

  const dismissToast = useCallback(
    () => setToast((current) => ({ ...current, open: false })),
    [],
  );

  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;

    let active = true;

    fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((response) => {
        if (!active) return;
        if (response.ok) {
          setRedirecting(true);
          router.replace("/admin/dashboard");
        } else {
          clearToken();
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(
    () => () => {
      clearTimeout(redirectTimer.current);
    },
    [],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError("");
    setToast((current) => ({ ...current, open: false }));
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        setToken(data.token);
        setToast({
          open: true,
          variant: "success",
          title: copy.toastSuccessTitle,
          message: copy.toastSuccess,
        });
        setRedirecting(true);
        redirectTimer.current = window.setTimeout(() => {
          router.replace("/admin/dashboard");
          router.refresh();
        }, 700);
        return;
      }

      const message =
        response.status === 401 ? copy.errorInvalid : copy.errorGeneric;
      setError(message);
      setToast({
        open: true,
        variant: "error",
        title: copy.toastErrorTitle,
        message,
      });
    } catch {
      setError(copy.errorGeneric);
      setToast({
        open: true,
        variant: "error",
        title: copy.toastErrorTitle,
        message: copy.errorGeneric,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate={false}>
        <div>
          <label
            htmlFor={emailId}
            className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-silver"
          >
            {copy.emailLabel}
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="username"
            autoFocus
            placeholder={copy.emailPlaceholder}
            aria-describedby={error ? errorId : undefined}
            suppressHydrationWarning
            className="mt-2 h-12 w-full rounded-sm border border-graphite bg-ink/70 px-3 text-sm text-cream outline-none transition-colors placeholder:text-muted focus:border-gold"
          />
        </div>

        <div>
          <label
            htmlFor={passwordId}
            className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-silver"
          >
            {copy.passwordLabel}
          </label>
          <div className="relative mt-2">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder={copy.passwordPlaceholder}
              aria-describedby={error ? errorId : undefined}
              suppressHydrationWarning
              className="h-12 w-full rounded-sm border border-graphite bg-ink/70 pl-3 pr-12 text-sm text-cream outline-none transition-colors placeholder:text-muted focus:border-gold"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={
                showPassword ? copy.hidePassword : copy.showPassword
              }
              aria-pressed={showPassword}
              aria-controls={passwordId}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-sm text-muted transition-colors hover:text-gold"
            >
              <EyeIcon hidden={showPassword} />
            </button>
          </div>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="rounded-sm border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          suppressHydrationWarning
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      <Toast
        open={toast.open}
        variant={toast.variant}
        title={toast.title}
        message={toast.message}
        dismissLabel={copy.toastDismiss}
        onDismiss={dismissToast}
      />

      <AdminLoadingScreen
        visible={pending || redirecting}
        brand={brand}
        status={copy.loadingStatus}
        tagline={tagline}
      />
    </>
  );
}
