"use client";

import ItemShell from "../ui/ItemShell";
import { useSortable } from "../ui/useSortable";
import { Button, Grid, Panel, TextInput, Toggle } from "../ui/fields";
import BrandPanel from "./BrandPanel";
import { getCommonSectionSchema } from "../../../../lib/cms/common-sections";

const navbarSchema = getCommonSectionSchema("navbar");
const itemFields = navbarSchema.fields[0].fields;
const label = (name) =>
  itemFields.find((field) => field.name === name)?.label ?? name;

export default function CommonNavbarSection({ value, onChange, copy }) {
  const items = Array.isArray(value?.items) ? value.items : [];
  const brand = value?.brand ?? {};

  // The public navbar sorts by position, so a drag renumbers the links.
  const { rowProps, markerFor, dragging, containerRef } = useSortable(
    items,
    (next) =>
      onChange({ items: next.map((item, index) => ({ ...item, order: index + 1 })) }),
  );

  function update(index, patch) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange({ items: next });
  }

  function remove(index) {
    onChange({
      items: items
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, position) => ({ ...item, order: position + 1 })),
    });
  }

  function add() {
    onChange({
      items: [
        ...items,
        {
          label: "",
          href: "/",
          visible: true,
          order: items.length + 1,
        },
      ],
    });
  }

  function updateBrand(patch) {
    onChange({ ...value, brand: { ...brand, ...patch } });
  }

  return (
    <div className="flex flex-col gap-5">
      <BrandPanel
        brand={brand}
        onChange={updateBrand}
        copy={copy}
      />

      <Panel
        title={copy.common.navbar.copyTitle}
        description={copy.common.navbar.description}
        actions={
          <Button variant="gold" onClick={add}>
            {copy.common.navbar.addLink}
          </Button>
        }
      >
      {items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted">
          {copy.form.noItems}
        </p>
      ) : null}

      <ul ref={containerRef} className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li
            key={`${item.href}-${index}`}
            {...rowProps(index)}
            className="cursor-grab active:cursor-grabbing"
          >
            <ItemShell
              index={index}
              title={item.label || item.href}
              subtitle={item.href}
              labels={copy.form}
              draggable
              dropMarker={markerFor(index)}
              dragging={dragging === index}
              onRemove={() => remove(index)}
            >
              <Grid>
                <TextInput
                  label={label("label")}
                  value={item.label}
                  onChange={(next) => update(index, { label: next })}
                />
                <TextInput
                  label={label("href")}
                  value={item.href}
                  onChange={(next) => update(index, { href: next })}
                  placeholder="/collections"
                />
                <div className="sm:col-span-2">
                  <Toggle
                    label={label("visible")}
                    checked={item.visible !== false}
                    onChange={(next) => update(index, { visible: next })}
                    onLabel={copy.form.toggleOn}
                    offLabel={copy.form.toggleOff}
                  />
                </div>
              </Grid>
            </ItemShell>
          </li>
        ))}
      </ul>
      </Panel>
    </div>
  );
}
