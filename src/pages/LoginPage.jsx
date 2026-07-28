import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";

const TEACHER_USERNAME = "Viloyat";
const TEACHER_PASSWORD = "2202";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login: studentLogin } = useStudentAuth();

  const handleNext = async () => {
    if (!username.trim() || !password.trim()) return;
    setError("");

    // 1) Avval o'qituvchi login/parolini tekshiramiz
    if (username === TEACHER_USERNAME && password === TEACHER_PASSWORD) {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/home");
      return;
    }

    // 2) Mos kelmasa — student sifatida urinib ko'ramiz
    setSubmitting(true);
    const res = await studentLogin(username, password);
    setSubmitting(false);

    if (res.error) {
      setError("Incorrect login or password");
      return;
    }

    navigate("/studenthome");
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-16 pb-10">
        {/* Welcome card */}
        <div className="w-full rounded-3xl border-2 border-blue-400 bg-white/90 backdrop-blur-sm px-6 py-8 text-center shadow-sm">
          <h1 className="text-4xl font-semibold tracking-wide text-slate-500">
            WELCOME
          </h1>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            &quot;T&quot; App
          </p>
        </div>

        {/* Login card */}
        <div className="w-full mt-16 rounded-3xl bg-white/95 backdrop-blur-md shadow-lg px-6 py-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">
            Login
          </h2>

          <div className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />

            {error && (
              <p className="text-red-600 text-sm font-semibold text-center -mt-2">
                {error}
              </p>
            )}

            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full mt-3 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white text-xl font-bold py-4 shadow-md transition"
            >
              {submitting ? "Tekshirilmoqda..." : "Next"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-auto pt-16 text-center text-sm text-slate-400/80">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>
    </div>
  );
}
