import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups } from "./GroupsContext";
import { supabase } from "../supabaseClient";
import { pad2, formatRealTimeDate } from "../utils/formatters";
import AttendanceDatePicker from "../components/AttendanceDatePicker";
import AttendanceStudentRow from "../components/AttendanceStudentRow";
import GradeModal from "../components/modals/GradeModal";
import { ArrowLeft } from "lucide-react";

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

export default function Attendance() {
  const navigate = useNavigate();
  const { groups, loading, getGroup, adjustLessonsCount, adjustCoins } =
    useGroups();

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const today = new Date();
  const realTimeDate = formatRealTimeDate(today);

  const [selectedDate, setSelectedDate] = useState({
    day: today.getDate(),
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  const [savedStatus, setSavedStatus] = useState({});
  const [pendingStatus, setPendingStatus] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [gradeStudent, setGradeStudent] = useState(null);

  // Kalendarda nuqta bilan belgilash uchun: shu oyda davomat kiritilgan kunlar
  const [monthAttendanceDates, setMonthAttendanceDates] = useState(new Set());

  const group = selectedGroupId ? getGroup(selectedGroupId) : null;

  const selectedISO = `${selectedDate.year}-${pad2(selectedDate.month)}-${pad2(
    selectedDate.day,
  )}`;

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

    setSavedStatus(map);
    setPendingStatus({});
    setAttendanceLoading(false);
  }, []);

  // Kalendarda "Belgilangan" nuqtalarini ko'rsatish uchun — shu oyning barcha
  // davomat sanalarini bitta so'rovda olib kelamiz (kun-kun so'ramaymiz)
  const fetchMonthAttendanceDates = useCallback(
    async (groupId, year, month) => {
      const start = `${year}-${pad2(month)}-01`;
      const end = `${year}-${pad2(month)}-${pad2(daysInMonth(month, year))}`;

      const { data, error } = await supabase
        .from("attendance")
        .select("date")
        .eq("group_id", groupId)
        .gte("date", start)
        .lte("date", end);

      if (error) {
        console.error("Oylik davomat sanalarini yuklashda xatolik:", error);
        return;
      }

      setMonthAttendanceDates(new Set((data || []).map((row) => row.date)));
    },
    [],
  );

  useEffect(() => {
    if (selectedGroupId) {
      fetchAttendance(selectedGroupId, selectedISO);
      setExpandedStudentId(null);
    } else {
      setSavedStatus({});
      setPendingStatus({});
    }
  }, [selectedGroupId, selectedISO, fetchAttendance]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMonthAttendanceDates(
        selectedGroupId,
        selectedDate.year,
        selectedDate.month,
      );
    } else {
      setMonthAttendanceDates(new Set());
    }
  }, [
    selectedGroupId,
    selectedDate.year,
    selectedDate.month,
    fetchMonthAttendanceDates,
  ]);

  const toggleExpand = (studentId) => {
    setExpandedStudentId((prev) => (prev === studentId ? null : studentId));
  };

  const chooseStatus = (studentId, status) => {
    setPendingStatus((prev) => ({ ...prev, [studentId]: status }));
    setExpandedStudentId(null);
  };

  const hasPendingChanges = Object.keys(pendingStatus).length > 0;

  const handleSubmit = async () => {
    if (!hasPendingChanges || submitting) return;
    setSubmitting(true);

    const entries = Object.entries(pendingStatus);

    for (const [studentId, status] of entries) {
      const prevStatus = savedStatus[studentId];

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
        continue;
      }

      // "Keldi" deb belgilansa — dars hisoblagichi +1, bekor qilinsa -1
      if (status === "present" && prevStatus !== "present") {
        await adjustLessonsCount(selectedGroupId, studentId, 1);
      } else if (prevStatus === "present" && status !== "present") {
        await adjustLessonsCount(selectedGroupId, studentId, -1);
      }
    }

    setSavedStatus((prev) => ({ ...prev, ...pendingStatus }));
    setPendingStatus({});
    // Shu kun endi "belgilangan" sifatida kalendarda nuqta bilan ko'rinsin
    setMonthAttendanceDates((prev) => new Set(prev).add(selectedISO));
    setSubmitting(false);
  };

  const handleCancel = () => {
    setPendingStatus({});
    setExpandedStudentId(null);
  };

  const handleSaveGrade = (delta) =>
    adjustCoins(selectedGroupId, gradeStudent.id, delta);

  return (
    <div className="relative min-h-screen w-full flex justify-center bg-[#00173d] overflow-hidden">
      {/* Orqa fondagi Liquid Glass doiralari (Glow effect) */}
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10 min-h-screen">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          {selectedGroupId ? (
            <button
              onClick={() => setSelectedGroupId(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}

          <h1 className="text-2xl font-bold text-white text-center flex-1 drop-shadow-sm">
            Attendance
          </h1>

          <span className="text-white/70 text-sm font-medium shrink-0 tabular-nums">
            {realTimeDate}
          </span>
        </div>

        {/* GURUHLAR RO'YXATI */}
        {!selectedGroupId && (
          <>
            {loading && (
              <p className="text-white/60 mt-16 text-center animate-pulse">
                Yuklanmoqda...
              </p>
            )}

            {!loading && groups.length === 0 && (
              <div className="w-full mt-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] px-6 py-10">
                <p className="text-white/80 text-lg font-medium text-center">
                  Guruhlar mavjud emas
                </p>
              </div>
            )}

            {!loading && groups.length > 0 && (
              <div className="w-full mt-2 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-5 flex flex-col gap-3">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-start justify-between gap-3 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-white truncate drop-shadow-sm">
                        {g.name}
                      </p>
                      <p className="text-sm text-white/60 mt-0.5">
                        {g.students.length} o'quvchi
                      </p>
                    </div>
                    <div className="text-right text-sm text-white/60 shrink-0">
                      <p>{g.time || "—"}</p>
                      <p>{g.days || "—"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* GURUH ICHIDAGI DAVOMAT */}
        {selectedGroupId && !group && (
          <div className="w-full mt-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg px-6 py-10">
            <p className="text-white/80 text-lg font-medium text-center">
              Guruh topilmadi
            </p>
          </div>
        )}

        {selectedGroupId && group && (
          <div className="w-full mt-2 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] px-5 py-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-white text-center drop-shadow-sm">
              {group.name}
            </h2>

            <AttendanceDatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              lessonDaysStr={group.days}
              markedDates={monthAttendanceDates}
            />

            {attendanceLoading && (
              <p className="text-white/60 text-center py-4 animate-pulse">
                Yuklanmoqda...
              </p>
            )}

            {!attendanceLoading && group.students.length === 0 && (
              <p className="text-white/60 text-center py-6">
                Bu guruhda o'quvchilar yo'q
              </p>
            )}

            <div className="flex flex-col gap-3">
              {!attendanceLoading &&
                group.students.map((student) => (
                  <AttendanceStudentRow
                    key={student.id}
                    student={student}
                    pending={pendingStatus[student.id]}
                    saved={savedStatus[student.id]}
                    isExpanded={expandedStudentId === student.id}
                    onToggleExpand={toggleExpand}
                    onChooseStatus={chooseStatus}
                    onOpenGradeModal={setGradeStudent}
                  />
                ))}
            </div>

            {!attendanceLoading &&
              group.students.length > 0 &&
              hasPendingChanges && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCancel}
                    disabled={submitting}
                    className="flex-1 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] disabled:opacity-50 text-white text-lg font-semibold py-3.5 border border-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:grayscale text-white text-lg font-semibold py-3.5 shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-200 border border-white/20"
                  >
                    {submitting ? "Saqlanmoqda..." : "Submit"}
                  </button>
                </div>
              )}
          </div>
        )}

        {/* Footer */}
        <p className="mt-auto pt-16 text-center text-xs text-white/50">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>

      {gradeStudent && (
        <GradeModal
          student={gradeStudent}
          onClose={() => setGradeStudent(null)}
          onSave={handleSaveGrade}
        />
      )}
    </div>
  );
}