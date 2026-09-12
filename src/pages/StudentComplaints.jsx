import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Coins as CoinsIcon } from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { supabase } from "../supabaseClient";

function formatDMY(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function StudentComplaints() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("id, text, coins_deducted, created_at")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setComplaints(data);
        if (data.length > 0) {
          // Ko'rilgan deb belgilaymiz — StudentHome'dagi qizil "!" shu asosda yo'qoladi
          localStorage.setItem(
            `viewed_complaint_${student.id}`,
            String(data[0].id),
          );
        }
      }
      setLoading(false);
    };

    if (student) fetchComplaints();
  }, [student]);

  if (!student) return null;

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex justify-center relative overflow-hidden">
      <div className="absolute -top-24 -left-20 w-72 h-72 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center px-5 pt-12 pb-10 z-10">
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/studenthome")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-sm font-medium backdrop-blur-xl transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>
          <h1 className="text-lg font-bold text-white">Shikoyatlar</h1>
          <span className="w-16" />
        </div>

        {loading && (
          <p className="text-slate-400 mt-8 text-center animate-pulse">
            Yuklanmoqda...
          </p>
        )}

        {!loading && complaints.length === 0 && (
          <div className="w-full rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">Hozircha shikoyatlar yo'q</p>
          </div>
        )}

        {!loading && complaints.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-rose-500/10 border border-rose-500/25 backdrop-blur-xl p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      {formatDMY(c.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-300">
                    <CoinsIcon className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">
                      -{c.coins_deducted}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-white leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
