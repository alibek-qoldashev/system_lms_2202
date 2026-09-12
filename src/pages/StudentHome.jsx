import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins as CoinsIcon,
  FileText,
  BookOpen,
  UserCircle,
  Sparkles,
  ChevronRight,
  Clock,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { supabase } from "../supabaseClient";

const LESSONS_PER_CYCLE = 12;
const WARNING_AT = 2; // shu qadar dars qolganda "sariq"

// Dars soni asosida holatni aniqlaydi: "due", "warning", "ok"
function getPaymentStatus(lessonsSincePayment) {
  const count = Number(lessonsSincePayment) || 0;
  if (count >= LESSONS_PER_CYCLE) return "due";
  if (count >= LESSONS_PER_CYCLE - WARNING_AT) return "warning";
  return "ok";
}

export default function StudentHome() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();
  const [profile, setProfile] = useState(null);
  const [hasHomework, setHasHomework] = useState(false);
  const [hasComplaint, setHasComplaint] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("coins, name, surname, group_id, lessons_since_payment")
        .eq("id", student.id)
        .single();

      if (!studentError && studentData) {
        setProfile(studentData);

        if (studentData.group_id) {
          const { data: hwData, error: hwError } = await supabase
            .from("homeworks")
            .select("id, created_at")
            .eq("group_id", studentData.group_id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (!hwError && hwData && hwData.length > 0) {
            const latestHomeworkId = hwData[0].id;

            // LocalStorage dan oxirgi ko'rilgan vazifa ID sini tekshiramiz
            const viewedHomeworkId = localStorage.getItem(
              `viewed_hw_${student.id}`,
            );

            // Agar bazadagi oxirgi vazifa ID si ko'rilgan ID bilan bir xil bo'lmasa, demak yangi vazifa bor!
            if (viewedHomeworkId !== String(latestHomeworkId)) {
              setHasHomework(true);
            }
          }
        }

        // Yangi shikoyat bor-yo'qligini tekshiramiz
        const { data: complaintData, error: complaintError } = await supabase
          .from("complaints")
          .select("id")
          .eq("student_id", student.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!complaintError && complaintData && complaintData.length > 0) {
          const latestComplaintId = complaintData[0].id;
          const viewedComplaintId = localStorage.getItem(
            `viewed_complaint_${student.id}`,
          );

          if (viewedComplaintId !== String(latestComplaintId)) {
            setHasComplaint(true);
          }
        }
      }
      setLoading(false);
    };

    if (student) fetchData();
  }, [student]);

  // Kartochka bosilganda o'qilgan deb belgilaymiz va sahifaga o'tamiz
  const handleOpenHomework = async () => {
    if (profile?.group_id) {
      // Bazadan oxirgi vazifa ID sini olib, localStorage ga saqlab qo'yamiz
      const { data } = await supabase
        .from("homeworks")
        .select("id")
        .eq("group_id", profile.group_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        localStorage.setItem(`viewed_hw_${student.id}`, String(data[0].id));
      }
    }
    navigate("/student/homework");
  };

  if (!student) return null;

  const lessonsSincePayment = Number(profile?.lessons_since_payment) || 0;
  const paymentStatus = getPaymentStatus(lessonsSincePayment);
  const lessonsLeft = Math.max(0, LESSONS_PER_CYCLE - lessonsSincePayment);

  const paymentBannerStyle = {
    ok: "bg-white/5 border-white/10 text-white/70",
    warning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    due: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  }[paymentStatus];

  const paymentBannerText =
    paymentStatus === "due"
      ? "To'lov qilish kerak"
      : `${lessonsLeft} dars qoldi`;

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex justify-center relative overflow-hidden">
      <div className="absolute -top-24 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center px-5 pt-12 pb-10 z-10">
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
              Student Portal
            </span>
          </div>

          <button
            onClick={() => navigate("/student/settings")}
            aria-label="Account"
            className="group relative p-2 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 backdrop-blur-xl transition-all duration-300 active:scale-95"
          >
            <UserCircle className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* To'lov holati banneri */}
        {!loading && profile && (
          <div
            className={`w-full mb-6 px-4 py-3 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-3 ${paymentBannerStyle}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {paymentStatus !== "ok" && (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="text-sm font-semibold truncate">
                To'lovga {paymentBannerText}
              </span>
            </div>
            {paymentStatus !== "due" && (
              <span className="text-xs font-medium opacity-70 shrink-0 tabular-nums">
                {lessonsSincePayment}/{LESSONS_PER_CYCLE} dars
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="w-full space-y-6 animate-pulse">
            <div className="h-28 w-full bg-slate-800/40 rounded-3xl border border-white/5" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-32 bg-slate-800/40 rounded-2xl border border-white/5" />
              <div className="h-32 bg-slate-800/40 rounded-2xl border border-white/5" />
              <div className="h-32 bg-slate-800/40 rounded-2xl border border-white/5" />
            </div>
          </div>
        ) : (
          profile && (
            <>
              {/* Profile Greeting Banner */}
              <div className="w-full mb-8 p-5 rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
                    {profile.name?.[0]}
                    {profile.surname?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Xush kelibsiz!
                    </p>
                    <h2 className="text-xl font-bold text-white truncate">
                      {profile.name} {profile.surname}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Cards Section Title */}
              <div className="w-full flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Bo'limlar
                </h3>
              </div>

              {/* Widgets Grid */}
              <div className="w-full grid grid-cols-3 gap-3">
                {/* COINS CARD */}
                <button
                  onClick={() => navigate("/student/coins")}
                  className="group relative rounded-2xl p-3 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 backdrop-blur-xl flex flex-col items-center justify-between gap-3 transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-lg hover:shadow-amber-500/10"
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                    <CoinsIcon className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-xl font-extrabold text-amber-400 tracking-tight">
                      {Number(profile?.coins) || 0}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Coins
                    </span>
                  </div>

                  <div className="w-full pt-1 flex justify-center border-t border-white/5">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400/60 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* TESTS CARD (Upcoming) */}
                <div className="relative rounded-2xl p-3 bg-slate-900/40 border border-white/5 backdrop-blur-md flex flex-col items-center justify-between gap-3 opacity-60">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 text-slate-500 border border-white/5">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Tez kunda
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 mt-1">
                      Tests
                    </span>
                  </div>

                  <div className="w-full pt-1 border-t border-white/5" />
                </div>

                {/* HOMEWORKS CARD (Qizil doiracha bilan) */}
                <button
                  onClick={handleOpenHomework}
                  className="group relative rounded-2xl p-3 bg-gradient-to-b from-blue-500/10 via-slate-900/60 to-slate-900/90 border border-blue-500/20 hover:border-blue-500/40 backdrop-blur-xl flex flex-col items-center justify-between gap-3 transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-lg hover:shadow-blue-500/10"
                >
                  {hasHomework && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-bounce">
                      1
                    </span>
                  )}

                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-white mt-1">
                      Vazifalar
                    </span>
                  </div>

                  <div className="w-full pt-1 flex justify-center border-t border-white/5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400/60 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* SHIKOYAT CARD (qizil "!" bildirishnoma bilan) */}
                <button
                  onClick={() => navigate("/student/complaints")}
                  className="group relative rounded-2xl p-3 bg-gradient-to-b from-rose-500/10 via-slate-900/60 to-slate-900/90 border border-rose-500/20 hover:border-rose-500/40 backdrop-blur-xl flex flex-col items-center justify-between gap-3 transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-lg hover:shadow-rose-500/10"
                >
                  {hasComplaint && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-bounce">
                      !
                    </span>
                  )}

                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-white mt-1">
                      Shikoyat
                    </span>
                  </div>

                  <div className="w-full pt-1 flex justify-center border-t border-white/5">
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400/60 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
