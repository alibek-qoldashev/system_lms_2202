import React, { useRef } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const LONG_PRESS_MS = 800;

export default function SortableGroupCard({
  group,
  editMode,
  selected,
  onToggleSelect,
  onOpen,
  onLongPress, 
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

  // Bosib-ushlab-turish (long press) holatini kuzatish uchun
  const timerRef = useRef(null);
  const longPressFiredRef = useRef(false);

  const clearLongPressTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerDown = () => {
    if (editMode) return; // edit rejimida allaqachon drag ishlaydi
    longPressFiredRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress?.();
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    clearLongPressTimer();
  };

  const handlePointerLeave = () => {
    clearLongPressTimer();
  };

  const handleClick = (e) => {
    if (longPressFiredRef.current) {
      e.preventDefault();
      longPressFiredRef.current = false;
      return;
    }
    onOpen?.(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen?.(e);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role={!editMode ? "button" : undefined}
      tabIndex={!editMode ? 0 : undefined}
      onClick={!editMode ? handleClick : undefined}
      onKeyDown={!editMode ? handleKeyDown : undefined}
      onPointerDown={!editMode ? handlePointerDown : undefined}
      onPointerUp={!editMode ? handlePointerUp : undefined}
      onPointerLeave={!editMode ? handlePointerLeave : undefined}
      onPointerCancel={!editMode ? handlePointerUp : undefined}
      className="w-full text-left rounded-3xl border border-white/20 bg-white/90 backdrop-blur-sm pr-6 pl-2 py-5 shadow-sm flex justify-between hover:brightness-105 active:scale-[0.99] transition touch-none select-none cursor-pointer"
    >
      <div className="flex items-center  min-w-0">
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
              className="w-5 h-5 accent-blue-600 shrink-0 ml-3"
            />
          </>
        )}

        <div className="min-w-0 pl-5">
          <h3 className=" font-bold text-slate-900 truncate mb-13">
            {group.name}
          </h3>
        </div>
      </div>

      <div className="text-right text-sm text-slate-600 flex flex-col gap-2 justify-start">
        <p>{group.time || "Lesson time"}</p>
        <p>{group.days || "Lesson days"}</p>
        <p>Num. of students: {group.students.length}</p>
      </div>
    </div>
  );
}
