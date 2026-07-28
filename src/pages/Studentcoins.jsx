import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins as CoinsIcon,
  ArrowLeft,
  ShoppingBag,
  Crown,
  Trophy,
  Medal,
  Sparkles,
  UserCheck,
} from "lucide-react";
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
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex justify-center relative overflow-hidden">
      {/* Orqa fondagi neonsimon yog'du (Background Gradients) */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center px-5 pt-12 pb-10 z-10">
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/studenthome")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-sm font-medium backdrop-blur-xl transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl rounded-2xl px-3.5 py-1.5">
            <CoinsIcon className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-amber-400 text-sm tabular-nums">
              {loading ? "…" : myCoins}
            </span>
          </div>
        </div>

        {/* Spend Coins Banner / Action */}
        <button
          onClick={() => navigate("/student/use-coins")}
          className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-slate-900/60 border border-amber-500/30 hover:border-amber-500/50 backdrop-blur-xl flex items-center justify-between group transition-all duration-300 active:scale-98 shadow-lg shadow-amber-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                Coinlarni sarflash
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </p>
              <p className="text-xs text-slate-400">
                Sovg'alar va bonuslar olish
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            Do'kon →
          </span>
        </button>

        {/* Leaderboard Title */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Guruh Reytingi
          </h2>
          <span className="text-xs text-slate-500">
            {groupStudents.length} ta o'quvchi
          </span>
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="w-full space-y-2.5 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-slate-800/40 rounded-2xl border border-white/5"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && groupStudents.length === 0 && (
          <div className="w-full rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl px-6 py-10 text-center">
            <p className="text-slate-400 text-sm font-medium">
              Guruhda o'quvchilar topilmadi
            </p>
          </div>
        )}

        {/* Leaderboard List */}
        {!loading && groupStudents.length > 0 && (
          <div className="w-full flex flex-col gap-2.5">
            {groupStudents.map((s, index) => {
              const isMe = s.id === student.id;
              const rank = index + 1;

              // Top 3 style customization
              let cardStyle = "bg-slate-900/60 border-white/5 text-slate-300";
              let rankBadge = (
                <span className="w-7 text-xs font-bold text-slate-500 text-center">
                  #{rank}
                </span>
              );

              if (rank === 1) {
                cardStyle =
                  "bg-gradient-to-r from-amber-500/15 via-slate-900/80 to-slate-900/90 border-amber-500/30 text-amber-200 shadow-md shadow-amber-500/5";
                rankBadge = (
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Crown className="w-4 h-4" />
                  </div>
                );
              } else if (rank === 2) {
                cardStyle =
                  "bg-gradient-to-r from-slate-400/15 via-slate-900/80 to-slate-900/90 border-slate-400/30 text-slate-200";
                rankBadge = (
                  <div className="p-1.5 rounded-lg bg-slate-400/20 text-slate-300 border border-slate-400/30">
                    <Trophy className="w-4 h-4" />
                  </div>
                );
              } else if (rank === 3) {
                cardStyle =
                  "bg-gradient-to-r from-amber-700/15 via-slate-900/80 to-slate-900/90 border-amber-700/30 text-amber-300";
                rankBadge = (
                  <div className="p-1.5 rounded-lg bg-amber-700/20 text-amber-500 border border-amber-700/30">
                    <Medal className="w-4 h-4" />
                  </div>
                );
              }

              return (
                <div
                  key={s.id}
                  className={`w-full rounded-2xl p-3.5 border backdrop-blur-xl flex items-center justify-between gap-3 transition-all duration-200 ${cardStyle} ${
                    isMe
                      ? "ring-2 ring-blue-500/80 border-blue-500/50 bg-blue-600/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white truncate">
                          {s.name} {s.surname}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-[10px] font-medium text-blue-400 flex items-center gap-0.5">
                            <UserCheck className="w-3 h-3" />
                            Siz
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/60 border border-white/5 shrink-0">
                    <CoinsIcon className="w-4 h-4 text-amber-400" />
                    <span className="font-extrabold text-sm text-amber-400 tabular-nums">
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
