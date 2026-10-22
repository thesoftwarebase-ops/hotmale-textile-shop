"use client";

import { Grid, Panel, TextInput, Toggle } from "../ui/fields";
import { getHomepageSectionSchema } from "../../../../lib/cms/homepage-sections";

const bandFields = getHomepageSectionSchema("store-band").fields[0].fields;
const label = (name) =>
  bandFields.find((field) => field.name === name)?.label ?? name;

const ALL_STORES = "all";

function BranchCard({ store, on, onToggle, copy, labels }) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-sm border transition-colors ${
        on
          ? "border-gold/45 bg-white/[0.03]"
          : "border-white/[0.08] bg-white/[0.01] opacity-60"
      }`}
    >
      <div
        aria-hidden="true"
        className="relative aspect-[16/10] w-full bg-charcoal bg-cover bg-center"
        style={
          store.photo ? { backgroundImage: `url("${store.photo}")` } : undefined
        }
      >
        <span className="absolute left-3 top-3 rounded-sm bg-ink/75 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-cream">
          {store.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <dl className="space-y-1.5 text-[11px] leading-relaxed">
          {store.address ? (
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                {labels.address}
              </dt>
              <dd className="min-w-0 flex-1 text-silver">{store.address}</dd>
            </div>
          ) : null}
          {store.hours ? (
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                {labels.hours}
              </dt>
              <dd className="min-w-0 flex-1 text-silver">{store.hours}</dd>
            </div>
          ) : null}
          {store.phone ? (
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                {labels.phone}
              </dt>
              <dd className="min-w-0 flex-1 text-silver">{store.phone}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto pt-3">
          <Toggle
            label={store.name}
            checked={on}
            onChange={onToggle}
            onLabel={copy.form.toggleOn}
            offLabel={copy.form.toggleOff}
          />
        </div>
      </div>
    </article>
  );
}

export default function StoreBandSection({ value, onChange, copy, options }) {
  const band = value?.storesCta ?? {};
  const stores = options?.stores ?? [];
  const sectionCopy = copy.homepage.sections["store-band"];

  const picked = Array.isArray(band.storeSlugs) ? band.storeSlugs : [];
  const allSelected = picked.length === 0 || picked.includes(ALL_STORES);

  const labels = {
    address: copy.form.branchAddressLabel,
    hours: copy.form.branchHoursLabel,
    phone: copy.form.branchPhoneLabel,
  };

  function update(patch) {
    onChange({ storesCta: { ...band, ...patch } });
  }

  function toggleStore(slug) {
    if (allSelected) {
      update({ storeSlugs: [slug] });
      return;
    }
    update({
      storeSlugs: picked.includes(slug)
        ? picked.filter((entry) => entry !== slug)
        : [...picked, slug],
    });
  }

  function toggleAll() {
    update({ storeSlugs: allSelected ? [] : [ALL_STORES] });
  }

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title={sectionCopy.branchCards}
        description={sectionCopy.storesDescription}
        actions={
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
            {String(allSelected ? stores.length : picked.length).padStart(2, "0")}{" "}
            {sectionCopy.storesCount}
          </span>
        }
      >
        {stores.length === 0 ? (
          <p className="rounded-sm border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted">
            {copy.form.noItems}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col justify-between rounded-sm border border-gold/30 bg-gold/[0.05] p-3.5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
                  {sectionCopy.allStores}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-silver">
                  {sectionCopy.allStoresHint}
                </p>
              </div>
              <div className="mt-4">
                <Toggle
                  label={sectionCopy.allStores}
                  checked={allSelected}
                  onChange={toggleAll}
                  onLabel={copy.form.toggleOn}
                  offLabel={copy.form.toggleOff}
                />
              </div>
            </div>

            {stores.map((store) => (
              <BranchCard
                key={store.slug}
                store={store}
                on={!allSelected && picked.includes(store.slug)}
                onToggle={() => toggleStore(store.slug)}
                copy={copy}
                labels={labels}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel title={sectionCopy.copyTitle} description={sectionCopy.description}>
        <Grid>
          <TextInput
            label={label("title")}
            value={band.title}
            onChange={(next) => update({ title: next })}
            hint={sectionCopy.titleHint}
          />
          <TextInput
            label={label("headline")}
            value={band.headline}
            onChange={(next) => update({ headline: next })}
          />
          <TextInput
            label={label("ctaLabel")}
            value={band.ctaLabel}
            onChange={(next) => update({ ctaLabel: next })}
          />
          <TextInput
            label={label("ctaHref")}
            value={band.ctaHref}
            onChange={(next) => update({ ctaHref: next })}
            placeholder="/stores"
            hint={sectionCopy.ctaHrefHint}
          />
        </Grid>
      </Panel>
    </div>
  );
}
