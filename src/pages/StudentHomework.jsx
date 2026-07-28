import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";
import { supabase } from "../supabaseClient";

export default function StudentHomework() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();

  // 1. STATE-LAR BIRINCHI BO'LIB E'LON QILINISHI SHART!
  const [homework, setHomework] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Vazifani bazadan tortib kelish
  useEffect(() => {
    const fetchHomework = async () => {
      if (!student?.id) return;

      // O'quvchining group_id sini topamiz
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("group_id")
        .eq("id", student.id)
        .single();

      if (studentError || !studentData?.group_id) {
        setLoading(false);
        return;
      }

      // O'sha guruhga berilgan eng oxirgi vazifani olib kelamiz
      const { data: hwData, error: hwError } = await supabase
        .from("homeworks")
        .select("*")
        .eq("group_id", studentData.group_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!hwError && hwData) {
        setHomework(hwData);
      }
      setLoading(false);
    };

    fetchHomework();
  }, [student]);

  // 3. Sahifaga kirilganda localStorage ga o'qilgan deb belgilash
  useEffect(() => {
    if (homework && student?.id) {
      localStorage.setItem(`viewed_hw_${student.id}`, String(homework.id));
    }
  }, [homework, student]);

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col px-5 pt-8 pb-10 z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/studenthome")}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" /> Uy Vazifasi
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : homework ? (
          <div className="w-full relative bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 p-5 rounded-3xl backdrop-blur-lg shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-white font-bold text-lg">Yangi Vazifa</h2>
            </div>

            <p className="text-blue-100/90 text-sm leading-relaxed whitespace-pre-wrap mb-4">
              {homework.text}
            </p>

            <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/50">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Berilgan sana: {new Date(homework.created_at).toLocaleDateString("uz-UZ")}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            Hozircha guruh uchun uy vazifalari mavjud emas.
          </div>
        )}
      </div>
    </div>
  );
}