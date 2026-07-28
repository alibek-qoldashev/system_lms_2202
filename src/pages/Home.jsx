import React from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, ListChecks } from "lucide-react";
import { Lock } from "lucide-react";
import Icon2 from "../img/icon2.png";

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
    key: "payment",
    label: "Payment",
    path: "/payment",
    icon: (
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-10 h-10 text-blue-600"
          fill="currentColor"
        >
          {/* Karta foning yorug' joyi */}
          <rect x="2" y="5" width="20" height="14" rx="3" opacity="0.15" />
          {/* Karta konturi */}
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
          {/* Magnit tasmasi */}
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
          {/* Kichik to'lov chiplari/chiziqlari */}
          <path
            d="M6 15h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {/* Burchakdagi to'lov belgisi ($ yoki UZS) */}
        <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-extrabold text-white bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center shadow">
          $
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

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-16 pb-10">
        {/* Header */}
        <div className="w-full flex justify-around space-center  shadow-sm">
          <div></div>
          <div>
            <img src={Icon2} className="w-35 pl-9" alt="" />
          </div>
          <div className="pt-20">
            {" "}
            <button
              onClick={handleLogout}
              aria-label="Chiqish"
              className=" w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition relative left-[25px]"
            >
              <Lock className="w-4 h-4 text-slate-700 " />
            </button>
          </div>
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
