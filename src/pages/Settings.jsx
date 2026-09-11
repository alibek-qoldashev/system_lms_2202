import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, User, Shield, Bell } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#00173d] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Settings Menu */}
        <div className="space-y-4">
          {/* Profile (misol uchun) */}
          <button className="w-full p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md flex items-center gap-4 transition-all opacity-60 cursor-not-allowed">
            <div className="p-3 bg-white/10 rounded-xl text-blue-400">
              <User className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-lg">Profil sozlamalari</h3>
              <p className="text-sm text-white/50">
                Ism, parol va rasmni o'zgartirish (Tez orada)
              </p>
            </div>
          </button>

          {/* Devices (Asosiy funksiya) */}
          <button
            onClick={() => navigate("/devices")}
            className="w-full p-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center gap-4 transition-all"
          >
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-lg">Ulangan qurilmalar</h3>
              <p className="text-sm text-white/50">
                Tizimga kirgan barcha qurilmalarni ko'rish va boshqarish
              </p>
            </div>
          </button>

          {/* Security (misol uchun) */}
          <button className="w-full p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md flex items-center gap-4 transition-all opacity-60 cursor-not-allowed">
            <div className="p-3 bg-white/10 rounded-xl text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-lg">Xavfsizlik</h3>
              <p className="text-sm text-white/50">
                Ikki bosqichli autentifikatsiya (Tez orada)
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
