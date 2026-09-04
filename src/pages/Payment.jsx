import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { useGroups } from "./GroupsContext";

const LESSONS_PER_CYCLE = 12;
const WARNING_AT = 2; // shu qadar dars qolganda "sariq" (ogohlantirish)

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDMY(isoDate) {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

function formatSum(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("en-US").replace(/,/g, " ");
}

// Dars soni asosida holatni aniqlaydi: "due" (to'lov kerak), "warning" (ogohlantirish), "ok"
function getPaymentStatus(lessonsSincePayment) {
  const count = Number(lessonsSincePayment) || 0;
  if (count >= LESSONS_PER_CYCLE) return "due";
  if (count >= LESSONS_PER_CYCLE - WARNING_AT) return "warning";
  return "ok";
}

export default function Payment() {
  const navigate = useNavigate();
  const { groups, loading, addPayment } = useGroups();

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  // Butun guruhlar bo'ylab o'quvchilarni yig'ib olish
  const allStudents = useMemo(
    () =>
      groups.flatMap((g) =>
        (g.students || []).map((s) => ({
          ...s,
          groupId: g.id,
          groupName: g.name,
        })),
      ),
    [groups],
  );

  const term = search.trim().toLowerCase();

  // Qidiruv bo'lsa — ism bo'yicha, hammasi ko'rinadi.
  // Qidiruv bo'sh bo'lsa — faqat e'tibor talab qiladiganlar (to'lov kerak yoki yaqin)
  const filteredStudents = useMemo(() => {
    if (!term) {
      return allStudents.filter(
        (s) => getPaymentStatus(s.lessonsSincePayment) !== "ok",
      );
    }
    return allStudents.filter((s) =>
      `${s.name} ${s.surname}`.toLowerCase().includes(term),
    );
  }, [allStudents, term]);

  // Modal tanlangan o'quvchi ma'lumotlarini dynamic ushlab turish
  const currentStudentData = useMemo(() => {
    if (!selectedStudent) return null;
    return (
      allStudents.find((s) => s.id === selectedStudent.id) || selectedStudent
    );
  }, [allStudents, selectedStudent]);

  const openStudent = (student) => {
    setSelectedStudent(student);
    setPayAmount("");
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setPayAmount("");
  };

  const handlePay = async () => {
    if (!currentStudentData || !payAmount) return;
    setPaying(true);

    const res = await addPayment(
      currentStudentData.groupId,
      currentStudentData.id,
      payAmount,
    );

    setPaying(false);

    if (res?.error) {
      alert("To'lov saqlashda xatolik: " + res.error);
      return;
    }

    setPayAmount("");
  };

  // Oxirgi 3 ta to'lov tarixi
  const history = useMemo(() => {
    if (!currentStudentData || !currentStudentData.paymentHistory) return [];
    return currentStudentData.paymentHistory.slice(0, 3);
  }, [currentStudentData]);

  const currentLessons = Number(currentStudentData?.lessonsSincePayment) || 0;
  const currentStatus = getPaymentStatus(currentLessons);

  return (
    <div className="relative min-h-screen w-full flex justify-center bg-[#00173d] overflow-hidden">
      {/* Orqa fondagi Liquid Glass doiralari (Glow effect) */}
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 pt-12 pb-10 min-h-screen">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white text-center flex-1 drop-shadow-sm">
            Payment
          </h1>
          <span className="w-14" />
        </div>

        {/* Search Bar */}
        <div className="w-full relative mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl px-5 py-3.5 pr-12 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
          />
          <Search className="w-5 h-5 text-white/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Content list */}
        {loading && (
          <p className="text-white/60 mt-8 text-center animate-pulse">
            Yuklanmoqda...
          </p>
        )}

        {!loading && term && filteredStudents.length === 0 && (
          <div className="w-full rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] px-6 py-12">
            <p className="text-rose-400 text-xl font-bold text-center">
              Student not found
            </p>
          </div>
        )}

        {!loading && !term && filteredStudents.length === 0 && (
          <div className="w-full rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] px-6 py-12">
            <p className="text-white/70 text-xl font-bold text-center">
              Hammasi joyida — to'lov kutilmayapti
            </p>
          </div>
        )}

        {!loading && filteredStudents.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            {filteredStudents.map((s) => {
              const status = getPaymentStatus(s.lessonsSincePayment);
              let badgeStyle = "bg-white/5 border-white/15 text-white/70"; // neutral (faqat qidiruvda ko'rinadi)
              let label = `${Number(s.lessonsSincePayment) || 0}/${LESSONS_PER_CYCLE} dars`;

              if (status === "due") {
                badgeStyle = "bg-rose-500/20 border-rose-400/30 text-rose-300";
                label = "To'lov kerak";
              } else if (status === "warning") {
                const left =
                  LESSONS_PER_CYCLE - (Number(s.lessonsSincePayment) || 0);
                badgeStyle =
                  "bg-amber-500/20 border-amber-400/30 text-amber-300";
                label = `${left} dars qoldi`;
              }

              return (
                <button
                  key={s.id}
                  onClick={() => openStudent(s)}
                  className={`w-full text-left rounded-2xl border px-5 py-4 flex items-center justify-between gap-3 backdrop-blur-xl shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] ${badgeStyle}`}
                >
                  <span className="font-semibold text-white truncate drop-shadow-sm">
                    {s.name} {s.surname}
                  </span>
                  <span className="font-bold shrink-0 drop-shadow-sm text-sm">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p className="mt-auto pt-16 text-center text-xs text-white/50">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>

      {/* Payment Modal */}
      {/* Payment Modal */}
      {currentStudentData && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center px-6 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#0b1b36]/90 border border-white/20 backdrop-blur-2xl rounded-3xl p-6 relative shadow-[0_16px_48px_rgba(0,0,0,0.5)] text-white"
          >
            {/* X tugmasiga z-10 va type="button" qo'shildi */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-5 right-5 z-10 text-white/50 hover:text-white transition cursor-pointer"
              aria-label="Yopish"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-white text-center mb-2 drop-shadow-sm">
              {currentStudentData.name} {currentStudentData.surname}
            </h2>

            {/* Qolgan modal kodi o'zgarishsiz qoladi... */}
          </div>
        </div>
      )}
    </div>
  );
}
