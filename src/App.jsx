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
import { TestsProvider } from "./pages/TestsContext";
import Tests from "./pages/Tests";
import CardQuestions from "./pages/CardQuestions";
import Settings from "./pages/Settings";

import UseCoins from "./pages/UseCoins";
import Homeworks from "./pages/Homeworks";
import StudentHomework from "./pages/StudentHomework";

// Yangi qo'shilgan sahifa
import Devices from "./pages/Devices";

function isAuthenticated() {
  return sessionStorage.getItem("isAuthenticated") === "true";
}

function LoginRoute() {
  return isAuthenticated() ? <Navigate to="/home" replace /> : <LoginPage />;
}

function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
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
