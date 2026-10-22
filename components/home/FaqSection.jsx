"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";

/**
 * FAQ accordion. Questions in Big Shoulders with a gold tick that
 * wakes on hover, a rotating plus/close chip, and a smooth
 * grid-rows height animation on the answer. First item open by
 * default. Copy arrives via props from site.js.
 */
export default function FaqSection({ title, faqs }) {
  const enabled = (faqs ?? [])
    .filter((item) => item.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [open, setOpen] = useState(0);

  if (enabled.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className="py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={title} id="faq-heading" />
        <ul className="mt-10 border-t border-graphite">
          {enabled.map((faq, index) => {
            const isOpen = open === index;

            return (
              <li key={faq.question} className="border-b border-graphite">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rotate-45 transition-colors duration-300 ${
                        isOpen ? "bg-gold" : "bg-steel group-hover:bg-gold/60"
                      }`}
                    />
                    <span
                      className={`font-display text-xl font-bold uppercase leading-tight tracking-tight transition-colors duration-300 sm:text-2xl ${
                        isOpen
                          ? "text-gold-highlight"
                          : "text-cream group-hover:text-gold-highlight"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base leading-none transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 border-gold bg-gold/10 text-gold"
                        : "border-steel text-gold group-hover:border-gold/60"
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 pl-8 pr-4 text-sm leading-relaxed text-silver sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}