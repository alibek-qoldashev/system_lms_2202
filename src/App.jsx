import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Group from "./pages/Group";
import GroupDetail from "./pages/GroupDetail";
import Attendance from "./pages/Attendance"; 
import { GroupsProvider } from "./pages/GroupsContext";

function isAuthenticated() {
  return localStorage.getItem("isAuthenticated") === "true";
}

// Login sahifasi: agar allaqachon login qilingan bo'lsa, to'g'ridan-to'g'ri Home'ga o'tkazadi
function LoginRoute() {
  return isAuthenticated() ? <Navigate to="/home" replace /> : <LoginPage />;
}

// Himoyalangan sahifalar: login qilinmagan bo'lsa, "/" ga qaytaradi
function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
}

const App = () => {
  return (
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
          {/* Davomat sahifasi uchun rout */}
          <Route
            path="/attendance"
            element={
              <RequireAuth>
                <Attendance />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </GroupsProvider>
  );
};

export default App;
