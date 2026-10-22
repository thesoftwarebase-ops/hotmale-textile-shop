"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

/**
 * Sortable card grid. Cards call `useSortable` themselves: the article
 * takes `setNodeRef`/`style`, and the grip takes
 * `setActivatorNodeRef`/`attributes`/`listeners`. Keeping the hook in
 * the card means the card body stays clickable while the grip owns the
 * drag, and dropping hands the reordered list to the grid.
 */
export default function SortableGrid({ items, onReorder, className, children }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((entry) => entry.id === active.id);
    const newIndex = items.findIndex((entry) => entry.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((entry) => entry.id)}
        strategy={rectSortingStrategy}
      >
        <div className={className}>{children}</div>
      </SortableContext>
    </DndContext>
  );
}
