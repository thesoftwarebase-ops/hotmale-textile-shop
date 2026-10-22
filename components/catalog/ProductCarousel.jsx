"use client";

import { useRef, useState } from "react";
import ProductCard from "./ProductCard";

/**
 * Collection product carousel — a 3D coverflow fan. Geometry is keyed
 * by slot offset from the active card (0, ±1, ±2, and a far slot), so
 * the layout is identical for 5, 7 or 8 products; only the product
 * data and the dot count scale with the collection. Cards wrap around
 * infinitely. Horizontal pointer drags rotate one step and never
 * block vertical page scroll (touch-action: pan-y); arrows and the
 * diamond dots are real buttons. Off-window cards are inert, and the
 * active card is the only link in the tab order.
 */
const VISIBLE_SLOTS = 2;
const DRAG_STEP = 40;

function slotFor(index, active, total) {
  let offset = index - active;
  while (offset > total / 2) offset -= total;
  while (offset < -total / 2) offset += total;
  return Math.max(
    -VISIBLE_SLOTS - 1,
    Math.min(VISIBLE_SLOTS + 1, offset),
  );
}

export default function ProductCarousel({
  products,
  photoNote,
  href,
  label,
  roleDescription,
  prevLabel,
  nextLabel,
}) {
  const [active, setActive] = useState(0);
  const total = products.length;
  const drag = useRef({ id: null, x: 0, y: 0, moved: false });
  const suppressClick = useRef(false);

  const step = (direction) => {
    setActive((current) => (current + direction + total) % total);
  };

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    suppressClick.current = false;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
  };

  const onPointerMove = (event) => {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (state.moved) return;
    if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy)) return;
    state.moved = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const endDrag = (event) => {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    const dx = event.clientX - state.x;
    if (state.moved) {
      suppressClick.current = true;
      if (Math.abs(dx) >= DRAG_STEP) step(dx < 0 ? 1 : -1);
    }
    drag.current = { id: null, x: 0, y: 0, moved: false };
  };

  const cancelDrag = (event) => {
    if (drag.current.id !== event.pointerId) return;
    drag.current = { id: null, x: 0, y: 0, moved: false };
  };

  const onStageClickCapture = (event) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className="product-carousel"
      role="group"
      aria-roledescription={roleDescription}
      aria-label={label}
    >
      <div className="product-carousel-clip relative">
        <div
          className="product-carousel-stage cursor-grab select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={cancelDrag}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={onStageClickCapture}
        >
          {products.map((product, index) => {
            const offset = slotFor(index, active, total);
            const hidden = Math.abs(offset) > VISIBLE_SLOTS;
            const slot = Math.max(
              -VISIBLE_SLOTS - 1,
              Math.min(VISIBLE_SLOTS + 1, offset),
            );
            return (
              <div
                key={product.slug}
                data-slot={slot}
                className="product-carousel-card"
                inert={hidden ? true : undefined}
                onClickCapture={(event) => {
                  if (slot === 0) return;
                  event.preventDefault();
                  event.stopPropagation();
                  setActive(index);
                }}
              >
                <ProductCard
                  product={product}
                  photoNote={photoNote}
                  href={href}
                  tabIndex={slot === 0 ? 0 : -1}
                />
              </div>
            );
          })}
        </div>
      </div>

      {total > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={prevLabel}
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-gold/50 text-base text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="flex items-center">
            {products.map((product, index) => (
              <button
                key={product.slug}
                type="button"
                onClick={() => setActive(index)}
                aria-label={product.name}
                aria-current={index === active ? "true" : undefined}
                className="group/dot flex h-8 w-8 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rotate-45 transition-all duration-300 ${
                    index === active
                      ? "scale-125 bg-gold"
                      : "bg-steel group-hover/dot:bg-gold/60"
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={nextLabel}
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-gold/50 text-base text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
