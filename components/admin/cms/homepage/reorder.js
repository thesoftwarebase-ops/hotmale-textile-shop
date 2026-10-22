/**
 * Move an item inside an ordered list, used by the drag-to-reorder
 * editors. `to` is the index the item should end up at, counted in the
 * list *after* the item has been lifted out.
 */
export function moveItem(list, from, to) {
  if (from === to || from < 0 || from >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  const target = Math.max(0, Math.min(to, next.length));
  next.splice(target, 0, moved);
  return next;
}

/**
 * Where a dragged item should land when dropped on the row at
 * `index` — before it (top half) or after it (bottom half), expressed
 * as an index in the list *after* the dragged item has been lifted out.
 */
export function dropIndex({ list, from, index, position }) {
  let insertAt = position === "after" ? index + 1 : index;
  if (from < insertAt) insertAt -= 1;
  return insertAt;
}
