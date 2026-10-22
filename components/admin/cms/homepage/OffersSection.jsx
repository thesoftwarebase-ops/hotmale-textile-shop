"use client";

import ItemShell from "../ui/ItemShell";
import { Button, Grid, Panel, SelectInput, TextArea, TextInput, Toggle } from "../ui/fields";
import { getHomepageSectionSchema } from "../../../../lib/cms/homepage-sections";

const offerFields = getHomepageSectionSchema("offers").fields[0].fields;
const label = (name) =>
  offerFields.find((field) => field.name === name)?.label ?? name;
const toneField = offerFields.find((field) => field.name === "tone");
const ALL_STORES = "all";

export default function OffersSection({ value, onChange, copy, options }) {
  const stores = options?.stores ?? [];

  // The public site shows the offers ordered by their position field, so
  // the editor shows the same order and position is edited as a number.
  // Offers have no slug of their own, so each one keeps its index in the
  // stored array as its identity.
  const raw = Array.isArray(value?.offers) ? value.offers : [];
  const ordered = raw
    .map((offer, rawIndex) => ({ offer, rawIndex }))
    .sort((a, b) => (a.offer.order ?? 0) - (b.offer.order ?? 0));

  function update(rawIndex, patch) {
    const list = [...raw];
    if (rawIndex < 0 || rawIndex >= list.length) return;
    list[rawIndex] = { ...list[rawIndex], ...patch };
    onChange({ offers: list });
  }

  function remove(rawIndex) {
    onChange({ offers: raw.filter((_, index) => index !== rawIndex) });
  }

  function add() {
    const nextPosition = raw.length
      ? Math.max(...raw.map((offer) => offer.order ?? 0)) + 1
      : 1;
    onChange({
      offers: [
        ...raw,
        {
          label: "",
          tone: "charcoal",
          title: "",
          description: "",
          stores: [],
          enabled: true,
          order: nextPosition,
        },
      ],
    });
  }

  function toggleStore(rawIndex, slug) {
    const current = Array.isArray(raw[rawIndex]?.stores)
      ? raw[rawIndex].stores
      : [];
    const next = current.includes(slug)
      ? current.filter((entry) => entry !== slug)
      : [...current, slug];
    update(rawIndex, { stores: next });
  }

  function toggleAllStores(rawIndex) {
    const current = Array.isArray(raw[rawIndex]?.stores)
      ? raw[rawIndex].stores
      : [];
    update(rawIndex, { stores: current.includes(ALL_STORES) ? [] : [ALL_STORES] });
  }

  return (
    <Panel
      title={copy.homepage.sections.offers.copyTitle}
      description={copy.homepage.sections.offers.description}
      actions={
        <Button variant="gold" onClick={add}>
          {copy.homepage.sections.offers.addOffer}
        </Button>
      }
    >
      {ordered.length === 0 ? (
        <p className="rounded-sm border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted">
          {copy.form.noItems}
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {ordered.map(({ offer, rawIndex }, index) => (
          <ItemShell
            key={`offer-${rawIndex}`}
            index={index}
            title={offer.title || copy.homepage.sections.offers.offer}
            subtitle={offer.label}
            labels={copy.form}
            onRemove={() => remove(rawIndex)}
          >
            <Grid>
              <TextInput
                label={label("label")}
                value={offer.label}
                onChange={(next) => update(rawIndex, { label: next })}
              />
              <SelectInput
                label={label("tone")}
                value={offer.tone}
                onChange={(next) => update(rawIndex, { tone: next })}
                options={toneField?.options ?? []}
              />
              <TextInput
                label={label("order")}
                type="number"
                min={1}
                value={offer.order ?? index + 1}
                onChange={(next) =>
                  update(rawIndex, { order: next === "" ? null : Number(next) })
                }
                hint={copy.homepage.sections.offers.positionHint}
              />
              <div className="sm:col-span-2">
                <TextInput
                  label={label("title")}
                  value={offer.title}
                  onChange={(next) => update(rawIndex, { title: next })}
                />
              </div>
              <div className="sm:col-span-2">
                <TextArea
                  label={label("description")}
                  value={offer.description}
                  onChange={(next) => update(rawIndex, { description: next })}
                  rows={3}
                />
              </div>
            </Grid>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
                {label("stores")}
              </p>
              {stores.length === 0 ? (
                <p className="mt-2 text-xs text-muted">{copy.form.noItems}</p>
              ) : (
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  <label
                    className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sm border px-3 text-xs transition-colors ${
                      (offer.stores ?? []).includes(ALL_STORES)
                        ? "border-gold/50 bg-gold/[0.08] text-cream"
                        : "border-gold/25 bg-gold/[0.03] text-gold hover:border-gold/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(offer.stores ?? []).includes(ALL_STORES)}
                      onChange={() => toggleAllStores(rawIndex)}
                      className="h-4 w-4 accent-[var(--flame-gold)]"
                    />
                    <span className="min-w-0 truncate font-semibold">
                      {copy.homepage.sections.offers.allStores}
                    </span>
                  </label>

                  {stores.map((store) => {
                    const allSelected = (offer.stores ?? []).includes(ALL_STORES);
                    const checked = !allSelected && (offer.stores ?? []).includes(store.slug);
                    return (
                      <label
                        key={store.slug}
                        className={`flex min-h-10 items-center gap-2.5 rounded-sm border border-white/[0.07] px-3 text-xs transition-colors ${
                          allSelected
                            ? "cursor-not-allowed text-muted/50"
                            : "cursor-pointer text-silver hover:border-white/20 hover:text-cream"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={allSelected}
                          onChange={() => toggleStore(rawIndex, store.slug)}
                          className="h-4 w-4 accent-[var(--flame-gold)]"
                        />
                        <span className="min-w-0 truncate">{store.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <Toggle
                label={label("enabled")}
                checked={offer.enabled !== false}
                onChange={(next) => update(rawIndex, { enabled: next })}
                onLabel={copy.form.toggleOn}
                offLabel={copy.form.toggleOff}
              />
            </div>
            </ItemShell>
          ))}
        </ul>
    </Panel>
  );
}
