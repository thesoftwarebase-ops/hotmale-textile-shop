"use client";

import { defaultForField, emptyFromFields } from "../../../lib/cms/schema";
import ImageField from "./ImageField";

const inputClass =
  "h-11 w-full rounded-sm border border-white/10 bg-ink/80 px-3 text-sm text-cream outline-none transition-colors placeholder:text-muted/70 hover:border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/10";
const textareaClass =
  "min-h-28 w-full rounded-sm border border-white/10 bg-ink/80 px-3 py-2.5 text-sm leading-6 text-cream outline-none transition-colors placeholder:text-muted/70 hover:border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/10";
const labelClass =
  "block text-[9px] font-bold uppercase tracking-[0.22em] text-muted";
const fullWidthTypes = new Set(["textarea", "object", "repeater", "list", "multiReference"]);
const compositeTypes = new Set(["object", "repeater", "list", "multiReference"]);

function humanize(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function cloneObject(value) {
  if (Array.isArray(value)) return [...value];
  if (value && typeof value === "object") return { ...value };
  return {};
}

function setAtPath(root, path, next) {
  if (path.length === 0) return next;
  const clone = cloneObject(root);
  let cursor = clone;

  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    const child = cursor[key];
    cursor[key] = Array.isArray(child) ? [...child] : cloneObject(child);
    cursor = cursor[key];
  }

  cursor[path[path.length - 1]] = next;
  return clone;
}

function Icon({ name }) {
  const paths = {
    up: <path d="m6 14 6-6 6 6" />,
    down: <path d="m6 10 6 6 6-6" />,
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      {paths[name]}
    </svg>
  );
}

function SmallButton({ label, icon, onClick, danger = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-sm border transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        danger
          ? "border-red-400/20 text-red-300 hover:border-red-400/50 hover:bg-red-400/10"
          : "border-white/10 text-muted hover:border-gold/40 hover:text-gold"
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}

function FieldShell({ field, path, children }) {
  const id = `${path}-${field.name}`.replace(/\./g, "-");
  const className =
    fullWidthTypes.has(field.type) || field.fullWidth ? "sm:col-span-2" : "";
  const label = (
    <>
      {field.label || humanize(field.name)}
      {field.required ? <span className="ml-1 text-gold">*</span> : null}
    </>
  );

  if (field.type === "boolean") {
    return <div className={className}>{children}</div>;
  }

  if (compositeTypes.has(field.type)) {
    return (
      <div className={className}>
        <p id={`${id}-label`} className={labelClass}>
          {label}
        </p>
        <div
          className="mt-2"
          role="group"
          aria-labelledby={`${id}-label`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ReferenceOptions({ field, value, options, onChange, copy }) {
  const items = options?.[field.resource] ?? [];
  const exists = items.some((item) => item.slug === value);

  return (
    <select
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    >
      <option value="">{copy.form.selectEmpty}</option>
      {!exists && value ? (
        <option value={value}>
          {copy.form.missingReference}: {value}
        </option>
      ) : null}
      {items.map((item) => (
        <option key={item.slug} value={item.slug}>
          {item.name} ({item.slug})
          {item.status === "draft" ? ` ${copy.form.draftSuffix}` : ""}
        </option>
      ))}
    </select>
  );
}

function MultiReference({ field, value, options, onChange, copy }) {
  const selected = Array.isArray(value) ? value : [];
  const items = options?.[field.resource] ?? [];
  const allSelected = Boolean(field.allOption && selected.includes(field.allOption));

  function toggle(slug) {
    if (selected.includes(slug)) {
      onChange(selected.filter((entry) => entry !== slug));
      return;
    }
    onChange([
      ...selected.filter((entry) => !field.allOption || entry !== field.allOption),
      slug,
    ]);
  }

  function toggleAll() {
    if (allSelected) onChange([]);
    else onChange([field.allOption]);
  }

  if (items.length === 0 && !field.allOption) {
    return <p className="text-xs text-muted">{copy.noItems}</p>;
  }

  return (
    <div className="grid gap-2 rounded-sm border border-white/10 bg-ink/50 p-3 sm:grid-cols-2">
      {field.allOption ? (
        <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sm border border-gold/20 bg-gold/[0.04] px-3 text-xs text-cream">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="accent-[var(--flame-gold)]"
          />
          {copy.referenceAll}
        </label>
      ) : null}
      {items.map((item) => (
        <label
          key={item.slug}
          className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sm border border-white/[0.07] px-3 text-xs text-silver transition-colors hover:border-white/20 hover:text-cream"
        >
          <input
            type="checkbox"
            checked={!allSelected && selected.includes(item.slug)}
            disabled={allSelected}
            onChange={() => toggle(item.slug)}
            className="accent-[var(--flame-gold)] disabled:opacity-40"
          />
          <span className="min-w-0 truncate">
            {item.name}
            <span className="ml-1 text-muted">({item.slug})</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function ListField({ field, value, path, onChange, copy }) {
  const items = Array.isArray(value) ? value : [];

  function updateItem(index, next) {
    const copyItems = [...items];
    copyItems[index] = next;
    onChange(copyItems);
  }

  function remove(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={`${path}-${index}`}
          className="flex items-start gap-2 rounded-sm border border-white/[0.07] bg-ink/50 p-2.5"
        >
          {field.itemType === "image" ? (
            <div className="min-w-0 flex-1">
              <ImageField
                field={field}
                value={item}
                onChange={(next) => updateItem(index, next)}
                copy={copy}
                section={field.section}
              />
            </div>
          ) : null}
          {field.itemType === "textarea" ? (
            <textarea
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              rows={3}
              className={`${textareaClass} min-h-20 flex-1`}
            />
          ) : null}
          {field.itemType !== "image" && field.itemType !== "textarea" ? (
            <input
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              className={`${inputClass} flex-1`}
            />
          ) : null}
          <SmallButton
            label={copy.removeItem}
            icon="trash"
            danger
            onClick={() => remove(index)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-sm border border-dashed border-white/15 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted transition-colors hover:border-gold/40 hover:text-gold"
      >
        <Icon name="plus" />
        {field.addLabel || copy.addItem}
      </button>
    </div>
  );
}

function RepeaterField({ field, value, path, onChange, options, copy }) {
  const items = Array.isArray(value) ? value : [];
  const labelField = field.itemLabel
    ? field.fields.find(
        (entry) =>
          entry.name === "name" ||
          entry.name === "title" ||
          entry.name === "question" ||
          entry.name === "label" ||
          entry.name === "year",
      )?.name
    : null;

  function updateItem(index, next) {
    const nextItems = [...items];
    nextItems[index] = next;
    onChange(nextItems);
  }

  function move(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const nextItems = [...items];
    [nextItems[index], nextItems[nextIndex]] = [
      nextItems[nextIndex],
      nextItems[index],
    ];
    onChange(nextItems);
  }

  function remove(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function add() {
    const nextItem = emptyFromFields(field.fields);
    if (Object.hasOwn(nextItem, "order")) {
      nextItem.order = items.length + 1;
    }
    onChange([...items, nextItem]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const title =
          (labelField && item?.[labelField]) ||
          item?.id ||
          `${field.itemLabel || copy.form.itemFallback} ${index + 1}`;
        return (
          <article
            key={`${path}-${index}`}
            className="overflow-hidden rounded-sm border border-white/[0.08] bg-white/[0.018]"
          >
            <header className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
              <span className="mr-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-gold/20 px-1.5 text-[9px] font-bold tabular-nums text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h4 className="min-w-0 flex-1 truncate font-display text-sm font-bold uppercase tracking-wide text-cream">
                {title}
              </h4>
              <SmallButton
                label={copy.moveUp}
                icon="up"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              />
              <SmallButton
                label={copy.moveDown}
                icon="down"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              />
              {field.deletable !== false ? (
                <SmallButton
                  label={copy.removeItem}
                  icon="trash"
                  danger
                  onClick={() => remove(index)}
                />
              ) : null}
            </header>
            <div className="p-3">
              <CmsForm
                fields={field.fields}
                value={item ?? {}}
                onChange={(next) => updateItem(index, next)}
                options={options}
                copy={copy}
                path={`${path}.${field.name}.${index}`}
              />
            </div>
          </article>
        );
      })}

      {items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-white/10 px-3 py-6 text-center text-xs text-muted">
          {copy.noItems}
        </p>
      ) : null}

      {field.addable !== false ? (
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-sm border border-dashed border-white/15 px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted transition-colors hover:border-gold/40 hover:text-gold"
        >
          <Icon name="plus" />
          {field.addLabel || copy.addItem}
        </button>
      ) : null}
    </div>
  );
}

function FieldControl({ field, value, onChange, options, copy, path }) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          id={`${path}-${field.name}`.replace(/\./g, "-")}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          rows={field.rows ?? 4}
          className={textareaClass}
        />
      );
    case "number":
      return (
        <input
          id={`${path}-${field.name}`.replace(/\./g, "-")}
          type="number"
          min={field.min}
          step="any"
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? null : Number(event.target.value))
          }
          className={inputClass}
        />
      );
    case "boolean":
      return (
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border border-white/10 bg-ink/60 px-3.5 text-xs text-silver transition-colors hover:border-white/20">
          <input
            id={`${path}-${field.name}`.replace(/\./g, "-")}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-[var(--flame-gold)]"
        />
          {field.label || humanize(field.name)}
          {field.required ? <span className="ml-1 text-gold">*</span> : null}
        </label>
      );
    case "select":
      return (
        <select
          id={`${path}-${field.name}`.replace(/\./g, "-")}
          value={value ?? field.default ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "reference":
      return (
        <ReferenceOptions
          field={field}
          value={value}
          options={options}
          onChange={onChange}
          copy={copy}
        />
      );
    case "multiReference":
      return (
        <MultiReference
          field={field}
          value={value}
          options={options}
          onChange={onChange}
          copy={copy}
        />
      );
    case "list":
      return (
        <ListField
          field={field}
          value={value}
          path={path}
          onChange={onChange}
          copy={copy}
        />
      );
    case "repeater":
      return (
        <RepeaterField
          field={field}
          value={value}
          path={path}
          onChange={onChange}
          options={options}
          copy={copy}
        />
      );
    case "object":
      return (
        <div className="rounded-sm border border-white/[0.08] bg-black/20 p-3 sm:p-4">
          <CmsForm
            fields={field.fields}
            value={value ?? {}}
            onChange={onChange}
            options={options}
            copy={copy}
            path={`${path}.${field.name}`}
          />
        </div>
      );
    case "readonly":
      return (
        <input
          id={`${path}-${field.name}`.replace(/\./g, "-")}
          value={value ?? ""}
          readOnly
          className={`${inputClass} cursor-not-allowed text-muted`}
        />
      );
    case "image":
      return (
        <ImageField
          id={`${path}-${field.name}`.replace(/\./g, "-")}
          field={field}
          value={value ?? ""}
          onChange={onChange}
          copy={copy}
          section={field.section}
        />
      );
    default:
      return (
        <input
          id={`${path}-${field.name}`.replace(/\./g, "-")}
          type={field.type === "url" ? "url" : "text"}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      );
  }
}

export default function CmsForm({
  fields,
  value,
  onChange,
  options = {},
  copy,
  path = "root",
}) {
  function update(field, next) {
    onChange(setAtPath(value ?? {}, [field.name], next));
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <FieldShell key={field.name} field={field} path={path}>
          {field.type === "object" || field.type === "repeater" || field.type === "list" || field.type === "multiReference" ? (
            <FieldControl
              field={field}
              value={value?.[field.name] ?? defaultForField(field)}
              onChange={(next) => update(field, next)}
              options={options}
              copy={copy}
              path={path}
            />
          ) : null}
          {field.type !== "object" &&
          field.type !== "repeater" &&
          field.type !== "list" &&
          field.type !== "multiReference" ? (
            <FieldControl
              field={field}
              value={value?.[field.name]}
              onChange={(next) => update(field, next)}
              options={options}
              copy={copy}
              path={path}
            />
          ) : null}
        </FieldShell>
      ))}
    </div>
  );
}
