"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./ui/Modal";
import { authFetch, clearToken } from "../../../lib/client-auth";

const EYEBROWS = {
  categories: "deleteCategory",
  collections: "deleteCollection",
  products: "deleteProduct",
  stores: "deleteStore",
};

export default function CatalogueDeleteDialog({
  resource,
  item,
  copy,
  onClose,
  onDeleted,
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // The store editor reuses the shared editor strings and overrides the
  // few that talk about a branch rather than a catalogue item.
  const ns = useMemo(
    () =>
      resource === "stores" && copy.stores
        ? { ...copy.catalogue, ...copy.stores }
        : copy.catalogue,
    [copy, resource],
  );

  const remove = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const response = await authFetch(
        `/api/admin/resources/${resource}/${item.id}`,
        { method: "DELETE" },
      );

      if (response.status === 401) {
        clearToken();
        router.replace("/admin");
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(
          payload.code === "in_use"
            ? ns.deleteBlocked
            : ns.deleteError,
        );
        return;
      }

      onDeleted?.();
    } catch {
      setError(ns.deleteError);
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    ns.deleteBlocked,
    ns.deleteError,
    item.id,
    onDeleted,
    resource,
    router,
  ]);

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy="catalogue-delete-title"
      closeLabel={ns.close}
      size="max-w-lg"
    >
      <header className="flex items-start gap-4 border-b border-white/10 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#e8927f]">
            {ns[EYEBROWS[resource]]}
          </p>
          <h2
            id="catalogue-delete-title"
            className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-cream"
          >
            {ns.deleteTitle.replace("{name}", item.name)}
          </h2>
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

      <div className="px-5 py-5">
        <p className="text-sm leading-6 text-silver">
          {resource === "collections"
            ? ns.deleteCollectionBody || ns.deleteBody
            : ns.deleteBody}
        </p>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-sm border border-red-400/25 bg-red-400/[0.06] px-4 py-3 text-xs leading-5 text-red-200"
          >
            {error}
          </p>
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
          onClick={remove}
          disabled={busy}
          className="inline-flex min-h-[44px] items-center rounded-sm border border-red-400/40 bg-red-400/[0.08] px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f0a58f] transition-colors hover:bg-red-400/[0.16] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {busy ? ns.deleting : ns.deleteIt}
        </button>
      </footer>
    </Modal>
  );
}
