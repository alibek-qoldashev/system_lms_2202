import React, { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Send, Loader2, CheckCircle } from "lucide-react"; // CheckCircle ikonkasini qo'shdik
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Homeworks() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [homeworkText, setHomeworkText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Xabar muvaffaqiyatli ketganini ko'rsatish uchun yangi state
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("groups").select("*");
    if (!error && data) {
      setGroups(data);
    }
    setLoading(false);
  };

  const handleSaveHomework = async () => {
    if (!homeworkText.trim() || !selectedGroup) return;
    setSaving(true);

    const { error } = await supabase.from("homeworks").insert([
      {
        group_id: selectedGroup.id,
        text: homeworkText,
        created_at: new Date().toISOString(),
      },
    ]);

    setSaving(false);

    if (!error) {
      // Alert o'rniga chiroyli oynani chaqiramiz
      setShowSuccess(true);

      // 3 soniyadan keyin oynani avtomatik yopamiz
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      setHomeworkText("");
      setSelectedGroup(null);
    } else {
      alert("Xatolik yuz berdi, qaytadan urinib ko'ring.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#00173d] text-slate-100 flex justify-center relative overflow-hidden">
      {/* 
        MUVAFFAQIYAT XABARI (TOAST)
        Faqat showSuccess true bo'lganda animatsiya bilan tushib keladi
      */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${
          showSuccess
            ? "translate-y-0 opacity-100"
            : "-translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl shadow-[0_8px_30px_rgba(16,185,129,0.2)]">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-white">
            Xabar muvaffaqiyatli jo'natildi!
          </span>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col px-5 pt-8 pb-10 z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" /> Uy Vazifalari
          </h1>
        </div>

        {!selectedGroup ? (
          // 1. Guruhlar ro'yxati
          <div className="flex flex-col gap-3">
            <p className="text-sm text-white/60 mb-2">
              Vazifa berish uchun guruhni tanlang:
            </p>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
            ) : (
              groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className="w-full text-left p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 backdrop-blur-md transition flex justify-between items-center"
                >
                  <span className="font-semibold text-white">{group.name}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          // 2. Vazifa yozish qismi
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-sm text-white/80">Tanlangan guruh:</span>
              <span className="font-bold text-white">{selectedGroup.name}</span>
            </div>

            <textarea
              className="w-full h-40 p-4 rounded-2xl bg-black/20 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Uy vazifasini bu yerga yozing..."
              value={homeworkText}
              onChange={(e) => setHomeworkText(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedGroup(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium hover:bg-white/20 transition"
              >
                Orqaga
              </button>
              <button
                onClick={handleSaveHomework}
                disabled={saving || !homeworkText.trim()}
                className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold flex items-center justify-center gap-2 transition"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Yuborish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
