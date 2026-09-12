import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Group from "./pages/Group";
import GroupDetail from "./pages/GroupDetail";
import Attendance from "./pages/Attendance";
import { GroupsProvider } from "./pages/GroupsContext";
import Payment from "./pages/Payment";
import { StudentAuthProvider } from "./context/StudentAuthContext";
import StudentHome from "./pages/StudentHome";
import RequireStudentAuth from "./components/RequireStudentAuth";
import StudentSettings from "./pages/StudentSettings";
import StudentCoins from "./pages/Studentcoins";
import { TestsProvider } from "./pages/TestsContext";
import Tests from "./pages/Tests";
import CardQuestions from "./pages/CardQuestions";
import Settings from "./pages/Settings";
import { supabase } from "./supabaseClient";
import Complaints from "./pages/Complaints";
import StudentComplaints from "./pages/StudentComplaints";
import UseCoins from "./pages/UseCoins";
import Homeworks from "./pages/Homeworks";
import StudentHomework from "./pages/StudentHomework";

// Yangi qo'shilgan sahifa
import Devices from "./pages/Devices";

// Qurilma chiqarilgan bo'lsa qancha vaqtda bir tekshirib turish (millisekund).
// Kichikroq qiymat — chiqarilgach tezroq ta'sir qiladi, lekin ko'proq so'rov yuboradi.
const DEVICE_CHECK_INTERVAL_MS = 20000;

function isAuthenticated() {
  return sessionStorage.getItem("isAuthenticated") === "true";
}

function LoginRoute() {
  return isAuthenticated() ? <Navigate to="/home" replace /> : <LoginPage />;
}

// Teacher uchun himoyalangan sahifalar.
// Endi faqat "isAuthenticated" flagini emas, balki shu qurilmaning
// "teacher_devices" jadvalida hali ham mavjudligini ham tekshiradi —
// shu orqali Devices sahifasidan "Chiqarish" bosilgan qurilma
// haqiqatan ham avtomatik tashqariga chiqarib yuboriladi.
function RequireAuth({ children }) {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!isAuthenticated()) {
        if (!cancelled) setStatus("denied");
        return;
      }

      const token = localStorage.getItem("teacher_device_token");

      // Token hali yaratilmagan bo'lsa (juda eski sessiya) — bloklamaymiz,
      // keyingi login qilganda token yaratiladi.
      if (!token) {
        if (!cancelled) setStatus("ok");
        return;
      }

      const { data, error } = await supabase
        .from("teacher_devices")
        .select("id")
        .eq("device_token", token)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        // Tarmoq/server xatosi bo'lsa, foydalanuvchini bexosdan chiqarib yubormaymiz
        console.error("Qurilmani tekshirishda xatolik:", error);
        setStatus((prev) => (prev === "checking" ? "ok" : prev));
        return;
      }

      if (!data) {
        // Bu qurilma "teacher_devices" jadvalidan o'chirilgan —
        // demak kimdir uni Devices sahifasidan chiqarib yuborgan.
        sessionStorage.removeItem("isAuthenticated");
        setStatus("denied");
        return;
      }

      setStatus("ok");
    };

    verify();
    const intervalId = setInterval(verify, DEVICE_CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#00173d]">
        <p className="text-slate-300">Yuklanmoqda...</p>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;
}

const App = () => {
  return (
    <StudentAuthProvider>
      <TestsProvider>
        <GroupsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginRoute />} />

              <Route
                path="/home"
                element={
                  <RequireAuth>
                    <Home />
                  </RequireAuth>
                }
              />
              <Route path="/complaints" element={<Complaints />} />
              <Route
                path="/student/complaints"
                element={
                  <RequireStudentAuth>
                    <StudentComplaints />
                  </RequireStudentAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                }
              />
              <Route
                path="/devices"
                element={
                  <RequireAuth>
                    <Devices />
                  </RequireAuth>
                }
              />
              <Route
                path="/student/use-coins"
                element={
                  <RequireStudentAuth>
                    <UseCoins />
                  </RequireStudentAuth>
                }
              />
              <Route path="/homeworks" element={<Homeworks />} />
              <Route path="/student/homework" element={<StudentHomework />} />
              <Route
                path="/login"
                element={
                  <RequireAuth>
                    <LoginPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/student/coins"
                element={
                  <RequireStudentAuth>
                    <StudentCoins />
                  </RequireStudentAuth>
                }
              />
              <Route
                path="/student/settings"
                element={
                  <RequireStudentAuth>
                    <StudentSettings />
                  </RequireStudentAuth>
                }
              />

              <Route
                path="/studenthome"
                element={
                  <RequireStudentAuth>
                    <StudentHome />
                  </RequireStudentAuth>
                }
              />

              <Route
                path="/groups"
                element={
                  <RequireAuth>
                    <Group />
                  </RequireAuth>
                }
              />
              <Route
                path="/groups/:id"
                element={
                  <RequireAuth>
                    <GroupDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/attendance"
                element={
                  <RequireAuth>
                    <Attendance />
                  </RequireAuth>
                }
              />
              <Route
                path="/payment"
                element={
                  <RequireAuth>
                    <Payment />
                  </RequireAuth>
                }
              />
              <Route
                path="/tests"
                element={
                  <RequireAuth>
                    <Tests />
                  </RequireAuth>
                }
              />
              <Route
                path="/tests/card/:cardId"
                element={
                  <RequireAuth>
                    <CardQuestions />
                  </RequireAuth>
                }
              />
            </Routes>
          </BrowserRouter>
        </GroupsProvider>
      </TestsProvider>
    </StudentAuthProvider>
  );
};

export default App;
