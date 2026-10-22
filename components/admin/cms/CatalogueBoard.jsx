"use client";

import Link from "next/link";
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

const categoryHref = (slug) => `/admin/catalogue/${slug}`;
const collectionHref = (category, collection) =>
  `/admin/catalogue/${category}/${collection}`;

function StatusBadge({ status }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em] ${
        published
          ? "border-gold/25 bg-gold/[0.06] text-gold"
          : "border-white/10 bg-[#0b0b0b]/80 text-muted"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1 w-1 rounded-full ${published ? "bg-gold" : "bg-muted"}`}
      />
      {status}
    </span>
  );
}

function FeaturedBadge({ copy }) {
  return (
    <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-gold">
      {copy.catalogue.featured}
    </span>
  );
}

function CardButton({ onClick, children, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-20 inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-sm border px-2.5 text-[8px] font-bold uppercase tracking-[0.14em] transition-colors ${
        danger
          ? "border-red-400/20 text-red-300 hover:bg-red-400/10"
          : "border-white/10 text-silver hover:border-gold/40 hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}

function CategoryCard({
  entry,
  index,
  copy,
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
      <Link
        href={categoryHref(entry.slug)}
        aria-label={`${copy.catalogue.openCategory} ${entry.name}`}
        className="absolute inset-0 z-10 rounded-md focus-visible:-outline-offset-4"
      />

      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <span
          aria-hidden="true"
          className="font-display text-4xl font-black leading-none text-white/[0.08]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex flex-wrap items-center justify-end gap-2">
          {entry.featured ? <FeaturedBadge copy={copy} /> : null}
          <StatusBadge status={entry.status} />
        </span>
      </div>

      <div className="px-5 pt-3">
        <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-cream">
          {entry.name}
        </h3>
        <p className="mt-1 truncate text-[10px] tracking-[0.12em] text-muted">
          /{entry.slug}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-white/[0.06] px-5 py-3">
        <dl className="flex shrink-0 gap-5">
          <div>
            <dt className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
              {copy.catalogue.collections}
            </dt>
            <dd className="tnum mt-0.5 text-sm font-bold text-cream">
              {entry.collectionCount}
            </dd>
          </div>
          <div>
            <dt className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
              {copy.catalogue.products}
            </dt>
            <dd className="tnum mt-0.5 text-sm font-bold text-gold">
              {entry.productCount}
            </dd>
          </div>
        </dl>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <ReorderControls
            dragLabel={copy.catalogue.dragItem.replace("{name}", entry.name)}
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
          <span className="flex shrink-0 items-center gap-1.5">
            <CardButton onClick={() => onEdit(entry)}>
              {copy.list.edit}
            </CardButton>
            <CardButton danger onClick={() => onDelete(entry)}>
              {copy.list.delete}
            </CardButton>
          </span>
        </div>
      </div>
    </article>
  );
}

function CollectionCard({
  entry,
  copy,
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
      <Link
        href={collectionHref(entry.category, entry.slug)}
        aria-label={`${copy.catalogue.openCollection} ${entry.name}`}
        className="absolute inset-0 z-10 rounded-md focus-visible:-outline-offset-4"
      />

      <div
        className="relative aspect-[16/9] w-full bg-charcoal bg-cover bg-center"
        style={
          entry.image
            ? { backgroundImage: `url("${entry.image}")` }
            : undefined
        }
      >
        {entry.image ? null : (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
            {copy.catalogue.noPhoto}
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent"
        />
        <span className="absolute left-4 top-3 flex flex-wrap items-center gap-2">
          {entry.featured ? <FeaturedBadge copy={copy} /> : null}
          <StatusBadge status={entry.status} />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-xl font-black uppercase leading-tight tracking-tight text-cream">
            {entry.name}
          </h3>
          <p className="mt-1 truncate text-[10px] tracking-[0.12em] text-muted">
            /{entry.slug}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="min-w-0 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
          <span className="tnum text-gold">{entry.productCount}</span>{" "}
          {entry.productCount === 1
            ? copy.catalogue.productOne
            : copy.catalogue.productMany}
        </p>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <ReorderControls
            dragLabel={copy.catalogue.dragItem.replace("{name}", entry.name)}
            upLabel={copy.form.moveUp}
            downLabel={copy.form.moveDown}
            activatorRef={setActivatorNodeRef}
            attributes={attributes}
            listeners={listeners}
            onMove={onMove}
            canUp={canUp}
            canDown={canDown}
            ordering={ordering}
            compact
          />
          <span className="flex shrink-0 items-center gap-1.5">
            <CardButton onClick={() => onEdit(entry)}>
              {copy.list.edit}
            </CardButton>
            <CardButton danger onClick={() => onDelete(entry)}>
              {copy.list.delete}
            </CardButton>
          </span>
        </div>
      </div>
    </article>
  );
}

function ProductCard({
  entry,
  copy,
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
  const image = entry.image;

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
      <button
        type="button"
        onClick={() => onEdit(entry)}
        aria-label={`${copy.catalogue.editProduct}: ${entry.name}`}
        className="absolute inset-0 z-10 cursor-pointer rounded-md focus-visible:-outline-offset-4"
      />

      <div
        className="relative aspect-[4/5] w-full bg-charcoal bg-cover bg-center"
        style={image ? { backgroundImage: `url("${image}")` } : undefined}
      >
        {image ? null : (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
            {copy.catalogue.noPhoto}
          </span>
        )}
        <span className="absolute left-2.5 top-2.5">
          <StatusBadge status={entry.status} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-3">
        <h3 className="min-w-0 truncate text-xs font-semibold text-cream">
          {entry.name}
        </h3>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-2">
        <span className="hidden min-w-0 truncate text-[9px] tracking-[0.08em] text-muted/80 sm:inline">
          /{entry.slug}
        </span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <ReorderControls
            dragLabel={copy.catalogue.dragItem.replace("{name}", entry.name)}
            upLabel={copy.form.moveUp}
            downLabel={copy.form.moveDown}
            activatorRef={setActivatorNodeRef}
            attributes={attributes}
            listeners={listeners}
            onMove={onMove}
            canUp={canUp}
            canDown={canDown}
            ordering={ordering}
            compact
          />
          <span className="flex shrink-0 items-center gap-1.5">
            <CardButton onClick={() => onEdit(entry)}>
              {copy.list.edit}
            </CardButton>
            <CardButton danger onClick={() => onDelete(entry)}>
              {copy.list.delete}
            </CardButton>
          </span>
        </div>
      </div>
    </article>
  );
}

function Breadcrumbs({ copy, categoryItem, collectionItem }) {
  if (!categoryItem) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em]"
    >
      <Link
        href="/admin/catalogue"
        className="text-muted transition-colors hover:text-gold"
      >
        {copy.catalogue.allCategories}
      </Link>
      <span aria-hidden="true" className="text-white/20">
        /
      </span>
      {collectionItem ? (
        <Link
          href={categoryHref(categoryItem.slug)}
          className="text-muted transition-colors hover:text-gold"
        >
          {categoryItem.name}
        </Link>
      ) : (
        <span className="text-cream">{categoryItem.name}</span>
      )}
      {collectionItem ? (
        <>
          <span aria-hidden="true" className="text-white/20">
            /
          </span>
          <span className="text-cream">{collectionItem.name}</span>
        </>
      ) : null}
    </nav>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <div
          key={row}
          className="h-56 animate-pulse rounded-md border border-white/10 bg-white/[0.025]"
        />
      ))}
    </div>
  );
}

export default function CatalogueBoard({ copy, category = null, collection = null }) {
  const router = useRouter();
  const [tree, setTree] = useState(null);
  const [options, setOptions] = useState({
    categories: [],
    collections: [],
    stores: [],
  });
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
        const [treeResponse, optionsResponse] = await Promise.all([
          authFetch("/api/admin/catalogue", { cache: "no-store" }),
          authFetch("/api/admin/options", { cache: "no-store" }),
        ]);

        if (treeResponse.status === 401 || optionsResponse.status === 401) {
          clearToken();
          router.replace("/admin");
          return;
        }

        if (!treeResponse.ok) throw new Error("catalogue_failed");

        const payload = await treeResponse.json().catch(() => ({}));
        const optionsPayload = optionsResponse.ok
          ? await optionsResponse.json().catch(() => ({}))
          : {};
        if (!active) return;

        setTree(Array.isArray(payload.tree) ? payload.tree : []);
        setOptions({
          categories: optionsPayload.categories ?? [],
          collections: optionsPayload.collections ?? [],
          stores: optionsPayload.stores ?? [],
        });
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

  const level = collection ? "products" : category ? "collections" : "categories";
  const categoryItem = category
    ? (tree ?? []).find((entry) => entry.slug === category) ?? null
    : null;
  const collectionItem = collection
    ? categoryItem?.collections?.find((entry) => entry.slug === collection) ?? null
    : null;
  const missing =
    status === "ready" &&
    ((category && !categoryItem) || (collection && !collectionItem));

  const items =
    level === "categories"
      ? tree ?? []
      : level === "collections"
        ? categoryItem?.collections ?? []
        : collectionItem?.products ?? [];

  const newLabel =
    level === "categories"
      ? copy.catalogue.newCategory
      : level === "collections"
        ? copy.catalogue.newCollection
        : copy.catalogue.newProduct;

  const editLabel =
    level === "collections"
      ? copy.catalogue.editCategory
      : level === "products"
        ? copy.catalogue.editCollection
        : null;

  const title =
    level === "categories"
      ? copy.catalogue.title
      : level === "collections"
        ? categoryItem?.name
        : collectionItem?.name;

  const description =
    level === "categories"
      ? copy.catalogue.intro
      : level === "collections"
        ? categoryItem?.description
        : collectionItem?.description;

  const statLine =
    level === "categories"
      ? null
      : level === "collections"
        ? `${categoryItem?.collectionCount ?? 0} ${copy.catalogue.collectionMany} · ${categoryItem?.productCount ?? 0} ${copy.catalogue.productMany}`
        : `${collectionItem?.productCount ?? 0} ${copy.catalogue.productMany} · /${collectionItem?.slug ?? ""}`;

  const emptyTitle =
    level === "categories"
      ? copy.catalogue.emptyCategories
      : level === "collections"
        ? copy.catalogue.emptyCollections
        : copy.catalogue.emptyProducts;

  const emptyBody =
    level === "categories"
      ? copy.catalogue.emptyCategoriesBody
      : level === "collections"
        ? copy.catalogue.emptyCollectionsBody
        : copy.catalogue.emptyProductsBody;

  function openCreate() {
    if (level === "categories") {
      setDialog({ resource: "categories", id: null, parent: {} });
      return;
    }

    if (level === "collections") {
      if (!categoryItem) return;
      setDialog({
        resource: "collections",
        id: null,
        parent: {
          category: categoryItem.slug,
          categoryName: categoryItem.name,
        },
      });
      return;
    }

    if (!categoryItem || !collectionItem) return;
    setDialog({
      resource: "products",
      id: null,
      parent: {
        category: categoryItem.slug,
        categoryName: categoryItem.name,
        collection: collectionItem.slug,
        collectionName: collectionItem.name,
      },
    });
  }

  function openEdit(entry, resource) {
    setDialog({
      resource,
      id: entry.id,
      parent: {
        category: categoryItem?.slug,
        categoryName: categoryItem?.name,
        collection: level === "products" ? collectionItem?.slug : undefined,
        collectionName: level === "products" ? collectionItem?.name : undefined,
      },
    });
  }

  function handleSaved(item) {
    const resource = dialog?.resource;
    const wasCreating = !dialog?.id;

    setDialog(null);
    setToast({
      variant: "success",
      title: wasCreating
        ? copy.catalogue.createdTitle
        : copy.catalogue.savedTitle,
      message: wasCreating
        ? copy.catalogue.createdBody
        : copy.catalogue.savedBody,
    });

    refresh();

    // A rename changes the address of the level the editor is standing on.
    if (
      resource === "categories" &&
      category &&
      item?.slug &&
      item.slug !== category
    ) {
      router.replace(categoryHref(item.slug));
    }
    if (
      resource === "collections" &&
      collection &&
      item?.slug &&
      item.slug !== collection
    ) {
      router.replace(collectionHref(category, item.slug));
    }
  }

  function handleDeleted() {
    setDeleting(null);
    setToast({
      variant: "success",
      title: copy.catalogue.deletedTitle,
      message: copy.catalogue.deletedBody,
    });
    refresh();
  }

  function askDelete(entry) {
    setDeleting({
      resource:
        level === "categories"
          ? "categories"
          : level === "collections"
            ? "collections"
            : "products",
      item: entry,
    });
  }

  function applyOrder(nextItems) {
    setTree((current) => {
      if (!current) return current;
      if (level === "categories") return nextItems;
      return current.map((entry) => {
        if (entry.slug !== category) return entry;
        if (level === "collections") {
          return { ...entry, collections: nextItems };
        }
        return {
          ...entry,
          collections: entry.collections.map((child) =>
            child.slug === collection
              ? { ...child, products: nextItems }
              : child,
          ),
        };
      });
    });
  }

  async function commitOrder(nextItems) {
    if (orderingRef.current) return;
    orderingRef.current = true;
    setOrdering(true);
    applyOrder(nextItems);

    const resource =
      level === "categories"
        ? "categories"
        : level === "collections"
          ? "collections"
          : "products";

    try {
      const response = await authFetch(
        `/api/admin/resources/${resource}/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: nextItems.map((entry) => entry.id) }),
        },
      );

      if (response.status === 401) {
        clearToken();
        router.replace("/admin");
        return;
      }

      if (!response.ok) throw new Error("reorder_failed");
    } catch {
      setToast({
        variant: "error",
        title: copy.catalogue.reorderErrorTitle,
        message: copy.catalogue.saveError,
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
    if (target < 0 || target >= items.length) return;
    const nextItems = [...items];
    [nextItems[index], nextItems[target]] = [nextItems[target], nextItems[index]];
    commitOrder(nextItems);
  }

  return (
    <>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7">
          {level !== "categories" ? (
            <Breadcrumbs
              copy={copy}
              categoryItem={categoryItem}
              collectionItem={collectionItem}
            />
          ) : null}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
                <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
                {level === "categories"
                  ? copy.catalogue.eyebrow
                  : level === "collections"
                    ? copy.catalogue.collections
                    : copy.catalogue.products}
              </p>
              <h1 className="mt-4 truncate font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-cream sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-silver">
                {description || statLine}
              </p>
              {description && statLine ? (
                <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  {statLine}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 self-start lg:self-auto">
              {editLabel && categoryItem ? (
                <button
                  type="button"
                  onClick={() =>
                    level === "collections"
                      ? openEdit(categoryItem, "categories")
                      : openEdit(collectionItem, "collections")
                  }
                  disabled={status !== "ready" || missing}
                  className="inline-flex min-h-[46px] items-center rounded-sm border border-white/10 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {editLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={openCreate}
                disabled={status !== "ready" || missing}
                className="inline-flex min-h-[46px] items-center rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight disabled:cursor-not-allowed disabled:opacity-55"
              >
                {newLabel}
              </button>
            </div>
          </div>
        </header>

        {status === "loading" ? <Skeleton /> : null}

        {status === "error" ? (
          <div className="rounded-md border border-red-400/20 bg-red-400/[0.04] p-6">
            <p className="text-sm text-silver">{copy.catalogue.error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 inline-flex min-h-[42px] items-center rounded-sm border border-gold/50 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-gold"
            >
              {copy.form.retry}
            </button>
          </div>
        ) : null}

        {missing ? (
          <div className="rounded-md border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
            <p className="font-display text-2xl font-black uppercase tracking-tight text-cream">
              {copy.catalogue.notFound}
            </p>
            <Link
              href="/admin/catalogue"
              className="mt-5 inline-flex min-h-[44px] items-center rounded-sm border border-gold/50 px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              {copy.catalogue.backToCatalogue}
            </Link>
          </div>
        ) : null}

        {status === "ready" && !missing ? (
          items.length === 0 ? (
            <div className="rounded-md border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center">
              <p className="font-display text-2xl font-black uppercase tracking-tight text-cream">
                {emptyTitle}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                {emptyBody}
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 inline-flex min-h-[46px] items-center rounded-sm bg-gold px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-highlight"
              >
                {newLabel}
              </button>
            </div>
          ) : (
            <SortableGrid
              items={items}
              onReorder={commitOrder}
              className={
                level === "products"
                  ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              }
            >
              {level === "categories"
                ? items.map((entry, index) => (
                    <CategoryCard
                      key={entry.id}
                      entry={entry}
                      index={index}
                      copy={copy}
                      ordering={ordering}
                      canUp={index > 0}
                      canDown={index < items.length - 1}
                      onMove={(direction) => moveItem(index, direction)}
                      onEdit={(item) => openEdit(item, "categories")}
                      onDelete={askDelete}
                    />
                  ))
                : null}
              {level === "collections"
                ? items.map((entry, index) => (
                    <CollectionCard
                      key={entry.id}
                      entry={entry}
                      copy={copy}
                      ordering={ordering}
                      canUp={index > 0}
                      canDown={index < items.length - 1}
                      onMove={(direction) => moveItem(index, direction)}
                      onEdit={(item) => openEdit(item, "collections")}
                      onDelete={askDelete}
                    />
                  ))
                : null}
              {level === "products"
                ? items.map((entry, index) => (
                    <ProductCard
                      key={entry.id}
                      entry={entry}
                      copy={copy}
                      ordering={ordering}
                      canUp={index > 0}
                      canDown={index < items.length - 1}
                      onMove={(direction) => moveItem(index, direction)}
                      onEdit={(item) => openEdit(item, "products")}
                      onDelete={askDelete}
                    />
                  ))
                : null}
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
          options={options}
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
