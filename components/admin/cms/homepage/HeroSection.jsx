"use client";

import ImageField from "../ImageField";
import ItemShell from "../ui/ItemShell";
import { Button, Grid, Panel, TextArea, TextInput } from "../ui/fields";
import { getHomepageSectionSchema } from "../../../../lib/cms/homepage-sections";

const heroFields = getHomepageSectionSchema("hero").fields[0].fields;
const label = (name) =>
  heroFields.find((field) => field.name === name)?.label ?? name;

export default function HeroSection({ value, onChange, copy }) {
  const hero = value?.hero ?? {};
  const posters = Array.isArray(hero.posters) ? hero.posters : [];

  function updateHero(patch) {
    onChange({ hero: { ...hero, ...patch } });
  }

  function updatePoster(index, next) {
    const list = [...posters];
    list[index] = next;
    updateHero({ posters: list });
  }

  /**
   * The carousel plays the posters in array order, so the position number
   * is the single control: typing it re-sorts the list on blur and the
   * saved array is already in playing order.
   */
  function setPosition(index, raw) {
    const position = raw === "" ? null : Number(raw);
    const list = posters.map((poster, posterIndex) =>
      posterIndex === index ? { ...poster, position } : poster,
    );
    updatePoster(index, list[index]);
  }

  function sortPosters() {
    const sorted = posters
      .map((poster, index) => ({
        ...poster,
        position: poster.position ?? index + 1,
      }))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    updateHero({ posters: sorted });
  }

  function removePoster(index) {
    updateHero({
      posters: posters.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  function addPoster() {
    const nextPosition = posters.length
      ? Math.max(...posters.map((poster) => poster.position ?? 0)) + 1
      : 1;
    updateHero({
      posters: [...posters, { src: "", alt: "", position: nextPosition }],
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Panel title={copy.homepage.sections.hero.copyTitle}>
        <Grid>
          <div className="sm:col-span-2">
            <TextInput
              label={label("headline")}
              value={hero.headline}
              onChange={(next) => updateHero({ headline: next })}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label={label("subcopy")}
              value={hero.subcopy}
              onChange={(next) => updateHero({ subcopy: next })}
              rows={3}
            />
          </div>
        </Grid>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {["primaryCta", "secondaryCta"].map((key) => {
            const cta = hero[key] ?? {};
            const fields = heroFields.find((field) => field.name === key)
              ?.fields;
            return (
              <div
                key={key}
                className="rounded-sm border border-white/[0.08] bg-black/20 p-3.5"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gold">
                  {label(key)}
                </p>
                <div className="mt-3 space-y-3">
                  <TextInput
                    label={fields?.[0]?.label ?? "Label"}
                    value={cta.label}
                    onChange={(next) =>
                      updateHero({ [key]: { ...cta, label: next } })
                    }
                  />
                  <TextInput
                    label={fields?.[1]?.label ?? "Link"}
                    value={cta.href}
                    onChange={(next) =>
                      updateHero({ [key]: { ...cta, href: next } })
                    }
                    placeholder="/collections"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        title={copy.homepage.sections.hero.postersTitle}
        description={copy.homepage.sections.hero.postersDescription}
        actions={
          <Button variant="gold" onClick={addPoster}>
            {copy.homepage.sections.hero.addPoster}
          </Button>
        }
      >
        {posters.length === 0 ? (
          <p className="rounded-sm border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted">
            {copy.form.noItems}
          </p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {posters.map((poster, index) => (
            <ItemShell
              key={`poster-${index}`}
              index={index}
              title={poster?.alt || copy.homepage.sections.hero.poster}
              subtitle={poster?.src || copy.homepage.sections.hero.noPoster}
              labels={copy.form}
              onRemove={() => removePoster(index)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageField
                  field={{ name: "src", type: "image" }}
                  value={poster?.src ?? ""}
                  onChange={(next) =>
                    updatePoster(index, { ...poster, src: next })
                  }
                  copy={copy}
                  section="hero"
                />
                <div className="space-y-4">
                  <TextInput
                    label={label("alt")}
                    value={poster?.alt}
                    onChange={(next) =>
                      updatePoster(index, { ...poster, alt: next })
                    }
                  />
                  <TextInput
                    label={label("position")}
                    type="number"
                    min={1}
                    value={poster?.position ?? index + 1}
                    onChange={(next) => setPosition(index, next)}
                    onBlur={sortPosters}
                    hint={copy.homepage.sections.hero.positionHint}
                  />
                </div>
              </div>
            </ItemShell>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
