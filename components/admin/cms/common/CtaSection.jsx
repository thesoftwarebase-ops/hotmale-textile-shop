"use client";

import { Grid, Panel, TextArea, TextInput } from "../ui/fields";
import { getCommonSectionSchema } from "../../../../lib/cms/common-sections";

const ctaFields = getCommonSectionSchema("cta").fields[0].fields;
const label = (name) =>
  ctaFields.find((field) => field.name === name)?.label ?? name;
const linkLabel = (group, name) =>
  ctaFields
    .find((field) => field.name === group)
    ?.fields.find((field) => field.name === name)?.label ?? name;

export default function CommonCtaSection({ value, onChange, copy }) {
  const cta = value?.cta ?? {};

  function update(patch) {
    onChange({ cta: { ...cta, ...patch } });
  }

  function updateLink(group, key, next) {
    update({ [group]: { ...(cta[group] ?? {}), [key]: next } });
  }

  return (
    <Panel
      title={copy.common.cta.copyTitle}
      description={copy.common.cta.description}
    >
      <Grid>
        <TextInput
          label={label("eyebrow")}
          value={cta.eyebrow}
          onChange={(next) => update({ eyebrow: next })}
        />
        <TextInput
          label={label("title")}
          value={cta.title}
          onChange={(next) => update({ title: next })}
        />
        <div className="sm:col-span-2">
          <TextArea
            label={label("subtitle")}
            value={cta.subtitle}
            onChange={(next) => update({ subtitle: next })}
            rows={3}
          />
        </div>
      </Grid>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {["primaryCta", "secondaryCta"].map((group) => (
          <div
            key={group}
            className="rounded-sm border border-white/[0.08] bg-black/20 p-3.5"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
              {label(group)}
            </p>
            <div className="mt-3 space-y-3">
              <TextInput
                label={linkLabel(group, "label")}
                value={cta[group]?.label}
                onChange={(next) => updateLink(group, "label", next)}
              />
              <TextInput
                label={linkLabel(group, "href")}
                value={cta[group]?.href}
                onChange={(next) => updateLink(group, "href", next)}
                placeholder="/collections"
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
