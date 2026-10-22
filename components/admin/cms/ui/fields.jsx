"use client";

const labelClass =
  "block text-[9px] font-bold uppercase tracking-[0.22em] text-muted";
const inputClass =
  "w-full rounded-sm border border-white/10 bg-ink/80 px-3 text-sm text-cream outline-none transition-colors placeholder:text-muted/70 hover:border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/10";
const areaClass = `${inputClass} min-h-24 py-2.5 leading-6`;

export function Panel({ title, description, actions, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b] ${className}`}
    >
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title ? (
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-cream">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  hint,
  type = "text",
  min,
  max,
}) {
  return (
    <label className="block">
      {label ? <span className={labelClass}>{label}</span> : null}
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`${inputClass} mt-2 h-11`}
      />
      {hint ? <span className="mt-1.5 block text-[10px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
}) {
  return (
    <label className="block">
      {label ? <span className={labelClass}>{label}</span> : null}
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${areaClass} mt-2`}
      />
      {hint ? <span className="mt-1.5 block text-[10px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      {label ? <span className={labelClass}>{label}</span> : null}
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} mt-2 h-11`}
      >
        {(options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ label, checked, onChange, hint, onLabel, offLabel }) {
  const on = Boolean(checked);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="group flex w-full items-center justify-between gap-4 rounded-sm border border-white/10 bg-ink/50 px-3.5 py-3 text-left transition-colors hover:border-gold/35"
    >
      <span className="min-w-0">
        <span
          className={`${labelClass} block transition-colors group-hover:text-silver`}
        >
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-[10px] text-muted">{hint}</span>
        ) : null}
      </span>

      <span className="flex shrink-0 items-center gap-3">
        <span
          className={`text-[9px] font-bold uppercase tracking-[0.22em] transition-colors ${
            on ? "text-gold" : "text-muted"
          }`}
        >
          {on ? onLabel : offLabel}
        </span>
        <span
          aria-hidden="true"
          className={`relative block h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 ${
            on ? "border-gold/70 bg-gold/20" : "border-white/12 bg-ink"
          }`}
        >
          <span
            className={`absolute top-0.5 block h-4 w-4 rounded-full transition-all duration-300 ${
              on
                ? "left-[1.375rem] bg-gold shadow-[0_0_14px_rgba(230,196,64,0.6)]"
                : "left-0.5 bg-muted/70"
            }`}
          />
        </span>
      </span>
    </button>
  );
}

export function Grid({ children, columns = 2 }) {
  return (
    <div
      className={`grid gap-4 ${
        columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "ghost",
  type = "button",
  disabled = false,
  className = "",
}) {
  const variants = {
    gold: "border-gold bg-gold text-ink hover:bg-gold-highlight",
    ghost:
      "border-white/10 text-silver hover:border-gold/40 hover:text-gold",
    danger:
      "border-red-400/25 text-red-300 hover:border-red-400/60 hover:bg-red-400/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border px-4 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
