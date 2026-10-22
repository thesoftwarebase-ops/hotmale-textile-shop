"use client";

import ImageField from "../ImageField";
import { Grid, Panel, TextInput, Toggle } from "../ui/fields";
import { getCommonSectionSchema } from "../../../../lib/cms/common-sections";

const brandFields =
  getCommonSectionSchema("navbar").fields.find(
    (field) => field.name === "brand",
  )?.fields ?? [];
const brandLabel = (name) =>
  brandFields.find((field) => field.name === name)?.label ?? name;

/**
 * The brand block: the logo, the wordmark name, the tagline and the
 * place. Both the navbar and the footer sections edit this same slice of
 * the global document, so the logo uploaded in one is the logo used by
 * the other — one source, one mark.
 */
export default function BrandPanel({ brand, onChange, copy }) {
  const value = brand ?? {};

  function update(patch) {
    onChange({ ...value, ...patch });
  }

  return (
    <Panel title={copy.common.brand.title} description={copy.common.brand.description}>
      <Grid>
        <div className="sm:col-span-2">
          <ImageField
            field={brandFields.find((field) => field.name === "logo")}
            value={value.logo ?? ""}
            onChange={(next) => update({ logo: next })}
            copy={copy}
            section="brand"
          />
        </div>
        <TextInput
          label={brandLabel("name")}
          value={value.name}
          onChange={(next) => update({ name: next })}
        />
        <TextInput
          label={brandLabel("tagline")}
          value={value.tagline}
          onChange={(next) => update({ tagline: next })}
        />
        <TextInput
          label={brandLabel("city")}
          value={value.city}
          onChange={(next) => update({ city: next })}
        />
        <TextInput
          label={brandLabel("region")}
          value={value.region}
          onChange={(next) => update({ region: next })}
        />
        <TextInput
          label={brandLabel("country")}
          value={value.country}
          onChange={(next) => update({ country: next })}
        />
        <TextInput
          label={brandLabel("countryCode")}
          value={value.countryCode}
          onChange={(next) => update({ countryCode: next })}
        />
        <div className="sm:col-span-2">
          <Toggle
            label={brandLabel("wordmarkFallback")}
            checked={value.wordmarkFallback === true}
            onChange={(next) => update({ wordmarkFallback: next })}
            onLabel={copy.form.toggleOn}
            offLabel={copy.form.toggleOff}
          />
        </div>
      </Grid>
    </Panel>
  );
}
