import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { GroupsContext } from "./GroupsContext";

const Attendance = () => {
  // Context dan guruhlar ro'yxatini olamiz (agar GroupsContext mavjud bo'lsa)
  const context = useContext(GroupsContext);
  const groups = context?.groups || [];

  // Tanlangan guruh va talabalar davomati holatlari
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [attendance, setAttendance] = useState({});

  // Bugungi jonli sana: dd/mm/yyyy
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}/${today.getFullYear()}`;

  // Qisqa sana (dd/mm)
  const shortDate = `${String(today.getDate()).padStart(2, "0")}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  // Davomatni belgilash funksiyasi (true = kelgan, false = kelmagan)
  const handleAttendance = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  return (
    <div className="min-h-screen bg-[#001938] text-white flex flex-col justify-between p-4 font-sans max-w-md mx-auto">
      {/* 1-HOLAT: GURUHLAR RO'YXATI (SELECTION VIEW) */}
      {!selectedGroup ? (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between my-6 px-2">
            <Link
              to="/home"
              className="flex items-center gap-1 text-white font-medium hover:opacity-80"
            >
              <span>←</span> Home
            </Link>
            <h1 className="text-2xl font-bold text-center">Attendance</h1>
            <div className="w-12"></div> {/* Equalizer spacer */}
          </div>

          {/* Oq Kartochka Konteyneri */}
          <div className="bg-[#f0f0f0] text-slate-900 rounded-3xl p-4 min-h-[520px] flex flex-col gap-4 shadow-lg">
            {groups.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-medium text-center">
                Guruhlar mavjud emas
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id || group.name}
                  onClick={() => setSelectedGroup(group)}
                  className="border-2 border-slate-800 rounded-2xl p-4 cursor-pointer hover:bg-slate-200 transition-all flex justify-between items-start"
                >
                  <div className="flex flex-col justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                      {group.name || "Group name"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-4">
                      {group.paymentStudent || "Name of students for Payment"}
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-500 space-y-1">
                    <p>{group.time || "Lesson time"}</p>
                    <p>{group.days || "Lesson days"}</p>
                    <p>{group.studentsCount || "Num. of students"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* 2-HOLAT: DAVOMAT QILISH (STUDENTS LIST VIEW) */
        <div>
          {/* Header */}
          <div className="flex items-center justify-between my-6 px-2">
            <button
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-1 text-white font-medium hover:opacity-80"
            >
              <span>←</span> Groups
            </button>
            <h1 className="text-2xl font-bold text-center">Attendance</h1>
            <span className="text-xs text-slate-300 font-medium">
              {formattedDate}
            </span>
          </div>

          {/* Oq Kartochka Konteyneri */}
          <div className="bg-[#f0f0f0] text-slate-900 rounded-3xl p-4 min-h-[520px] flex flex-col gap-3 shadow-lg">
            <h2 className="text-2xl font-bold text-center my-2">
              {selectedGroup.name || "Group name"}
            </h2>

            {/* Talabalar ro'yxati */}
            {(!selectedGroup.students || selectedGroup.students.length === 0) ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-medium text-center">
                Ushbu guruhda talabalar yo'q
              </div>
            ) : (
              selectedGroup.students.map((student, index) => {
                const studentId = student.id || index;
                const status = attendance[studentId];

                return (
                  <div
                    key={studentId}
                    className="relative border-2 border-slate-800 rounded-xl p-3 flex items-center justify-between bg-transparent"
                  >
                    <span className="font-semibold text-slate-800">
                      {student.name || "Name Surname"}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="bg-slate-300 text-slate-700 text-xs px-2 py-1 rounded">
                        {shortDate}
                      </span>
                      <div className="w-8 h-6 border border-slate-400 rounded bg-white"></div>
                    </div>

                    {/* Keldi-Ketdi tugmalari (Pastki o'ng burchak overlay) */}
                    <div className="absolute -bottom-3 right-4 flex items-center gap-1 bg-[#f0f0f0] px-1 rounded-full">
                      <button
                        onClick={() => handleAttendance(studentId, true)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white transition-transform active:scale-95 ${
                          status === true
                            ? "bg-green-600 scale-110"
                            : "bg-green-500 opacity-70 hover:opacity-100"
                        }`}
                      >
                        ✓
                      </button>
                      <span className="text-slate-400 text-xs">–</span>
                      <button
                        onClick={() => handleAttendance(studentId, false)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white transition-transform active:scale-95 ${
                          status === false
                            ? "bg-red-600 scale-110"
                            : "bg-red-500 opacity-70 hover:opacity-100"
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Footer Copyright */}
      <footer className="text-center text-[10px] text-slate-400 my-4 leading-tight">
        <p>Copyright © 2026</p>
        <p>by Qo'ldoshev Alibek</p>
      </footer>
    </div>
  );
};

export default Attendance;