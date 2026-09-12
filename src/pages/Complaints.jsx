import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Send } from "lucide-react";
import { useGroups } from "./GroupsContext";

export default function Complaints() {
  const navigate = useNavigate();
  const { groups, loading, sendComplaint } = useGroups();

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [successId, setSuccessId] = useState(null);

  const group = selectedGroupId
    ? groups.find((g) => g.id === selectedGroupId)
    : null;

  const openForm = (studentId) => {
    setExpandedStudentId((prev) => (prev === studentId ? null : studentId));
    setText("");
    setSuccessId(null);
  };

  const handleSend = async (studentId) => {
    if (!text.trim()) return;
    setSending(true);
    const res = await sendComplaint(selectedGroupId, studentId, text);
    setSending(false);

    if (res?.error) {
      alert("Xatolik: " + res.error);
      return;
    }

    setText("");
    setExpandedStudentId(null);
    setSuccessId(studentId);
    setTimeout(() => setSuccessId(null), 3000);
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center bg-[#00173d] overflow-hidden">
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-rose-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10 min-h-screen">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          {selectedGroupId ? (
            <button
              onClick={() => setSelectedGroupId(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/home")}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white text-center flex-1 drop-shadow-sm">
            Shikoyat
          </h1>
          <span className="w-9" />
        </div>

        {/* GURUHLAR RO'YXATI */}
        {!selectedGroupId && (
          <>
            {loading && (
              <p className="text-white/60 mt-16 text-center animate-pulse">
                Yuklanmoqda...
              </p>
            )}
            {!loading && groups.length === 0 && (
              <div className="w-full mt-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg px-6 py-10">
                <p className="text-white/80 text-lg font-medium text-center">
                  Guruhlar mavjud emas
                </p>
              </div>
            )}
            {!loading && groups.length > 0 && (
              <div className="w-full mt-2 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg p-5 flex flex-col gap-3">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-start justify-between gap-3 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-white truncate drop-shadow-sm">
                        {g.name}
                      </p>
                      <p className="text-sm text-white/60 mt-0.5">
                        {g.students.length} o'quvchi
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* GURUH ICHIDAGI O'QUVCHILAR */}
        {selectedGroupId && !group && (
          <div className="w-full mt-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg px-6 py-10">
            <p className="text-white/80 text-lg font-medium text-center">
              Guruh topilmadi
            </p>
          </div>
        )}

        {selectedGroupId && group && (
          <div className="w-full mt-2 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg px-5 py-6 flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white text-center drop-shadow-sm mb-2">
              {group.name}
            </h2>

            {group.students.length === 0 && (
              <p className="text-white/60 text-center py-6">
                Bu guruhda o'quvchilar yo'q
              </p>
            )}

            {group.students.map((student) => {
              const isExpanded = expandedStudentId === student.id;
              const justSent = successId === student.id;
              return (
                <div
                  key={student.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white truncate uppercase">
                      {student.name} {student.surname}
                    </span>
                    <button
                      onClick={() => openForm(student.id)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition"
                      aria-label="Shikoyat yozish"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>

                  {justSent && (
                    <p className="text-emerald-400 text-xs font-semibold mt-2">
                      Shikoyat yuborildi
                    </p>
                  )}

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-3">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Shikoyat matnini yozing..."
                        rows={3}
                        className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-rose-400 resize-none"
                      />
                      <button
                        onClick={() => handleSend(student.id)}
                        disabled={sending || !text.trim()}
                        className="self-end flex items-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {sending ? "Yuborilmoqda..." : "Yuborish"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-auto pt-16 text-center text-xs text-white/50">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>
    </div>
  );
}
