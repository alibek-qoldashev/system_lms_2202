import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useGroups } from "./GroupsContext";

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

  // Qidiruv bo'lsa — ism bo'yicha. Qidiruv bo'sh bo'lsa — faqat balansi 0 va qarzdorlar
  const filteredStudents = useMemo(() => {
    if (!term) {
      return allStudents.filter((s) => (Number(s.paymentSum) || 0) <= 0);
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

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-12 pb-10">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-white font-semibold flex items-center gap-1 hover:opacity-80 transition"
          >
            ← Home
          </button>
          <h1 className="text-2xl font-bold text-white text-center flex-1">
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
            className="w-full rounded-full bg-white px-5 py-3 pr-12 text-slate-800 placeholder-slate-400 outline-none shadow-sm"
          />
          <Search className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Content list */}
        {loading && (
          <p className="text-slate-300 mt-8 text-center">Yuklanmoqda...</p>
        )}

        {!loading && term && filteredStudents.length === 0 && (
          <div className="w-full rounded-3xl bg-white shadow-sm px-6 py-12">
            <p className="text-red-500 text-xl font-bold text-center">
              Student not found
            </p>
          </div>
        )}

        {!loading && !term && filteredStudents.length === 0 && (
          <div className="w-full rounded-3xl bg-white shadow-sm px-6 py-12">
            <p className="text-slate-600 text-xl font-bold text-center">
              no money today
            </p>
          </div>
        )}

        {!loading && filteredStudents.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            {filteredStudents.map((s) => {
              const balance = Number(s.paymentSum) || 0;
              let bgClass = "bg-[#85ff8f]"; // Yashil
              let textClass = "text-slate-900";

              if (balance < 0) {
                bgClass = "bg-[#ffbaba]"; // Qizil/Pushti
                textClass = "text-red-700";
              } else if (balance === 0) {
                bgClass = "bg-[#fff29d]"; // Sariq
                textClass = "text-slate-900";
              }

              return (
                <button
                  key={s.id}
                  onClick={() => openStudent(s)}
                  className={`w-full text-left rounded-full px-6 py-4 flex items-center justify-between gap-3 shadow-sm hover:opacity-90 transition ${bgClass}`}
                >
                  <span className="font-semibold text-slate-900 truncate">
                    {s.name} {s.surname}
                  </span>
                  <span className={`font-bold shrink-0 ${textClass}`}>
                    {balance > 0 ? "+" : ""}
                    {formatSum(balance)} so'm
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-auto pt-16 text-center text-xs text-slate-400/80">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>

      {/* Payment Modal */}
      {currentStudentData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 relative shadow-xl">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition"
              aria-label="Yopish"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
              {currentStudentData.name} {currentStudentData.surname}
            </h2>

            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between gap-3 mb-6 border border-slate-100">
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Enter sum"
                className="w-28 min-w-0 bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
              <button
                onClick={handlePay}
                disabled={paying || !payAmount}
                className="rounded-lg bg-[#00a2ff] hover:bg-blue-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 transition shrink-0"
              >
                {paying ? "..." : "PAY"}
              </button>
              <div className="text-right text-[11px] text-slate-400 shrink-0">
                <p className="font-medium text-slate-500">Today</p>
                <p>{formatDMY(todayISO())}</p>
              </div>
            </div>

            <h3 className="font-semibold text-slate-800 mb-3 text-sm">
              Payment history
            </h3>

            {history.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs">To'lovlar tarixi yo'q</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((h, i) => (
                  <div
                    key={h.id || i}
                    className="flex items-center justify-between bg-slate-100/80 rounded-xl px-4 py-2.5 text-xs font-medium"
                  >
                    <span className="text-slate-500">{formatDMY(h.date)}</span>
                    <span className="font-semibold text-slate-900">
                      +{formatSum(h.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
