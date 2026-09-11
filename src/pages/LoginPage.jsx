import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";
import { supabase } from "../supabaseClient";
import Icon2 from "../img/icon2.png";

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

    // 1) O'qituvchi login/parolini tekshiramiz
    if (username === TEACHER_USERNAME && password === TEACHER_PASSWORD) {
      sessionStorage.setItem("isAuthenticated", "true");

      // Qurilmani aniqlash va Supabase 'teacher_devices' jadvaliga saqlash
      try {
        let token = localStorage.getItem("teacher_device_token");
        if (!token) {
          token = crypto.randomUUID();
          localStorage.setItem("teacher_device_token", token);
        }

        const ua = navigator.userAgent;
        let deviceName = "Noma'lum qurilma";
        if (ua.includes("Macintosh")) deviceName = "MacBook Air (M3)";
        else if (ua.includes("iPhone")) deviceName = "iPhone";
        else if (ua.includes("iPad")) deviceName = "iPad";
        else if (ua.includes("Android")) deviceName = "Android Phone";
        else if (ua.includes("Windows")) deviceName = "Windows PC";

        await supabase.from("teacher_devices").upsert(
          {
            device_token: token,
            device_name: deviceName,
            user_agent: ua,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "device_token" },
        );
      } catch (err) {
        console.error("Qurilmani saqlashda xatolik:", err);
      }

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
    <div className="relative min-h-screen w-full flex justify-center items-center bg-[#00173d] overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/25 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 py-8 min-h-screen justify-between">
        <div className="w-full flex justify-center pt-4">
          <img src={Icon2} className="w-28 drop-shadow-lg" alt="Logo" />
        </div>

        <div className="w-full my-auto rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-sm">
            Login
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md px-5 py-3.5 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md px-5 py-3.5 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-semibold text-center mt-1">
                {error}
              </p>
            )}

            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full mt-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50 text-white text-lg font-semibold py-3.5 shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-200 border border-white/20"
            >
              {submitting ? "Tekshirilmoqda..." : "Next"}
            </button>
          </div>
        </div>

        <p className="pb-4 text-center text-xs text-white/50">
          Copyright © 2026
          <br />
          by{" "}
          <a href="https://qoldoshev-alibek.vercel.app/">
            <u>Qo'ldoshev Alibek</u>
          </a>
        </p>
      </div>
    </div>
  );
}
