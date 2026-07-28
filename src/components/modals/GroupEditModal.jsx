import React from "react";
import { X } from "lucide-react";
import Modal from "../Modal";
import { formatTimeDigits, formatDaysLetters } from "../../utils/formatters";

export default function GroupEditModal({
  open,
  onClose,
  form,
  setForm,
  onSave,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Edit group</h3>
        <button onClick={onClose} className="text-slate-500" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Group name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Lesson time (14:00)"
          value={form.time}
          onChange={(e) =>
            setForm({ ...form, time: formatTimeDigits(e.target.value) })
          }
          maxLength={5}
          className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        <input
          type="text"
          placeholder="Lesson days (Mo-We-Fr)"
          value={form.days}
          onChange={(e) =>
            setForm({ ...form, days: formatDaysLetters(e.target.value) })
          }
          maxLength={8}
          className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />

        <button
          onClick={onSave}
          className="w-full mt-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-3 shadow-md transition"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
