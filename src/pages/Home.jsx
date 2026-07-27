import React from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, ListChecks } from "lucide-react";

const menuCards = [
  {
    key: "attendence",
    label: "Attendence",
    path: "/attendance",
    icon: (
      <ClipboardCheck className="w-10 h-10 text-blue-600" strokeWidth={2} />
    ),
  },
  {
    key: "tests",
    label: "Tests",
    path: null,
    icon: (
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-10 h-10 text-blue-600"
          fill="currentColor"
        >
          <path
            d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6z"
            opacity="0.15"
          />
          <path
            d="M14 2v5a1 1 0 0 0 1 1h5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span className="absolute text-xs font-extrabold text-white bg-blue-600 rounded px-1">
          A+
        </span>
      </div>
    ),
  },
  {
    key: "groups",
    label: "Groups",
    path: "/groups",
    icon: <ListChecks className="w-10 h-10 text-blue-600" strokeWidth={2} />,
  },
  { key: "upcoming1", label: "Upcoming...", path: null, icon: null },
  { key: "upcoming2", label: "Upcoming...", path: null, icon: null },
  { key: "upcoming3", label: "Upcoming...", path: null, icon: null },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-16 pb-10">
        {/* Header */}
        <div className="w-full rounded-3xl border-2 border-blue-400 bg-white/90 backdrop-blur-sm px-6 py-8 text-center shadow-sm">
          <h1 className="text-4xl font-semibold tracking-wide text-slate-500">
            &quot;T&quot; App
          </h1>
        </div>

        {/* Menu grid */}
        <div className="w-full grid grid-cols-3 gap-4 mt-16">
          {menuCards.map((card) => (
            <button
              key={card.key}
              onClick={() => card.path && navigate(card.path)}
              className="aspect-square rounded-2xl bg-white/90 backdrop-blur-md shadow-md flex flex-col items-center justify-center gap-3 px-2 hover:bg-white active:scale-95 transition"
            >
              {card.icon}
              <span className="text-sm font-bold text-slate-900 text-center leading-tight">
                {card.label}
              </span>
            </button>
          ))}
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
