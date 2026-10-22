"use client";

import { useRef, useState } from "react";
import { dropIndex, moveItem } from "../homepage/reorder";

const TOP_EDGE = 160; // px from the top of the window where scrolling starts
const BOTTOM_EDGE = 120; // px from the bottom of the window
const EDGE_SPEED = 6; // px per frame at the very edge

/**
 * Drag-to-reorder plumbing for the CMS list editors.
 *
 * `rowProps(index)` is spread onto the row element, `markerFor(index)`
 * returns "before" | "after" | null so the row can draw the gold
 * insertion line, and `containerRef` goes on the list element.
 *
 * Long lists scroll themselves: while a row is being dragged near the
 * top or bottom of the window the page scrolls automatically, and the
 * insertion line follows, so a row can be dragged to the end of a list
 * that does not fit on screen.
 */
export function useSortable(list, onReorder) {
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const containerRef = useRef(null);
  const pointerY = useRef(0);
  const frameRef = useRef(null);

  function rows() {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll("[data-sortable-index]"),
    );
  }

  function computeDropTarget() {
    const y = pointerY.current;
    const list = rows();
    if (list.length === 0) return null;

    for (const row of list) {
      const rect = row.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        return {
          index: Number(row.dataset.sortableIndex),
          position: y < rect.top + rect.height / 2 ? "before" : "after",
        };
      }
    }

    const first = list[0].getBoundingClientRect();
    const last = list[list.length - 1].getBoundingClientRect();
    if (y < first.top) return { index: 0, position: "before" };
    if (y > last.bottom) return {
      index: list.length - 1,
      position: "after",
    };
    return null;
  }

  function tick() {
    const y = pointerY.current;
    const height = window.innerHeight;
    let delta = 0;

    if (y < TOP_EDGE) {
      delta = -Math.ceil(((TOP_EDGE - y) / EDGE_SPEED) * 1.6);
    } else if (y > height - BOTTOM_EDGE) {
      delta = Math.ceil(((y - (height - BOTTOM_EDGE)) / EDGE_SPEED) * 1.6);
    }

    if (delta !== 0) {
      window.scrollBy(0, delta);
      setDropTarget(computeDropTarget());
    }

    frameRef.current = requestAnimationFrame(tick);
  }

  function startAutoScroll() {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(tick);
  }

  function stopAutoScroll() {
    if (!frameRef.current) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }

  function handleDragStart(event, index) {
    setDragging(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
    startAutoScroll();
  }

  function handleDragOver(event, index) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    pointerY.current = event.clientY;

    const rect = event.currentTarget.getBoundingClientRect();
    setDropTarget({
      index,
      position:
        event.clientY < rect.top + rect.height / 2 ? "before" : "after",
    });
  }

  function handleDrop(event) {
    event.preventDefault();
    stopAutoScroll();
    if (dragging === null || !dropTarget) return;

    const insertAt = dropIndex({
      list,
      from: dragging,
      index: dropTarget.index,
      position: dropTarget.position,
    });

    onReorder(moveItem(list, dragging, insertAt));
    setDragging(null);
    setDropTarget(null);
  }

  function endDrag() {
    stopAutoScroll();
    setDragging(null);
    setDropTarget(null);
  }

  return {
    dragging,
    dropTarget,
    containerRef,
    rowProps: (index) => ({
      draggable: true,
      "data-sortable-index": index,
      onDragStart: (event) => handleDragStart(event, index),
      onDragOver: (event) => handleDragOver(event, index),
      onDrop: handleDrop,
      onDragEnd: endDrag,
    }),
    markerFor: (index) =>
      dropTarget?.index === index ? dropTarget.position : null,
  };
}
