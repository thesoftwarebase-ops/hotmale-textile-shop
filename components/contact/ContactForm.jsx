"use client";

import { useCallback, useState } from "react";
import Toast from "../ui/Toast";

const ENDPOINT = "/api/contact";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY_VALUES = { name: "", email: "", phone: "", message: "" };
const FIELDS = ["name", "email", "phone", "message"];
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

function formatReceived(isoDate) {
  if (!isoDate) return "";
  try {
    return `${new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoDate))} IST`;
  } catch {
    return "";
  }
}

async function sendEnquiryEmail(values, receivedAt, accessKey) {
  if (!accessKey) {
    console.warn(
      "Enquiry email skipped: no Web3Forms access key is saved in Settings.",
    );
    return;
  }

  const subjectName = values.name.replace(/[\r\n]+/g, " ").trim();

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `New enquiry from ${subjectName} — HOTMALE`,
      from_name: "HOTMALE Website",
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || "Not provided",
      message: values.message.trim(),
      received_at: formatReceived(receivedAt),
      source: "HOTMALE website contact form",
    }),
    signal: AbortSignal.timeout(10000),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || result?.error || `Web3Forms HTTP ${response.status}`,
    );
  }
}

function inputClass(hasError) {
  return `w-full rounded-sm border bg-ink/60 px-4 py-3 text-sm text-cream placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-1 disabled:opacity-60 ${
    hasError
      ? "border-[#c65a4a] focus:border-[#e8927f] focus:ring-[#e8927f]/60"
      : "border-graphite focus:border-gold focus:ring-gold/60"
  }`;
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-silver"
      >
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[#f0a58f]">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Enquiry form. Validates locally, stores the enquiry through
 * /api/contact, then forwards it to Web3Forms using the access key
 * returned from admin settings. Email failures never block the stored
 * enquiry or the success toast.
 */
export default function ContactForm({ form, dismissLabel }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    variant: "success",
    title: "",
    message: "",
  });

  const dismissToast = useCallback(() => {
    setToast((current) => ({ ...current, open: false }));
  }, []);

  const update = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const messages = form.fieldErrors;
    const next = {};
    if (!values.name.trim()) next.name = messages.name;
    if (!EMAIL_PATTERN.test(values.email.trim())) next.email = messages.email;
    const digits = values.phone.replace(/\D/g, "");
    if (digits && (digits.length < 7 || digits.length > 15)) {
      next.phone = messages.phone;
    }
    if (!values.message.trim()) next.message = messages.message;
    return next;
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    const firstInvalid = FIELDS.find((field) => nextErrors[field]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      setToast({
        open: true,
        variant: "error",
        title: form.invalidTitle,
        message: form.invalidMessage,
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.ok && payload?.ok) {
        try {
          await sendEnquiryEmail(values, payload.receivedAt, payload.emailKey);
        } catch (error) {
          console.error("Enquiry email delivery failed:", error.message);
        }
        setValues(EMPTY_VALUES);
        setErrors({});
        setToast({
          open: true,
          variant: "success",
          title: form.successTitle,
          message: payload.message ?? form.successMessage,
        });
      } else {
        setErrors(
          payload?.errors && typeof payload.errors === "object"
            ? payload.errors
            : {},
        );
        setToast({
          open: true,
          variant: "error",
          title: form.errorTitle,
          message: payload?.message ?? form.invalidMessage,
        });
      }
    } catch {
      setToast({
        open: true,
        variant: "error",
        title: form.errorTitle,
        message: form.errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
        <fieldset disabled={submitting} className="mt-8 space-y-5 border-0 p-0">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="contact-name"
              label={form.fields.name.label}
              error={errors.name}
            >
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={120}
                placeholder={form.fields.name.placeholder}
                value={values.name}
                onChange={update("name")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={inputClass(Boolean(errors.name))}
              />
            </Field>
            <Field
              id="contact-email"
              label={form.fields.email.label}
              error={errors.email}
            >
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder={form.fields.email.placeholder}
                value={values.email}
                onChange={update("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "contact-email-error" : undefined
                }
                className={inputClass(Boolean(errors.email))}
              />
            </Field>
          </div>

          <Field
            id="contact-phone"
            label={form.fields.phone.label}
            error={errors.phone}
          >
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={20}
              placeholder={form.fields.phone.placeholder}
              value={values.phone}
              onChange={update("phone")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "contact-phone-error" : undefined}
              className={inputClass(Boolean(errors.phone))}
            />
          </Field>

          <Field
            id="contact-message"
            label={form.fields.message.label}
            error={errors.message}
          >
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              required
              maxLength={4000}
              placeholder={form.fields.message.placeholder}
              value={values.message}
              onChange={update("message")}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "contact-message-error" : undefined
              }
              className={`${inputClass(Boolean(errors.message))} resize-y`}
            />
          </Field>

          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-sm bg-gold px-8 py-3.5 font-display text-base font-black uppercase tracking-wide text-ink transition-all duration-300 hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? form.submittingLabel : form.submitLabel}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </button>
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              {form.note}
            </p>
          </div>
        </fieldset>
      </form>

      <Toast
        open={toast.open}
        variant={toast.variant}
        title={toast.title}
        message={toast.message}
        dismissLabel={dismissLabel}
        onDismiss={dismissToast}
      />
    </>
  );
}
