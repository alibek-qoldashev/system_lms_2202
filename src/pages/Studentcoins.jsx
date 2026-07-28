import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coins as CoinsIcon } from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { supabase } from "../supabaseClient";

export default function StudentCoins() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();
  const [myCoins, setMyCoins] = useState(0);
  const [groupStudents, setGroupStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!student) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("students")
        .select("id, name, surname, coins")
        .eq("group_id", student.groupId)
        .order("coins", { ascending: false });

      if (error) {
        console.error("Reytingni yuklashda xatolik:", error);
        setLoading(false);
        return;
      }

      const list = data || [];
      setGroupStudents(list);

      const me = list.find((s) => s.id === student.id);
      setMyCoins(Number(me?.coins) || 0);
      setLoading(false);
    };

    fetchData();
  }, [student]);

  if (!student) return null;

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8 gap-3">
          <button
            onClick={() => navigate("/student/use-coins")}
            className="text-lg font-bold text-white shrink-0 underline decoration-2 underline-offset-4 hover:text-slate-200 transition"
          >
            Coinlarni sarflash
          </button>

          <div className="flex items-center gap-1.5 bg-white/90 rounded-full pl-2.5 pr-3 py-1.5 shrink-0">
            <CoinsIcon className="w-4 h-4 text-yellow-500" strokeWidth={2.5} />
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              {loading ? "…" : myCoins}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/studenthome")}
          className="w-full text-left text-slate-300 font-semibold text-sm mb-4 -mt-4"
        >
          ← Back
        </button>

        {loading && <p className="text-slate-300 mt-8">Yuklanmoqda...</p>}

        {!loading && groupStudents.length === 0 && (
          <div className="w-full rounded-3xl bg-white/90 shadow-sm px-6 py-10">
            <p className="text-slate-600 text-lg font-semibold text-center">
              Guruhda o'quvchilar topilmadi
            </p>
          </div>
        )}

        {!loading && groupStudents.length > 0 && (
          <div className="w-full rounded-3xl bg-white/90 backdrop-blur-sm shadow-sm px-4 py-4 flex flex-col gap-2">
            {groupStudents.map((s, index) => {
              const isMe = s.id === student.id;
              const rank = index + 1;

              // Top-3 uchun ochroq, ajralib turadigan ranglar
              let rowClass = "bg-slate-50";
              if (rank === 1)
                rowClass = "bg-yellow-100 border border-yellow-300";
              else if (rank === 2)
                rowClass = "bg-slate-200 border border-slate-300";
              else if (rank === 3)
                rowClass = "bg-orange-100 border border-orange-200";

              return (
                <div
                  key={s.id}
                  className={`w-full rounded-2xl px-4 py-3 flex items-center justify-between gap-3 transition ${rowClass} ${
                    isMe ? "ring-2 ring-blue-400" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 text-sm font-bold shrink-0 ${
                        rank <= 3 ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="font-semibold text-slate-900 truncate">
                      {s.name} {s.surname}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CoinsIcon
                      className="w-4 h-4 text-yellow-500"
                      strokeWidth={2.5}
                    />
                    <span className="font-bold text-slate-900 tabular-nums">
                      {Number(s.coins) || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
