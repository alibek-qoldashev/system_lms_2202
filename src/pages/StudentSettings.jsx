import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";
import { useGroups } from "./GroupsContext";

export default function StudentSettings() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();
  const { updateStudentPassword } = useGroups();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      setMessage("Parollar mos kelmadi");
      return;
    }

    setSaving(true);
    try {
      const res = await updateStudentPassword(student.id, newPassword);

      if (res?.error) {
        setMessage("Xatolik yuz berdi");
        return;
      }

      setMessage("Parol yangilandi");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      // Kutilmagan xato bo'lsa ham (masalan funksiya topilmasa, tarmoq uzilsa),
      // tugma abadiy "Saqlanmoqda..." holatida qolib ketmasin.
      console.error("Parolni saqlashda kutilmagan xatolik:", err);
      setMessage("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/studenthome")}
            className="text-slate-200 font-semibold"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Account</h1>
          <span className="w-14" />
          <button
            onClick={() => navigate("/login")}
            className="text-slate-200 font-semibold"
          >
            Exit
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="w-full rounded-3xl bg-white/90 backdrop-blur-sm shadow-sm px-6 py-8 flex flex-col gap-4"
        >
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Yangi parol"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Yangi parolni tasdiqlang"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          {message && (
            <p
              className={`text-sm font-semibold text-center ${
                message === "Parol yangilandi"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 mt-2 transition"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
}
