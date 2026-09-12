import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Laptop, Smartphone, Monitor, Trash2, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const currentToken = localStorage.getItem("teacher_device_token");
  const isMacBook = navigator.userAgent.includes("Macintosh");

  const fetchDevices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teacher_devices")
      .select("*")
      .order("last_seen_at", { ascending: false });

    if (!error && data) {
      setDevices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleKickOut = async (id, name) => {
    if (!isMacBook) {
      alert("Faqat MacBook Air qurilmasidan boshqa qurilmalarni o'chirish mumkin!");
      return;
    }

    if (!window.confirm(`${name} qurilmasini tizimdan chiqarib yubormoqchimisiz?`)) {
      return;
    }

    setRemovingId(id);

    // MUHIM: .select() qo'shildi — shu orqali haqiqatan nechta qator
    // o'chirilganini bilamiz. Ba'zan RLS/policy sababli so'rov "xatosiz"
    // qaytadi, lekin aslida 0 ta qator o'chirilgan bo'ladi.
    const { data, error } = await supabase
      .from("teacher_devices")
      .delete()
      .eq("id", id)
      .select();

    setRemovingId(null);

    if (error) {
      alert("Xatolik: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert(
        "Diqqat: so'rov xatosiz qaytdi, lekin hech qanday qator o'chirilmadi.\n\n" +
          "Bu odatda Supabase'da 'teacher_devices' jadvalida RLS yoqilgan va DELETE " +
          "uchun policy yo'qligini bildiradi. SQL Editor'da tekshiring:\n\n" +
          "alter table teacher_devices disable row level security;",
      );
      // Haqiqiy holatni ko'rish uchun serverdan qayta yuklaymiz —
      // ekrandan "optimistik" olib tashlamaymiz, chunki u yolg'on ko'rinish beradi.
      await fetchDevices();
      return;
    }

    // Haqiqatan o'chirilgani tasdiqlandi — endi serverdan qayta yuklaymiz
    await fetchDevices();
  };

  const getDeviceIcon = (name) => {
    if (name?.includes("MacBook") || name?.includes("Laptop")) {
      return <Laptop className="w-6 h-6 text-blue-400" />;
    }
    if (name?.includes("iPhone") || name?.includes("Android")) {
      return <Smartphone className="w-6 h-6 text-emerald-400" />;
    }
    return <Monitor className="w-6 h-6 text-purple-400" />;
  };

  return (
    <div className="min-h-screen bg-[#00173d] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Ortga
          </button>
          <h1 className="text-2xl font-bold">Ulangan Qurilmalar</h1>
          <button
            onClick={fetchDevices}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* MacBook Status Badge */}
        <div className="mb-6 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className={`w-7 h-7 ${isMacBook ? "text-emerald-400" : "text-amber-400"}`} />
            <div>
              <h3 className="font-semibold text-sm md:text-base">
                {isMacBook ? "Asosiy Boshqaruv Rejimi (MacBook Air)" : "Cheklangan Rejim"}
              </h3>
              <p className="text-xs text-white/60">
                {isMacBook
                  ? "Siz MacBook Air-dasiz. Boshqa qurilmalarni majburiy chiqarib yuborishingiz mumkin."
                  : "Siz boshqa qurilmadasiz. Qurilmalarni o'chirish huquqi faqat MacBook Air-da mavjud."}
              </p>
            </div>
          </div>
        </div>

        {/* Devices List */}
        <div className="space-y-4">
          {devices.map((device) => {
            const isCurrent = device.device_token === currentToken;
            const isRemoving = removingId === device.id;
            return (
              <div
                key={device.id}
                className={`p-5 rounded-2xl bg-white/10 border ${
                  isCurrent ? "border-blue-500/80 bg-blue-500/10" : "border-white/10"
                } backdrop-blur-md flex items-center justify-between gap-4 transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    {getDeviceIcon(device.device_name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base">{device.device_name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full font-medium">
                          Hozirgi qurilma
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 max-w-xs md:max-w-md truncate mt-1">
                      {device.user_agent}
                    </p>
                    <p className="text-[11px] text-white/40 mt-1">
                      Kirgan vaqti: {new Date(device.last_seen_at || device.created_at).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                </div>

                {/* Kick out button */}
                {isMacBook && !isCurrent && (
                  <button
                    onClick={() => handleKickOut(device.id, device.device_name)}
                    disabled={isRemoving}
                    className="p-3 bg-rose-500/20 hover:bg-rose-500/40 disabled:opacity-50 text-rose-300 rounded-xl border border-rose-500/30 transition flex items-center gap-2 shrink-0 text-sm font-medium"
                    title="Tizimdan chiqarish"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isRemoving ? "..." : "Chiqarish"}
                    </span>
                  </button>
                )}
              </div>
            );
          })}

          {devices.length === 0 && !loading && (
            <p className="text-center text-white/50 py-8">Hozircha hech qanday qurilma ulanganicha yo'q.</p>
          )}
        </div>
      </div>
    </div>
  );
}