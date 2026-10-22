"use client";

import { useRef, useState } from "react";
import { folderForSection, MAX_UPLOAD_BYTES, WEBP_MIME } from "../../../lib/imagekit-folders";
import { authFetch } from "../../../lib/client-auth";

/**
 * Image field for the CMS: uploads to ImageKit (WebP only, folder chosen
 * server-side) or accepts a pasted path/URL for assets that already live
 * in /public. Previews are painted as backgrounds so any pasted URL works
 * without extra remote-image configuration.
 */
export default function ImageField({
  id,
  field,
  value,
  onChange,
  copy,
  section,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const folder = folderForSection(section) ?? copy.form.uploadFolderFallback;

  async function upload(file) {
    if (!file) return;
    setError(null);

    if (file.type !== WEBP_MIME || !file.name.toLowerCase().endsWith(".webp")) {
      setError(copy.form.onlyWebp);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(copy.form.tooLarge);
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("section", section ?? "");

      const response = await authFetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        setError(
          payload.code === "too_large"
            ? copy.form.tooLarge
            : payload.code === "not_webp"
              ? copy.form.onlyWebp
              : copy.form.uploadFailed,
        );
        return;
      }

      onChange(payload.url);
    } catch {
      setError(copy.form.uploadFailed);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    upload(event.dataTransfer?.files?.[0]);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-sm border transition-colors ${
          dragging
            ? "border-gold bg-gold/[0.06]"
            : "border-white/10 bg-ink/60 hover:border-white/20"
        }`}
      >
        <div
          className="relative flex h-40 items-center justify-center bg-charcoal bg-cover bg-center"
          style={value ? { backgroundImage: `url("${value}")` } : undefined}
        >
          {!value ? (
            <span className="px-6 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              {copy.form.noImage}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-3 py-2.5">
          <input
            ref={inputRef}
            type="file"
            accept={WEBP_MIME}
            className="sr-only"
            onChange={(event) => upload(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex min-h-9 items-center gap-2 rounded-sm border border-gold/40 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
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
            ) : null}
            {busy ? copy.form.uploading : copy.form.upload}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex min-h-9 items-center rounded-sm border border-white/10 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copy.form.browse}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={busy}
              className="inline-flex min-h-9 items-center rounded-sm border border-red-400/20 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-red-300 transition-colors hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.form.clear}
            </button>
          ) : null}
          <span className="ml-auto truncate text-[9px] uppercase tracking-[0.16em] text-muted">
            {copy.form.uploadsTo} {folder}
          </span>
        </div>
      </div>

      <label className="block">
        <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
          {copy.form.usePath}
        </span>
        <input
          id={id}
          type="text"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={copy.form.usePathPlaceholder}
          className="mt-2 h-10 w-full rounded-sm border border-white/10 bg-ink/80 px-3 text-xs text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-gold"
        />
      </label>

      {error ? (
        <p className="rounded-sm border border-red-400/20 bg-red-400/[0.05] px-3 py-2 text-[11px] text-red-300">
          {error}
        </p>
      ) : (
        <p className="text-[10px] leading-4 text-muted">{copy.form.imageHint}</p>
      )}
    </div>
  );
}
