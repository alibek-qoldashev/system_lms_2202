import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  ListChecks,
  Lock,
  LogOut,
  BookOpen,
} from "lucide-react";
import Icon2 from "../img/icon2.png";

const menuCards = [
  {
    key: "attendance",
    label: "Attendance",
    path: "/attendance",
    icon: (
      <ClipboardCheck
        className="w-9 h-9 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
        strokeWidth={2}
      />
    ),
  },
  {
    key: "payment",
    label: "Payment",
    path: "/payment",
    icon: (
      <div className="relative w-9 h-9 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-9 h-9 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
          fill="currentColor"
        >
          <rect x="2" y="5" width="20" height="14" rx="3" opacity="0.2" />
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M6 15h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-extrabold text-white bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center shadow">
          $
        </span>
      </div>
    ),
  },
  {
    key: "groups",
    label: "Groups",
    path: "/groups",
    icon: (
      <ListChecks
        className="w-9 h-9 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
        strokeWidth={2}
      />
    ),
  },
  {
    key: "homeworks",
    label: "Homeworks",
    path: "/homeworks",
    icon: (
      <BookOpen
        className="w-9 h-9 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
        strokeWidth={2}
      />
    ),
  },
  { key: "upcoming2", label: "Upcoming...", path: null, icon: null },
  { key: "upcoming3", label: "Upcoming...", path: null, icon: null },
];

export default function Home() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center items-center bg-[#00173d] overflow-hidden">
      {/* Orqa fondagi Liquid Glass doiralari (Glow effect) */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-blue-500/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-indigo-500/25 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 py-8 min-h-screen justify-between">
        {/* Header */}
        <div className="w-full flex items-center justify-between pt-4">
          <div className="w-10" />
          <div className="flex justify-center">
            <img src={Icon2} className="w-28 drop-shadow-lg" alt="Logo" />
          </div>
          <button
            onClick={handleLogoutClick}
            aria-label="Chiqish"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 flex items-center justify-center transition shadow-md group"
          >
            <LogOut className="w-4 h-4 text-white/80 group-hover:text-white transition" />
          </button>
        </div>

        {/* Menu Grid */}
        <div className="w-full grid grid-cols-3 gap-4 my-auto py-8">
          {menuCards.map((card) => {
            const isDisabled = !card.path;

            return (
              <button
                key={card.key}
                disabled={isDisabled}
                onClick={() => card.path && navigate(card.path)}
                className={`aspect-square rounded-3xl p-3 flex flex-col items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden ${
                  isDisabled
                    ? "bg-white/5 border border-white/10 backdrop-blur-md cursor-not-allowed opacity-50"
                    : "bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:bg-white/20 hover:border-white/30 active:scale-95"
                }`}
              >
                {isDisabled ? (
                  <>
                    <Lock className="w-6 h-6 text-white/40 mb-1" />
                    <span className="text-xs font-medium text-white/40 text-center leading-tight">
                      {card.label}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                      {card.icon}
                    </div>
                    <span className="text-xs font-semibold text-white text-center leading-tight drop-shadow-sm">
                      {card.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="pb-2 text-center text-xs text-white/50">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>

      {/* Logout tasdiqlash oynasi */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-xs rounded-3xl bg-[#0a2450]/90 border border-white/15 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 flex flex-col items-center gap-5">
            <p className="text-white text-sm font-medium text-center leading-relaxed">
              Confirm Exit
            </p>
            <div className="w-full flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-semibold backdrop-blur-md hover:bg-white/20 active:scale-95 transition"
              >
                No{" "}
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-semibold shadow-md hover:bg-red-600 active:scale-95 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
