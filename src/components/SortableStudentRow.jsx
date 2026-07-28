import React from "react";
import { Pencil, GripVertical, Coins } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableStudentRow({
  student,
  index,
  editMode,
  selected,
  onToggleSelect,
  onView,
  onEdit,
  onCoinsClick,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full rounded-2xl border border-slate-800 bg-white/90 px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {editMode && (
          <>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-500 shrink-0 touch-none"
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(student.id)}
              className="w-5 h-5 accent-blue-600 shrink-0"
            />
          </>
        )}

        {editMode ? (
          <span className="font-semibold  text-slate-900 truncate uppercase">
            {index + 1}. {student.name} {student.surname}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onView(student)}
            className="font-semibold text-sm text-slate-900 truncate uppercase text-left hover:text-blue-600 transition"
          >
            {index + 1}. {student.name} {student.surname}
          </button>
        )}
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <button
          onClick={() => onCoinsClick(student)}
          className="text-slate-500 text-xs flex items-center gap-1 hover:text-amber-600 transition"
          aria-label="Coin tarixi"
        >
          <Coins className="w-3.5 h-3.5" />
          {Number(student.coins) || 0}
        </button>
        {!editMode && (
          <button
            onClick={() => onEdit(student)}
            className="text-slate-800"
            aria-label="Edit student"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
