import React from "react";
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

import UseCoins from "./pages/UseCoins";

function isAuthenticated() {
  return localStorage.getItem("isAuthenticated") === "true";
}

// Login sahifasi: agar allaqachon teacher sifatida login qilingan bo'lsa, Home'ga o'tkazadi
function LoginRoute() {
  return isAuthenticated() ? <Navigate to="/home" replace /> : <LoginPage />;
}

// Teacher uchun himoyalangan sahifalar
function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
}

const App = () => {
  return (
    <StudentAuthProvider>
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
            <Route
              path="/student/use-coins"
              element={
                <RequireStudentAuth>
                  <UseCoins />
                </RequireStudentAuth>
              }
            />
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

            {/* Student sahifasi — RequireAuth emas, RequireStudentAuth bilan himoyalanadi */}
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
          </Routes>
        </BrowserRouter>
      </GroupsProvider>
    </StudentAuthProvider>
  );
};

export default App;
