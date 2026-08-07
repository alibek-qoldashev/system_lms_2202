import React, { useState } from "react";
import { X } from "lucide-react";

export default function AddTopicModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const res = await onSave(name.trim());
    setSaving(false);

    if (res?.error) {
      alert("Xatolik: " + res.error);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">Yangi mavzu</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mavzu nomi (masalan: Gerunds)"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 mb-5"
        />

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 transition"
        >
          {saving ? "Saqlanmoqda..." : "Qo'shish"}
        </button>
      </div>
    </div>
  );
}