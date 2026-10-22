"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CmsForm from "./CmsForm";
import Modal from "./ui/Modal";
import { authFetch, clearToken } from "../../../lib/client-auth";
import { emptyFromFields, getResourceSchema } from "../../../lib/cms/schema";

const TITLES = {
  categories: ["createCategory", "editCategory"],
  collections: ["createCollection", "editCollection"],
  products: ["createProduct", "editProduct"],
  stores: ["createStore", "editStore"],
};

// The parent level owns these references, so the form does not offer to
// move an item out of the branch it was opened in. Position is managed
// by dragging the cards, and a product's slug is generated from its
// name, so neither is an editable field here.
const HIDDEN_FIELDS = {
  categories: ["order"],
  collections: ["category", "order"],
  products: ["category", "collection", "order", "slug"],
  stores: ["order"],
};

export default function CatalogueDialog({
  resource,
  id = null,
  parent = {},
  copy,
  options = {},
  onClose,
  onSaved,
}) {
  const router = useRouter();
  const schema = getResourceSchema(resource);
  const [value, setValue] = useState(null);
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const creating = !id;

  // The store editor reuses the shared editor strings and overrides the
  // few that talk about a branch rather than a catalogue item.
  const ns = useMemo(
    () =>
      resource === "stores" && copy.stores
        ? { ...copy.catalogue, ...copy.stores }
        : copy.catalogue,
    [copy, resource],
  );

  const fields = useMemo(
    () =>
      (schema?.fields ?? []).filter(
        (field) => !(HIDDEN_FIELDS[resource] ?? []).includes(field.name),
      ),
    [resource, schema],
  );

  // CmsForm reads its small labels from the top level; the catalogue
  // editor is handed the whole CMS copy, so bridge the two.
  const formCopy = useMemo(
    () => ({
      ...copy,
      addItem: copy.addItem ?? copy.form.addItem,
      removeItem: copy.removeItem ?? copy.form.removeItem,
      moveUp: copy.moveUp ?? copy.form.moveUp,
      moveDown: copy.moveDown ?? copy.form.moveDown,
      noItems: copy.noItems ?? copy.form.noItems,
      referenceAll: copy.referenceAll ?? copy.form.referenceAll,
    }),
    [copy],
  );

  useEffect(() => {
    if (!schema) return undefined;
    let active = true;

    async function load() {
      if (!id) {
        const blank = {
          ...emptyFromFields(schema.fields),
          ...schema.defaults,
        };
        if (resource === "collections") blank.category = parent.category ?? "";
        if (resource === "products") {
          blank.category = parent.category ?? "";
          blank.collection = parent.collection ?? "";
        }
        setValue(blank);
        setStatus("ready");
        return;
      }

      try {
        const response = await authFetch(
          `/api/admin/resources/${resource}/${id}`,
          { cache: "no-store" },
        );
        if (response.status === 401) {
          clearToken();
          router.replace("/admin");
          return;
        }
        const payload = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok) {
          setStatus("error");
          return;
        }
        setValue(payload.item);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [
    id,
    parent.category,
    parent.collection,
    resource,
    router,
    schema,
  ]);

  const save = useCallback(async () => {
    if (!value || saving || status !== "ready") return;
    setSaving(true);
    setErrors([]);

    const payloadValue = { ...value };
    if (resource === "collections" && parent.category) {
      payloadValue.category = parent.category;
    }
    if (resource === "products" && parent.collection) {
      payloadValue.collection = parent.collection;
      payloadValue.category = parent.category ?? payloadValue.category;
    }

    try {
      const response = await authFetch(
        id
          ? `/api/admin/resources/${resource}/${id}`
          : `/api/admin/resources/${resource}`,
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadValue),
        },
      );

      if (response.status === 401) {
        clearToken();
        router.replace("/admin");
        return;
      }

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages = Object.values(payload.errors ?? {}).filter(Boolean);
        setErrors(
          messages.length > 0
            ? messages.slice(0, 3)
            : [ns.saveError],
        );
        return;
      }

      onSaved?.(payload.item);
    } catch {
      setErrors([ns.saveError]);
    } finally {
      setSaving(false);
    }
  }, [
    ns.saveError,
    id,
    onSaved,
    parent.category,
    parent.collection,
    resource,
    router,
    saving,
    status,
    value,
  ]);

  if (!schema) return null;

  const title = ns[TITLES[resource][creating ? 0 : 1]];
  const context = [parent.categoryName, parent.collectionName]
    .filter(Boolean)
    .join(" / ");

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy="catalogue-dialog-title"
      closeLabel={ns.close}
    >
      <header className="flex items-start gap-4 border-b border-white/10 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-gold">
            {creating ? copy.form.createEyebrow : copy.form.editEyebrow}
          </p>
          <h2
            id="catalogue-dialog-title"
            className="mt-2 font-display text-2xl font-black uppercase leading-none tracking-tight text-cream"
          >
            {title}
          </h2>
          {context ? (
            <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
              {ns.formInside.replace("{name}", context)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={ns.close}
          className="-m-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-xl leading-none text-muted transition-colors hover:bg-white/[0.04] hover:text-cream"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {status === "loading" ? (
          <div className="space-y-4">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-24 animate-pulse rounded-sm border border-white/10 bg-white/[0.03]"
              />
            ))}
            <p className="sr-only">{copy.form.loading}</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="rounded-sm border border-red-400/20 bg-red-400/[0.04] p-5">
            <p className="text-sm text-silver">{copy.form.error}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex min-h-[42px] items-center rounded-sm border border-gold/50 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-gold"
            >
              {ns.close}
            </button>
          </div>
        ) : null}

        {status === "ready" && value ? (
          <>
            {errors.length > 0 ? (
              <div
                role="alert"
                className="mb-5 rounded-sm border border-red-400/25 bg-red-400/[0.06] px-4 py-3"
              >
                {errors.map((message) => (
                  <p key={message} className="text-xs leading-5 text-red-200">
                    {message}
                  </p>
                ))}
              </div>
            ) : null}

            <CmsForm
              fields={fields}
              value={value}
              onChange={setValue}
              options={options}
              copy={formCopy}
            />

            {creating ? (
              <p className="mt-5 text-[10px] leading-5 text-muted">
                {ns.slugHint}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] items-center rounded-sm border border-white/10 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-white/25 hover:text-cream"
        >
          {ns.cancel}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || status !== "ready"}
          className="inline-flex min-h-[44px] items-center rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? ns.saving
            : creating
              ? ns.create
              : ns.save}
        </button>
      </footer>
    </Modal>
  );
}
