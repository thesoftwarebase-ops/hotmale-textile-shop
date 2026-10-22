"use client";

import { useEffect, useMemo, useState } from "react";
import ItemShell from "../ui/ItemShell";
import { useSortable } from "../ui/useSortable";
import { Button, Grid, Panel, TextInput, Toggle } from "../ui/fields";
import BrandPanel from "./BrandPanel";
import { authFetch } from "../../../../lib/client-auth";
import { getCommonSectionSchema } from "../../../../lib/cms/common-sections";
import {
  storeIsLinked,
  toggleStoreLink,
} from "../../../../lib/cms/footer-links";

const footerSchema = getCommonSectionSchema("footer");
const footerFields = footerSchema.fields[0].fields;
const socialFields =
  footerSchema.fields.find((field) => field.name === "social")?.fields ?? [];
const socialLabel = (name) =>
  socialFields.find((field) => field.name === name)?.label ?? name;
const label = (name) =>
  footerFields.find((field) => field.name === name)?.label ?? name;
const groupLabel = (name) =>
  footerFields
    .find((field) => field.name === "groups")
    ?.fields.find((field) => field.name === name)?.label ?? name;

export default function CommonFooterSection({
  value,
  onChange,
  copy,
  registerBeforeSave,
}) {
  const footer = value?.footer ?? {};
  const brand = value?.brand ?? {};
  const social = value?.social ?? {};
  const groups = useMemo(
    () => (Array.isArray(footer.groups) ? footer.groups : []),
    [footer.groups],
  );
  const [stores, setStores] = useState([]);

  // The store links in the footer point at real branch pages, so the
  // list of branches comes from the store records, not from typing.
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await authFetch("/api/admin/options", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = await response.json().catch(() => ({}));
        if (!active) return;
        setStores(Array.isArray(payload.stores) ? payload.stores : []);
      } catch {
        // The picker is an extra; the manual link rows still work.
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);
  // The public footer sorts the groups by position, so a drag renumbers.
  const { rowProps, markerFor, dragging, containerRef } = useSortable(
    groups,
    (next) =>
      onChange({
        ...value,
        footer: {
          ...footer,
          groups: next.map((group, index) => ({ ...group, order: index + 1 })),
        },
      }),
  );

  function update(patch) {
    onChange({ ...value, footer: { ...footer, ...patch } });
  }

  function updateGroup(index, patch) {
    const next = [...groups];
    next[index] = { ...next[index], ...patch };
    update({ groups: next });
  }

  function updateLink(groupIndex, linkIndex, patch) {
    const next = [...groups];
    const links = [...(next[groupIndex].links ?? [])];
    links[linkIndex] = { ...links[linkIndex], ...patch };
    next[groupIndex] = { ...next[groupIndex], links };
    update({ groups: next });
  }

  function updateBrand(patch) {
    onChange({ ...value, brand: { ...brand, ...patch } });
  }

  function updateSocial(patch) {
    onChange({ ...value, social: { ...social, ...patch } });
  }

  function updateLabel(patch) {
    onChange({ ...value, ...patch });
  }

  function toggleStore(store, include) {
    update({
      groups: toggleStoreLink(footer.groups, store, include),
    });
  }

  // The footer and the branch records are one thing — a branch that is
  // no longer linked loses its record, so the owner is told before the
  // save takes it away.
  useEffect(() => {
    if (!registerBeforeSave) return undefined;

    registerBeforeSave(() => {
      const linked = new Set();
      for (const group of groups) {
        for (const link of group.links ?? []) {
          const match = String(link.href ?? "").match(
            /^\/stores\/?#?([a-z0-9-]+)$/,
          );
          if (match) linked.add(match[1]);
        }
      }
      const dropped = stores
        .filter((store) => !linked.has(store.slug))
        .map((store) => store.name);
      if (dropped.length === 0) return true;
      return window.confirm(
        copy.common.footer.removeBranchesConfirm
          .replace("{names}", dropped.join(", "))
          .replace("{count}", String(dropped.length)),
      );
    });

    return () => registerBeforeSave(null);
  }, [groups, stores, copy, registerBeforeSave]);

  function addLink(groupIndex) {
    const next = [...groups];
    const links = [...(next[groupIndex].links ?? []), { label: "", href: "/" }];
    next[groupIndex] = { ...next[groupIndex], links };
    update({ groups: next });
  }

  function removeLink(groupIndex, linkIndex) {
    const next = [...groups];
    const links = [...(next[groupIndex].links ?? [])].filter(
      (_, index) => index !== linkIndex,
    );
    next[groupIndex] = { ...next[groupIndex], links };
    update({ groups: next });
  }

  function removeGroup(index) {
    update({
      groups: groups
        .filter((_, groupIndex) => groupIndex !== index)
        .map((group, position) => ({ ...group, order: position + 1 })),
    });
  }

  function addGroup() {
    update({
      groups: [
        ...groups,
        { title: "", order: groups.length + 1, links: [] },
      ],
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <BrandPanel brand={brand} onChange={updateBrand} copy={copy} />

      <Panel
        title={copy.common.footer.socialTitle}
        description={copy.common.footer.socialDescription}
      >
        <Grid>
          <TextInput
            label={socialLabel("instagramHandle")}
            value={social.instagramHandle}
            onChange={(next) => updateSocial({ instagramHandle: next })}
            placeholder="@hotmalestyle"
          />
          <TextInput
            label={socialLabel("instagramUrl")}
            value={social.instagramUrl}
            onChange={(next) => updateSocial({ instagramUrl: next })}
            placeholder="https://instagram.com/hotmalestyle"
          />
        </Grid>
      </Panel>

      <Panel
        title={copy.common.footer.storesTitle}
        description={copy.common.footer.storesDescription}
      >
        {stores.length === 0 ? (
          <p className="rounded-sm border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted">
            {copy.common.footer.noStores}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stores.map((store) => (
              <li
                key={store.slug}
                className="flex items-center justify-between gap-4 rounded-sm border border-white/[0.07] bg-black/20 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-cream">
                    {store.name}
                  </p>
                  <p className="truncate text-[10px] text-muted">
                    /stores/{store.slug}
                  </p>
                </div>
                <Toggle
                  label={copy.common.footer.inFooter}
                  checked={storeIsLinked(groups, store.slug)}
                  onChange={(next) => toggleStore(store, next)}
                  onLabel={copy.form.toggleOn}
                  offLabel={copy.form.toggleOff}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title={copy.common.footer.groupsTitle}
        description={copy.common.footer.groupsDescription}
        actions={
          <Button variant="gold" onClick={addGroup}>
            {copy.common.footer.addGroup}
          </Button>
        }
      >
        {groups.length === 0 ? (
          <p className="rounded-sm border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted">
            {copy.form.noItems}
          </p>
        ) : null}

        <ul ref={containerRef} className="flex flex-col gap-3">
          {groups.map((group, index) => {
            const links = group.links ?? [];
            return (
              <li
                key={`group-${index}`}
                {...rowProps(index)}
                className="cursor-grab active:cursor-grabbing"
              >
                <ItemShell
                  index={index}
                  title={group.title || copy.common.footer.unnamedGroup}
                  subtitle={`${links.length} ${copy.common.footer.linkCount}`}
                  labels={copy.form}
                  draggable
                  dropMarker={markerFor(index)}
                  dragging={dragging === index}
                  onRemove={() => removeGroup(index)}
                >
                  <Grid>
                    <TextInput
                      label={groupLabel("title")}
                      value={group.title}
                      onChange={(next) => updateGroup(index, { title: next })}
                    />
                    <TextInput
                      label={groupLabel("order")}
                      type="number"
                      min={1}
                      value={group.order ?? index + 1}
                      onChange={(next) =>
                        updateGroup(index, {
                          order: next === "" ? null : Number(next),
                        })
                      }
                    />
                  </Grid>

                  <div className="mt-4 border-t border-white/[0.07] pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
                        {copy.common.footer.linksTitle}
                      </p>
                      <Button onClick={() => addLink(index)}>
                        {copy.common.footer.addLink}
                      </Button>
                    </div>

                    <ul className="mt-3 flex flex-col gap-2">
                      {links.map((link, linkIndex) => (
                        <li
                          key={`link-${linkIndex}`}
                          className="grid gap-2 rounded-sm border border-white/[0.07] bg-black/20 p-2.5 sm:grid-cols-[1fr_1fr_auto]"
                        >
                          <TextInput
                            label="Label"
                            value={link.label}
                            onChange={(next) =>
                              updateLink(index, linkIndex, { label: next })
                            }
                          />
                          <TextInput
                            label="Link"
                            value={link.href}
                            onChange={(next) =>
                              updateLink(index, linkIndex, { href: next })
                            }
                            placeholder="/collections"
                          />
                          <div className="flex items-end pb-1">
                            <button
                              type="button"
                              onClick={() => removeLink(index, linkIndex)}
                              className="inline-flex h-8 items-center rounded-sm border border-red-400/20 px-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-red-300 transition-colors hover:border-red-400/50"
                            >
                              {copy.common.footer.removeLink}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ItemShell>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title={copy.common.footer.copyTitle}
        description={copy.common.footer.description}
      >
        <Grid>
          <TextInput
            label={label("copyrightYear")}
            type="number"
            min={2000}
            value={footer.copyrightYear ?? ""}
            onChange={(next) =>
              update({
                copyrightYear: next === "" ? null : Number(next),
              })
            }
          />
          <TextInput
            label={copy.common.footer.backToTopLabel}
            value={value?.backToTop ?? ""}
            onChange={(next) => updateLabel({ backToTop: next })}
          />
          <TextInput
            label={copy.common.footer.homeLabel}
            value={value?.homeLabel ?? ""}
            onChange={(next) => updateLabel({ homeLabel: next })}
          />
        </Grid>
      </Panel>
    </div>
  );
}
