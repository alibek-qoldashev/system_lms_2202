import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups } from "./GroupsContext";
import { supabase } from "../supabaseClient";
import { pad2, formatRealTimeDate } from "../utils/formatters";
import AttendanceDatePicker from "../components/AttendanceDatePicker";
import AttendanceStudentRow from "../components/AttendanceStudentRow";
import GradeModal from "../components/modals/GradeModal";

export default function Attendance() {
  const navigate = useNavigate();
  const { groups, loading, getGroup, adjustPaymentSum, adjustCoins } =
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

  useEffect(() => {
    if (selectedGroupId) {
      fetchAttendance(selectedGroupId, selectedISO);
      setExpandedStudentId(null);
    } else {
      setSavedStatus({});
      setPendingStatus({});
    }
  }, [selectedGroupId, selectedISO, fetchAttendance]);

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

      const student = group?.students.find((s) => s.id === studentId);
      const lessonPrice = Number(student?.lessonPrice) || 0;

      if (lessonPrice > 0) {
        if (status === "present" && prevStatus !== "present") {
          await adjustPaymentSum(selectedGroupId, studentId, -lessonPrice);
        } else if (prevStatus === "present" && status !== "present") {
          await adjustPaymentSum(selectedGroupId, studentId, lessonPrice);
        }
      }
    }

    setSavedStatus((prev) => ({ ...prev, ...pendingStatus }));
    setPendingStatus({});
    setSubmitting(false);
  };

  const handleSaveGrade = (delta) =>
    adjustCoins(selectedGroupId, gradeStudent.id, delta);

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

        {/* GURUHLAR RO'YXATI */}
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

        {/* GURUH ICHIDAGI DAVOMAT */}
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

            <AttendanceDatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />

            {attendanceLoading && (
              <p className="text-slate-500 text-center py-4">Yuklanmoqda...</p>
            )}

            {!attendanceLoading && group.students.length === 0 && (
              <p className="text-slate-500 text-center py-6">
                Bu guruhda o'quvchilar yo'q
              </p>
            )}

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

            {!attendanceLoading && group.students.length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={!hasPendingChanges || submitting}
                className="w-full mt-2 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 shadow-md transition"
              >
                {submitting ? "Saqlanmoqda..." : "Submit"}
              </button>
            )}
          </div>
        )}

        <p className="mt-auto pt-16 text-center text-sm text-slate-400/80">
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
