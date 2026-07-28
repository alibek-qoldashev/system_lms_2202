import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { useGroups } from "./GroupsContext";

export default function StudentSettings() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();
  const { updateStudentPassword } = useGroups();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!newPassword.trim()) {
      setMessage("Yangi parolni kiriting");
      setIsSuccess(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Parollar mos kelmadi");
      setIsSuccess(false);
      return;
    }

    setSaving(true);
    try {
      const res = await updateStudentPassword(student.id, newPassword);

      if (res?.error) {
        setMessage("Xatolik yuz berdi");
        setIsSuccess(false);
        return;
      }

      setMessage("Parol muvaffaqiyatli yangilandi");
      setIsSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Parolni saqlashda kutilmagan xatolik:", err);
      setMessage("Xatolik yuz berdi");
      setIsSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex justify-center relative overflow-hidden">
      {/* Orqa fondagi neonsimon yog'du */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center px-5 pt-12 pb-10 z-10">
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/studenthome")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-sm font-medium backdrop-blur-xl transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>

          <h1 className="text-lg font-bold text-white tracking-wide">
            Sozlamalar
          </h1>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-sm font-medium backdrop-blur-xl transition active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        </div>

        {/* Form Card */}
        <div className="w-full rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-2xl shadow-2xl p-6 relative overflow-hidden">
          {/* Card Accent Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          <div className="flex flex-col items-center mb-6">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Parolni o'zgartirish
            </h2>
            <p className="text-xs text-slate-400 text-center mt-1">
              Hisobingiz xavfsizligini ta'minlash uchun yangi parol kiriting
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Yangi parol Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">
                Yangi parol
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-white/10 focus:border-blue-500/80 rounded-2xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-600 outline-none transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Parolni tasdiqlash Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">
                Yangi parolni tasdiqlang
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-white/10 focus:border-blue-500/80 rounded-2xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-600 outline-none transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Response Message Notification */}
            {message && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
                  isSuccess
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <span>Saqlash</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
