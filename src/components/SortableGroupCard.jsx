import React from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableGroupCard({
  group,
  editMode,
  selected,
  onToggleSelect,
  onOpen,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const Wrapper = editMode ? "div" : "button";

  return (
    <Wrapper
      ref={setNodeRef}
      style={style}
      onClick={!editMode ? onOpen : undefined}
      className="w-full text-left rounded-3xl border border-white/20 bg-white/90 backdrop-blur-sm px-6 py-5 shadow-sm flex justify-between hover:brightness-105 active:scale-[0.99] transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        {editMode && (
          <>
            <button
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing text-slate-600 shrink-0 touch-none"
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(group.id)}
              className="w-5 h-5 accent-blue-600 shrink-0"
            />
          </>
        )}

        <div className="min-w-0">
          <h3 className="text-xl font-bold text-slate-900 truncate">
            {group.name}
          </h3>
          <p className="text-sm text-slate-600 mt-2 leading-snug">
            Name of students
            <br />
            for Payment
          </p>
        </div>
      </div>

      <div className="text-right text-sm text-slate-600 flex flex-col gap-2 justify-start shrink-0">
        <p>{group.time || "Lesson time"}</p>
        <p>{group.days || "Lesson days"}</p>
        <p>Num. of students: {group.students.length}</p>
      </div>
    </Wrapper>
  );
}
