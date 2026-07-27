import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { useGroups } from "./GroupsContext";
import { supabase } from "../supabaseClient";

// Sistema shu oydan (iyul 2026) ochilgan, shundan oldingi sanalar mavjud emas.
// Maksimal tanlash mumkin bo'lgan yil - 2028.
const MIN_YEAR = 2026;
const MIN_MONTH = 7; // Iyul
const MAX_YEAR = 2028;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatRealTimeDate(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export default function Attendance() {
  const navigate = useNavigate();
  const { groups, loading, getGroup, adjustPaymentSum } = useGroups();

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const today = new Date();
  const realTimeDate = formatRealTimeDate(today);

  // Davomat belgilanadigan sana (kun/oy/yil) — default: bugungi sana
  const [selectedDate, setSelectedDate] = useState({
    day: today.getDate(),
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  const [attendance, setAttendance] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  // Har bir talaba uchun saqlanish holati — tez-tez bosilganda davomat/balansning
  // ikki marta yozilib ketishining (race condition) oldini olish uchun.
  const [savingStudentId, setSavingStudentId] = useState(null);

  const group = selectedGroupId ? getGroup(selectedGroupId) : null;

  const yearOptions = useMemo(() => {
    const arr = [];
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) arr.push(y);
    return arr;
  }, []);

  const monthOptions = useMemo(() => {
    if (selectedDate.year === MIN_YEAR) {
      const arr = [];
      for (let m = MIN_MONTH; m <= 12; m++) arr.push(m);
      return arr;
    }
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, [selectedDate.year]);

  const dayOptions = useMemo(() => {
    const total = daysInMonth(selectedDate.month, selectedDate.year);
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [selectedDate.month, selectedDate.year]);

  const selectedISO = `${selectedDate.year}-${pad2(selectedDate.month)}-${pad2(
    selectedDate.day,
  )}`;

  const handleYearChange = (value) => {
    const year = Number(value);
    let month = selectedDate.month;
    if (year === MIN_YEAR && month < MIN_MONTH) month = MIN_MONTH;
    const maxDay = daysInMonth(month, year);
    const day = Math.min(selectedDate.day, maxDay);
    setSelectedDate({ day, month, year });
  };

  const handleMonthChange = (value) => {
    const month = Number(value);
    const maxDay = daysInMonth(month, selectedDate.year);
    const day = Math.min(selectedDate.day, maxDay);
    setSelectedDate({ ...selectedDate, month, day });
  };

  const handleDayChange = (value) => {
    setSelectedDate({ ...selectedDate, day: Number(value) });
  };

  const fetchAttendance = useCallback(async (groupId, dateISO) => {
    setAttendanceLoading(true);

    const { data, error } = await supabase
      .from("attendance")
      .select("student_id, status")
      .eq("group_id", groupId)
      .eq("date", dateISO);

    if (error) {
      console.error("Davomatni yuklashda xatolik:", error);
      setAttendanceLoading(false);
      return;
    }

    const map = {};
    (data || []).forEach((row) => {
      map[row.student_id] = row.status;
    });

    setAttendance(map);
    setAttendanceLoading(false);
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchAttendance(selectedGroupId, selectedISO);
      setExpandedStudentId(null);
    } else {
      setAttendance({});
    }
  }, [selectedGroupId, selectedISO, fetchAttendance]);

  const markAttendance = async (studentId, status) => {
    // Bir xil talaba uchun oldingi so'rov hali tugamagan bo'lsa, kutamiz —
    // aks holda balans ikki marta o'zgarib ketishi mumkin edi.
    if (savingStudentId === studentId) return;

    const prevStatus = attendance[studentId];
    setSavingStudentId(studentId);
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setExpandedStudentId(null);

    const { error } = await supabase.from("attendance").upsert(
      {
        student_id: studentId,
        group_id: selectedGroupId,
        date: selectedISO,
        status,
      },
      { onConflict: "student_id,date" },
    );

    if (error) {
      console.error("Davomatni saqlashda xatolik:", error);
      // Saqlanmasa, oldingi holatga qaytaramiz
      setAttendance((prev) => ({ ...prev, [studentId]: prevStatus }));
      setSavingStudentId(null);
      return;
    }

    // Balansni davomatga qarab o'zgartirish
    const student = group?.students.find((s) => s.id === studentId);
    const lessonPrice = Number(student?.lessonPrice) || 0;

    if (lessonPrice > 0) {
      if (status === "present" && prevStatus !== "present") {
        await adjustPaymentSum(selectedGroupId, studentId, -lessonPrice);
      } else if (prevStatus === "present" && status !== "present") {
        await adjustPaymentSum(selectedGroupId, studentId, lessonPrice);
      }
    }

    setSavingStudentId(null);
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          {selectedGroupId ? (
            <button
              onClick={() => setSelectedGroupId(null)}
              className="text-slate-200 font-semibold shrink-0"
            >
              ← Groups
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="text-slate-200 font-semibold shrink-0"
            >
              ← Home
            </button>
          )}

          <h1 className="text-2xl font-bold text-white text-center flex-1">
            Attendance
          </h1>

          <span className="text-slate-300 text-sm font-medium shrink-0 tabular-nums">
            {realTimeDate}
          </span>
        </div>

        {/* ---------- GURUHLAR RO'YXATI ---------- */}
        {!selectedGroupId && (
          <>
            {loading && (
              <p className="text-slate-300 mt-16 text-center">Yuklanmoqda...</p>
            )}

            {!loading && groups.length === 0 && (
              <div className="w-full mt-16 rounded-3xl bg-white/90 backdrop-blur-sm shadow-sm px-6 py-10">
                <p className="text-slate-600 text-lg font-semibold text-center">
                  Guruhlar mavjud emas
                </p>
              </div>
            )}

            {!loading && groups.length > 0 && (
              <div className="w-full mt-2 rounded-3xl bg-white/90 backdrop-blur-sm shadow-sm px-4 py-4 flex flex-col gap-4">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className="w-full text-left rounded-2xl border border-slate-800 bg-slate-100/80 px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-200/80 active:bg-slate-200 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-slate-900 truncate">
                        {g.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {g.students.length} o'quvchi
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-500 shrink-0">
                      <p>{g.time || "—"}</p>
                      <p>{g.days || "—"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- GURUH ICHIDAGI DAVOMAT ---------- */}
        {selectedGroupId && !group && (
          <div className="w-full mt-16 rounded-3xl bg-white/90 backdrop-blur-sm shadow-sm px-6 py-10">
            <p className="text-slate-600 text-lg font-semibold text-center">
              Guruh topilmadi
            </p>
          </div>
        )}

        {selectedGroupId && group && (
          <div className="w-full mt-2 rounded-3xl bg-white/90 backdrop-blur-sm shadow-sm px-5 py-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-900 text-center">
              {group.name}
            </h2>

            {/* Sana tanlash: kun / oy / yil */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <select
                value={selectedDate.day}
                onChange={(e) => handleDayChange(e.target.value)}
                className="rounded-full bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 outline-none cursor-pointer"
              >
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedDate.month}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="rounded-full bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 outline-none cursor-pointer"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {MONTH_NAMES[m - 1]}
                  </option>
                ))}
              </select>

              <select
                value={selectedDate.year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="rounded-full bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {attendanceLoading && (
              <p className="text-slate-500 text-center py-4">Yuklanmoqda...</p>
            )}

            {!attendanceLoading && group.students.length === 0 && (
              <p className="text-slate-500 text-center py-6">
                Bu guruhda o'quvchilar yo'q
              </p>
            )}

            {!attendanceLoading &&
              group.students.map((student) => {
                const status = attendance[student.id];
                const isExpanded = expandedStudentId === student.id;
                const isSaving = savingStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className="rounded-2xl border border-slate-800 bg-slate-100/80 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900 truncate uppercase">
                        {student.name} {student.surname}
                      </span>

                      <button
                        onClick={() =>
                          setExpandedStudentId(isExpanded ? null : student.id)
                        }
                        disabled={isSaving}
                        aria-label="Davomatni belgilash"
                        className={`w-7 h-7 rounded-full border-2 shrink-0 transition disabled:opacity-60 ${
                          status === "present"
                            ? "bg-green-500 border-green-500"
                            : status === "absent"
                              ? "bg-red-500 border-red-500"
                              : "bg-slate-200 border-slate-300 hover:border-slate-400"
                        }`}
                      />
                    </div>

                    {isExpanded && (
                      <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-300/70">
                        <button
                          onClick={() => markAttendance(student.id, "present")}
                          disabled={isSaving}
                          aria-label="Keldi"
                          className="w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-60 flex items-center justify-center transition"
                        >
                          <Check
                            className="w-5 h-5 text-white"
                            strokeWidth={3}
                          />
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, "absent")}
                          disabled={isSaving}
                          aria-label="Kelmadi"
                          className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-60 flex items-center justify-center transition"
                        >
                          <X className="w-5 h-5 text-white" strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        <p className="mt-auto pt-16 text-center text-sm text-slate-400/80">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>
    </div>
  );
}
