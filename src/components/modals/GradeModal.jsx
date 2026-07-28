import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

const GRADE_CATEGORIES = [
  { key: "homework", label: "Homework", max: 100 },
  { key: "classwork", label: "Classwork", max: 200 },
  { key: "extrawork", label: "Extrawork", max: 50 },
  { key: "tartib", label: "Tartib", max: 100 },
];

export default function GradeModal({ student, onClose, onSave }) {
  const [mode, setMode] = useState(null); // "add" | "subtract" | null
  const [category, setCategory] = useState(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Ayirish tanlanganda faqat Tartib va Homework ko'rsatiladi
  const availableCategories =
    mode === "subtract"
      ? GRADE_CATEGORIES.filter((c) => c.key === "tartib" || c.key === "homework")
      : GRADE_CATEGORIES;

  const currentCategory = GRADE_CATEGORIES.find((c) => c.key === category);
  const amountNumber = Number(amount) || 0;
  const exceedsMax = !!currentCategory && amountNumber > currentCategory.max;

  const selectMode = (m) => {
    setMode(m);
    setCategory(null);
    setAmount("");
  };

  const selectCategory = (key) => {
    setCategory(key);
    setAmount("");
  };

  const handleAmountChange = (raw) => {
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 3);
    setAmount(digitsOnly);
  };

  const handleSave = async () => {
    if (!currentCategory || !amount) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    if (amt > currentCategory.max) return;

    const delta = mode === "add" ? amt : -amt;

    setSaving(true);
    const res = await onSave(delta);
    setSaving(false);

    if (res?.error) {
      alert("Coins saqlashda xatolik: " + res.error);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-900">
            {student.name} {student.surname}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label="Yopish"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-slate-500 text-sm mb-5">
          Joriy coins: {Number(student.coins) || 0}
        </p>

        {/* 1-qadam: Qo'shish / Ayirish */}
        <div className="flex rounded-full bg-slate-200 p-1 mb-5">
          <button
            onClick={() => selectMode("add")}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold flex items-center justify-center gap-1 transition ${
              mode === "add" ? "bg-green-500 text-white shadow" : "text-slate-600"
            }`}
          >
            <Plus className="w-4 h-4" /> Qo'shish
          </button>
          <button
            onClick={() => selectMode("subtract")}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold flex items-center justify-center gap-1 transition ${
              mode === "subtract" ? "bg-red-500 text-white shadow" : "text-slate-600"
            }`}
          >
            <Minus className="w-4 h-4" /> Ayirish
          </button>
        </div>

        {/* 2-qadam: kategoriya */}
        {mode && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {availableCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat.key)}
                className={`rounded-2xl border-2 px-3 py-4 text-center transition ${
                  category === cat.key
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <p className="font-bold text-slate-900">{cat.label}</p>
                <p className="text-xs text-slate-500 mt-1">Max {cat.max}</p>
              </button>
            ))}
          </div>
        )}

        {/* 3-qadam: summa */}
        {currentCategory && (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            {exceedsMax && (
              <p className="text-red-500 text-sm font-bold mb-2">
                Max {currentCategory.max}
              </p>
            )}

            <input
              type="text"
              inputMode="numeric"
              maxLength={3}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder={`Coins (max ${currentCategory.max})`}
              className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none focus:border-blue-500 mb-4 ${
                exceedsMax ? "border-red-400 focus:border-red-500" : "border-slate-200"
              }`}
            />

            <button
              onClick={handleSave}
              disabled={saving || !amount || exceedsMax}
              className="w-full rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 transition"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}