"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CatalogueDialog from "./CatalogueDialog";
import CatalogueDeleteDialog from "./CatalogueDeleteDialog";
import SortableGrid from "./ui/SortableGrid";
import ReorderControls from "./ui/ReorderControls";
import Toast from "../../ui/Toast";
import { authFetch, clearToken } from "../../../lib/client-auth";

function CardButton({ onClick, children, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-20 inline-flex h-8 items-center rounded-sm border px-2.5 text-[8px] font-bold uppercase tracking-[0.14em] transition-colors ${
        danger
          ? "border-red-400/20 text-red-300 hover:bg-red-400/10"
          : "border-white/10 text-silver hover:border-gold/40 hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}

function StoreCard({
  entry,
  copy,
  ns,
  ordering,
  canUp,
  canDown,
  onMove,
  onEdit,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const photo = entry.photo;
  const phone = entry.phone || entry.whatsapp || entry.landline;

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 40 : undefined,
      }}
      className={`group relative flex flex-col overflow-hidden rounded-md border bg-[#0b0b0b] transition-colors ${
        isDragging
          ? "border-gold/60 opacity-80"
          : "border-white/10 hover:border-gold/40"
      }`}
    >
      <div
        className="relative aspect-[16/9] w-full bg-charcoal bg-cover bg-center"
        style={photo ? { backgroundImage: `url("${photo}")` } : undefined}
      >
        {photo ? null : (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
            {ns.photoMissing}
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-xl font-black uppercase leading-tight tracking-tight text-cream">
            {entry.name}
          </h3>
          <p className="mt-1 truncate text-[10px] tracking-[0.12em] text-muted">
            /{entry.slug}
          </p>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <ReorderControls
            dragLabel={ns.dragItem.replace("{name}", entry.name)}
            upLabel={copy.form.moveUp}
            downLabel={copy.form.moveDown}
            activatorRef={setActivatorNodeRef}
            attributes={attributes}
            listeners={listeners}
            onMove={onMove}
            canUp={canUp}
            canDown={canDown}
            ordering={ordering}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-[11px] leading-5 text-silver">
          {entry.address}
        </p>
        <dl className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <dt className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
              {ns.hours}
            </dt>
            <dd className="mt-0.5 truncate text-[11px] text-cream">
              {entry.hours}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
              {ns.phone}
            </dt>
            <dd className="tnum mt-0.5 truncate text-[11px] text-cream">
              {phone || "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-3">
        <a
          href={`/stores/${entry.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted transition-colors hover:text-gold"
        >
          {ns.openPage}
          <span aria-hidden="true">↗</span>
        </a>
        <div className="flex shrink-0 items-center gap-1.5">
          <CardButton onClick={() => onEdit(entry)}>{copy.list.edit}</CardButton>
          <CardButton danger onClick={() => onDelete(entry)}>
            {copy.list.delete}
          </CardButton>
        </div>
      </div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="h-80 animate-pulse rounded-md border border-white/10 bg-white/[0.025]"
        />
      ))}
    </div>
  );
}

/**
 * Branches board. A branch is a flat list, so the board is one level
 * deep: create and edit happen in popups, the grip and the arrows set
 * the order the public stores page shows, and every save keeps the
 * footer link on the route the branch serves.
 */
export default function StoresBoard({ copy }) {
  const router = useRouter();
  const ns = { ...copy.catalogue, ...copy.stores };
  const [stores, setStores] = useState(null);
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const orderingRef = useRef(false);

  const dismissToast = useCallback(() => setToast(null), []);
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await authFetch("/api/admin/resources/stores", {
          cache: "no-store",
        });

        if (response.status === 401) {
          clearToken();
          router.replace("/admin");
          return;
        }

        if (!response.ok) throw new Error("stores_failed");

        const payload = await response.json().catch(() => ({}));
        if (!active) return;
        setStores(Array.isArray(payload.items) ? payload.items : []);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [reloadKey, router]);

  async function commitOrder(nextItems) {
    if (orderingRef.current) return;
    orderingRef.current = true;
    setOrdering(true);
    setStores(nextItems);

    try {
      const response = await authFetch("/api/admin/resources/stores/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: nextItems.map((entry) => entry.id) }),
      });

      if (response.status === 401) {
        clearToken();
        router.replace("/admin");
        return;
      }

      if (!response.ok) throw new Error("reorder_failed");
    } catch {
      setToast({
        variant: "error",
        title: ns.reorderErrorTitle,
        message: ns.saveError,
      });
      refresh();
    } finally {
      orderingRef.current = false;
      setOrdering(false);
    }
  }

  function moveItem(index, direction) {
    if (orderingRef.current) return;
    const target = index + direction;
    const items = stores ?? [];
    if (target < 0 || target >= items.length) return;
    const nextItems = [...items];
    [nextItems[index], nextItems[target]] = [nextItems[target], nextItems[index]];
    commitOrder(nextItems);
  }

  function handleSaved(item) {
    const wasCreating = !dialog?.id;
    setDialog(null);
    setToast({
      variant: "success",
      title: wasCreating ? ns.createdTitle : ns.savedTitle,
      message: wasCreating ? ns.createdBody : ns.savedBody,
    });
    refresh();
  }

  function handleDeleted() {
    setDeleting(null);
    setToast({
      variant: "success",
      title: ns.deletedTitle,
      message: ns.deletedBody,
    });
    refresh();
  }

  const items = stores ?? [];

  return (
    <>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
                <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
                {ns.eyebrow}
              </p>
              <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-cream sm:text-5xl">
                {ns.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-silver">
                {ns.intro}
              </p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                <span className="tnum text-gold">
                  {String(items.length).padStart(2, "0")}
                </span>{" "}
                {items.length === 1 ? ns.branchOne : ns.branchMany}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setDialog({ resource: "stores", id: null, parent: {} })}
                disabled={status !== "ready"}
                className="inline-flex min-h-[46px] items-center rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-55"
              >
                {ns.newStore}
              </button>
            </div>
          </div>

          <p className="flex items-start gap-2.5 rounded-sm border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[11px] leading-5 text-muted">
            <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-gold/70" />
            {ns.footerNote}
          </p>
        </header>

        {status === "loading" ? <Skeleton /> : null}

        {status === "error" ? (
          <div className="rounded-md border border-red-400/20 bg-red-400/[0.04] p-6">
            <p className="text-sm text-silver">{ns.error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 inline-flex min-h-[42px] items-center rounded-sm border border-gold/50 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-gold"
            >
              {copy.form.retry}
            </button>
          </div>
        ) : null}

        {status === "ready" ? (
          items.length === 0 ? (
            <div className="rounded-md border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center">
              <p className="font-display text-2xl font-black uppercase tracking-tight text-cream">
                {ns.emptyStores}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                {ns.emptyStoresBody}
              </p>
              <button
                type="button"
                onClick={() => setDialog({ resource: "stores", id: null, parent: {} })}
                className="mt-6 inline-flex min-h-[46px] items-center rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight"
              >
                {ns.newStore}
              </button>
            </div>
          ) : (
            <SortableGrid
              items={items}
              onReorder={commitOrder}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {items.map((entry, index) => (
                <StoreCard
                  key={entry.id}
                  entry={entry}
                  copy={copy}
                  ns={ns}
                  ordering={ordering}
                  canUp={index > 0}
                  canDown={index < items.length - 1}
                  onMove={(direction) => moveItem(index, direction)}
                  onEdit={(item) =>
                    setDialog({ resource: "stores", id: item.id, parent: {} })
                  }
                  onDelete={(item) =>
                    setDeleting({ resource: "stores", item })
                  }
                />
              ))}
            </SortableGrid>
          )
        ) : null}
      </div>

      {dialog ? (
        <CatalogueDialog
          resource={dialog.resource}
          id={dialog.id}
          parent={dialog.parent}
          copy={copy}
          options={{}}
          onClose={() => setDialog(null)}
          onSaved={handleSaved}
        />
      ) : null}

      {deleting ? (
        <CatalogueDeleteDialog
          resource={deleting.resource}
          item={deleting.item}
          copy={copy}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      ) : null}

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
