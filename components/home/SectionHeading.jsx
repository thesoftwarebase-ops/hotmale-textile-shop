import AppLink from "../transitions/AppLink";

/**
 * Shared section heading: Big Shoulders title with a gold tick and an
 * optional "view all" link. Title/link text arrive via props from
 * data — this component never owns copy. `center` centres it for
 * panel sections.
 */
export default function SectionHeading({ title, linkLabel, linkHref, id, center = false }) {
  return (
    <div
      className={`flex flex-col gap-4 ${
        center ? "items-center" : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <h2
        id={id}
        className={`flex items-center gap-3 font-display text-4xl font-bold uppercase leading-none tracking-tight text-cream sm:text-5xl ${
          center ? "justify-center" : ""
        }`}
      >
        <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-gold" />
        {title}
      </h2>
      {linkLabel && linkHref && (
        <AppLink
          href={linkHref}
          className="group inline-flex min-h-[44px] items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-silver transition-colors hover:text-gold-highlight"
        >
          {linkLabel}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </AppLink>
      )}
    </div>
  );
}
