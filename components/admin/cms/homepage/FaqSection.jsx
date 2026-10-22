"use client";

import ItemShell from "../ui/ItemShell";
import { useSortable } from "../ui/useSortable";
import { Button, Grid, Panel, TextArea, TextInput, Toggle } from "../ui/fields";
import { getHomepageSectionSchema } from "../../../../lib/cms/homepage-sections";

const faqFields = getHomepageSectionSchema("faq").fields[0].fields;
const label = (name) =>
  faqFields.find((field) => field.name === name)?.label ?? name;

export default function FaqSection({ value, onChange, copy }) {
  const questions = Array.isArray(value?.faq) ? value.faq : [];

  const { rowProps, markerFor, dragging, containerRef } = useSortable(
    questions,
    (next) =>
      // The public FAQ is ordered by the position field, so dragging
      // renumbers the items — otherwise the reorder would be a no-op.
      onChange({ faq: next.map((entry, index) => ({ ...entry, order: index + 1 })) }),
  );

  function update(index, patch) {
    const list = [...questions];
    list[index] = { ...list[index], ...patch };
    onChange({ faq: list });
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const list = [...questions];
    [list[index], list[target]] = [list[target], list[index]];
    onChange({ faq: list });
  }

  function remove(index) {
    onChange({ faq: questions.filter((_, itemIndex) => itemIndex !== index) });
  }

  function add() {
    onChange({
      faq: [
        ...questions,
        { question: "", answer: "", enabled: true, order: questions.length + 1 },
      ],
    });
  }

  return (
    <Panel
      title={copy.homepage.sections.faq.copyTitle}
      description={copy.homepage.sections.faq.description}
      actions={
        <Button variant="gold" onClick={add}>
          {copy.homepage.sections.faq.addQuestion}
        </Button>
      }
    >
      {questions.length === 0 ? (
        <p className="rounded-sm border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted">
          {copy.form.noItems}
        </p>
      ) : null}

      <ul ref={containerRef} className="flex flex-col gap-3">
        {questions.map((entry, index) => (
          <li
            key={`faq-${index}`}
            {...rowProps(index)}
            className="cursor-grab active:cursor-grabbing"
          >
            <ItemShell
              index={index}
              title={entry.question || copy.homepage.sections.faq.question}
              first={index === 0}
              last={index === questions.length - 1}
              labels={copy.form}
              draggable
              dropMarker={markerFor(index)}
              dragging={dragging === index}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onRemove={() => remove(index)}
            >
            <Grid>
              <div className="sm:col-span-2">
                <TextInput
                  label={label("question")}
                  value={entry.question}
                  onChange={(next) => update(index, { question: next })}
                />
              </div>
              <div className="sm:col-span-2">
                <TextArea
                  label={label("answer")}
                  value={entry.answer}
                  onChange={(next) => update(index, { answer: next })}
                  rows={4}
                />
              </div>
            </Grid>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <Toggle
                label={label("enabled")}
                checked={entry.enabled !== false}
                onChange={(next) => update(index, { enabled: next })}
                onLabel={copy.form.toggleOn}
                offLabel={copy.form.toggleOff}
              />
            </div>
            </ItemShell>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
