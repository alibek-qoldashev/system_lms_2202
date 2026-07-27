import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { useGroups } from "./GroupsContext";
import { supabase } from "../supabaseClient";

function formatDisplayDate(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatISODate(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

export default function Attendance() {
  const navigate = useNavigate();
  const { groups, loading, getGroup } = useGroups();

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const today = new Date();
  const todayDisplay = formatDisplayDate(today);
  const todayISO = formatISODate(today);

  const group = selectedGroupId ? getGroup(selectedGroupId) : null;

  const fetchAttendance = useCallback(async (groupId) => {
    setAttendanceLoading(true);

    const { data, error } = await supabase
      .from("attendance")
      .select("student_id, status")
      .eq("group_id", groupId)
      .eq("date", todayISO);

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
  }, [todayISO]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchAttendance(selectedGroupId);
    } else {
      setAttendance({});
    }
  }, [selectedGroupId, fetchAttendance]);

  const markAttendance = async (studentId, status) => {
    setSavingId(studentId);

    // UI'ni darhol yangilaymiz
    setAttendance((prev) => ({ ...prev, [studentId]: status }));

    const { error } = await supabase.from("attendance").upsert(
      {
        student_id: studentId,
        group_id: selectedGroupId,
        date: todayISO,
        status,
      },
      { onConflict: "student_id,date" }
    );

    if (error) {
      console.error("Davomatni saqlashda xatolik:", error);
    }

    setSavingId(null);
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

          {selectedGroupId ? (
            <span className="text-slate-300 text-sm font-medium shrink-0 tabular-nums">
              {todayDisplay}
            </span>
          ) : (
            <span className="w-14 shrink-0" />
          )}
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
            <h2 className="text-xl font-bold text-slate-900 text-center mb-1">
              {group.name}
            </h2>

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
                return (
                  <div
                    key={student.id}
                    className="rounded-2xl border border-slate-800 bg-slate-100/80 px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <span className="font-semibold text-slate-900 truncate uppercase">
                      {student.name} {student.surname}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => markAttendance(student.id, "present")}
                        disabled={savingId === student.id}
                        aria-label="Keldi"
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-50 ${
                          status === "present"
                            ? "bg-green-500"
                            : "bg-green-100 hover:bg-green-200"
                        }`}
                      >
                        <Check
                          className={`w-5 h-5 ${
                            status === "present"
                              ? "text-white"
                              : "text-green-600"
                          }`}
                          strokeWidth={3}
                        />
                      </button>

                      <button
                        onClick={() => markAttendance(student.id, "absent")}
                        disabled={savingId === student.id}
                        aria-label="Kelmadi"
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-50 ${
                          status === "absent"
                            ? "bg-red-500"
                            : "bg-red-100 hover:bg-red-200"
                        }`}
                      >
                        <X
                          className={`w-5 h-5 ${
                            status === "absent" ? "text-white" : "text-red-600"
                          }`}
                          strokeWidth={3}
                        />
                      </button>
                    </div>
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