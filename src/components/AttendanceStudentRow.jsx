import React from "react";
import { Check, X, Coins } from "lucide-react";

export default function AttendanceStudentRow({
  student,
  pending,
  saved,
  isExpanded,
  onToggleExpand,
  onChooseStatus,
  onOpenGradeModal,
}) {
  let circleClass = "bg-slate-200 border-slate-300 hover:border-slate-400";
  if (pending === "present") circleClass = "bg-green-200 border-green-300";
  else if (pending === "absent") circleClass = "bg-red-200 border-red-300";
  else if (saved === "present") circleClass = "bg-green-500 border-green-500";
  else if (saved === "absent") circleClass = "bg-red-500 border-red-500";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-100/80 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900 truncate uppercase min-w-0">
          {student.name} {student.surname}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenGradeModal(student)}
            aria-label="Baho berish"
            className="w-7 h-7 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition"
          >
            <Coins className="w-4 h-4 text-white" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => onToggleExpand(student.id)}
            aria-label="Davomatni belgilash"
            className={`w-7 h-7 rounded-full border-2 shrink-0 transition ${circleClass}`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-300/70">
          <button
            onClick={() => onChooseStatus(student.id, "present")}
            aria-label="Keldi"
            className="w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition"
          >
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
          <button
            onClick={() => onChooseStatus(student.id, "absent")}
            aria-label="Kelmadi"
            className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
