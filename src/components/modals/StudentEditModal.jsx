import React from "react";
import { X } from "lucide-react";
import Modal from "../Modal";
import {
  formatSingleWordName,
  formatAge,
  formatPhoneDigits,
} from "../../utils/formatters";

export default function StudentEditModal({
  open,
  onClose,
  form,
  setForm,
  onSave,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Edit student</h3>
        <button onClick={onClose} className="text-slate-500" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Student name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: formatSingleWordName(e.target.value) })
          }
          className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        <input
          type="text"
          placeholder="Student surname"
          value={form.surname}
          onChange={(e) =>
            setForm({
              ...form,
              surname: formatSingleWordName(e.target.value),
            })
          }
          className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: formatAge(e.target.value) })}
          maxLength={2}
          className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        <div className="w-full flex items-center rounded-full border border-slate-800 bg-transparent px-6 py-3 gap-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-300 transition">
          <span className="text-slate-500 font-semibold shrink-0">+998</span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="90 123 45 67"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: formatPhoneDigits(e.target.value),
              })
            }
            maxLength={9}
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-500"
          />
        </div>
        <input
          type="number"
          placeholder="Payment sum"
          value={form.paymentSum}
          onChange={(e) => setForm({ ...form, paymentSum: e.target.value })}
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
