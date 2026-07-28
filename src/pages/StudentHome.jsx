import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coins as CoinsIcon, FileText, BookOpen } from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { supabase } from "../supabaseClient";
import { UserCircle } from "lucide-react";

export default function StudentHome() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("coins, name, surname")
        .eq("id", student.id)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    };

    if (student) fetchProfile();
  }, [student]);

  if (!student) return null;

  const cards = [
    {
      key: "coins",
      label: "Coins",
      value: loading ? "…" : Number(profile?.coins) || 0,
      icon: <CoinsIcon className="w-8 h-8 text-yellow-500" strokeWidth={2} />,
      onClick: () => navigate("/student/coins"),
    },
    {
      key: "tests",
      label: "Tests",
      value: "Upcoming...",
      icon: <FileText className="w-8 h-8 text-slate-400" strokeWidth={2} />,
      onClick: null,
    },
    {
      key: "homeworks",
      label: "Homeworks",
      value: "Upcoming...",
      icon: <BookOpen className="w-8 h-8 text-slate-400" strokeWidth={2} />,
      onClick: null,
    },
  ];

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        <div className="w-full flex items-center justify-between mb-8">
          <span className="w-14" />
          <h1 className="text-2xl font-bold text-white text-center flex-1">
            My Page
          </h1>
          <button
            onClick={() => navigate("/student/settings")}
            aria-label="Account"
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shrink-0 transition"
          >
            <UserCircle className="w-5 h-5 text-slate-700" strokeWidth={2} />
          </button>
        </div>

        {loading && <p className="text-slate-300">Yuklanmoqda...</p>}

        {!loading && profile && (
          <>
            <h2 className="text-xl font-bold text-white text-center mb-6">
              {profile.name} {profile.surname}
            </h2>

            <div className="w-full grid grid-cols-3 gap-4">
              {cards.map((card) => (
                <button
                  key={card.key}
                  onClick={card.onClick || undefined}
                  disabled={!card.onClick}
                  className="aspect-square rounded-2xl bg-white/90 backdrop-blur-md shadow-md flex flex-col items-center justify-center gap-2 px-2 disabled:cursor-default hover:enabled:bg-white active:enabled:scale-95 transition"
                >
                  {card.icon}
                  <span className="text-lg font-bold text-slate-900">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 text-center leading-tight">
                    {card.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
