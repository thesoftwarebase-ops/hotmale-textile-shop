"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import Toast from "../ui/Toast";
import { useAdminAuth } from "./AdminAuthContext";
import { authFetch, clearToken, setToken } from "../../lib/client-auth";

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

function CardIcon({ name }) {
  const paths = {
    email: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" />
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
      className="h-5 w-5"
    >
      {paths[name]}
    </svg>
  );
}

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  hintId,
  copy,
  disabled,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          aria-describedby={hintId}
          disabled={disabled}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? copy.hidePassword : copy.showPassword}
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
      {hint ? (
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default function AccountForms({ copy, email }) {
  const router = useRouter();
  const { refreshSession } = useAdminAuth();
  const emailId = useId();
  const emailPasswordId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const newPasswordHintId = useId();
  const confirmPasswordId = useId();

  const [emailValue, setEmailValue] = useState(email);
  const [emailPassword, setEmailPassword] = useState("");
  const [emailPending, setEmailPending] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  function showError(message) {
    setToast({
      variant: "error",
      title: copy.toast.errorTitle,
      message,
    });
  }

  function showSuccess(message) {
    setToast({
      variant: "success",
      title: copy.toast.successTitle,
      message,
    });
  }

  function handleUnauthorized() {
    clearToken();
    router.replace("/admin");
    router.refresh();
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    if (emailPending) return;

    setToast(null);
    setEmailPending(true);

    try {
      const response = await authFetch("/api/admin/account/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          currentPassword: emailPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        if (data.email) setEmailValue(data.email);
        setEmailPassword("");
        showSuccess(copy.email.success);
        await refreshSession();
        return;
      }

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const text =
        data.code === "invalid_current"
          ? copy.errors.invalidCurrent
          : data.code === "email_taken"
            ? copy.errors.emailTaken
            : copy.errors.generic;
      showError(text);
    } catch {
      showError(copy.errors.generic);
    } finally {
      setEmailPending(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (passwordPending) return;

    setToast(null);
    if (newPassword.length < 8) {
      showError(copy.errors.weak);
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(copy.errors.mismatch);
      return;
    }

    setPasswordPending(true);

    try {
      const response = await authFetch("/api/admin/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        if (data.token) setToken(data.token);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showSuccess(copy.password.success);
        await refreshSession();
        return;
      }

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const text =
        data.code === "invalid_current"
          ? copy.errors.invalidCurrent
          : data.code === "mismatch"
            ? copy.errors.mismatch
            : data.code === "weak"
              ? copy.errors.weak
              : copy.errors.generic;
      showError(text);
    } catch {
      showError(copy.errors.generic);
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b]">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
          />
          <div className="border-b border-white/[0.07] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-gold/20 bg-gold/[0.06] text-gold">
                <CardIcon name="email" />
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-gold/70">
                  01
                </p>
                <h2 className="mt-1 font-display text-2xl font-black uppercase leading-none tracking-tight text-cream">
                  {copy.email.title}
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-silver">
              {copy.email.intro}
            </p>
          </div>

          <form
            onSubmit={handleEmailSubmit}
            className="space-y-5 p-5 sm:p-6"
            noValidate
          >
            <div>
              <label htmlFor={emailId} className={labelClass}>
                {copy.email.label}
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                required
                autoComplete="email"
                value={emailValue}
                onChange={(event) => setEmailValue(event.target.value)}
                disabled={emailPending}
                className={`${inputClass} mt-2`}
              />
            </div>

            <PasswordField
              id={emailPasswordId}
              name="currentPassword"
              label={copy.email.currentPasswordLabel}
              value={emailPassword}
              onChange={(event) => setEmailPassword(event.target.value)}
              autoComplete="current-password"
              copy={copy}
              disabled={emailPending}
            />

            <button
              type="submit"
              disabled={emailPending}
              className={buttonClass}
            >
              {emailPending ? <Spinner /> : null}
              {emailPending ? copy.email.pending : copy.email.submit}
            </button>
          </form>
        </section>

        <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b]">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
          />
          <div className="border-b border-white/[0.07] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-gold/20 bg-gold/[0.06] text-gold">
                <CardIcon name="lock" />
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-gold/70">
                  02
                </p>
                <h2 className="mt-1 font-display text-2xl font-black uppercase leading-none tracking-tight text-cream">
                  {copy.password.title}
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-silver">
              {copy.password.intro}
            </p>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-5 p-5 sm:p-6"
            noValidate
          >
            <PasswordField
              id={currentPasswordId}
              name="currentPassword"
              label={copy.password.currentPasswordLabel}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              copy={copy}
              disabled={passwordPending}
            />

            <PasswordField
              id={newPasswordId}
              name="newPassword"
              label={copy.password.newPasswordLabel}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              hint={copy.password.hint}
              hintId={newPasswordHintId}
              copy={copy}
              disabled={passwordPending}
            />

            <PasswordField
              id={confirmPasswordId}
              name="confirmPassword"
              label={copy.password.confirmPasswordLabel}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              copy={copy}
              disabled={passwordPending}
            />

            <button
              type="submit"
              disabled={passwordPending}
              className={buttonClass}
            >
              {passwordPending ? <Spinner /> : null}
              {passwordPending ? copy.password.pending : copy.password.submit}
            </button>
          </form>
        </section>
      </div>

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
