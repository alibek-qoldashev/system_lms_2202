import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gift,
  Coins as CoinsIcon,
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShoppingBag,
  Lock,
  Pen,
  NotebookText,
  Sticker,
  Calendar,
  Highlighter,
  Coffee,
  Headphones,
  Speaker,
  BookOpen,
  Backpack,
  Shirt,
} from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { supabase } from "../supabaseClient";

// Sovg'alar ro'yxati
const GIFTS = [
  { id: "pen-set", name: "Qalam + Ruchka", cost: 2000, icon: Pen },
  { id: "notebook", name: "Bloknot", cost: 4000, icon: NotebookText },
  { id: "sticker-set", name: "Stiker to'plami", cost: 5000, icon: Sticker },
  { id: "calendar", name: "Kalendar", cost: 6000, icon: Calendar },
  { id: "markers", name: "Markerlar to'plami", cost: 7000, icon: Highlighter },
  { id: "cup", name: "Stakan", cost: 6000, icon: Coffee },
  { id: "headphones", name: "Quloqchin", cost: 13000, icon: Headphones },
  { id: "speaker", name: "Speaker", cost: 15000, icon: Speaker },
  { id: "essential-words", name: "Essential Words", cost: 6000, icon: BookOpen },
  {
    id: "ielts-speaking-structure",
    name: "IELTS Speaking Structure",
    cost: 7000,
    icon: BookOpen,
  },
  { id: "grammarway", name: "Grammarway", cost: 5000, icon: BookOpen },
  { id: "bag", name: "Sumka", cost: 12000, icon: Backpack },
  { id: "tshirt", name: "Futbolka", cost: 15000, icon: Shirt },
];

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

async function notifyTeacher({ name, surname, phone, cost, giftName }) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error(
      "Telegram bot token yoki chat_id sozlanmagan (.env faylini tekshiring)",
    );
    return;
  }

  const text =
    `🎁 <b>Yangi sovg'a buyurtmasi</b>\n\n` +
    `👤 Ism familiya: ${name} ${surname}\n` +
    `📞 Telefon: ${phone || "—"}\n` +
    `🪙 Ishlatilgan coin: ${cost}\n` +
    `🎁 Sovg'a: ${giftName}`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      },
    );
    const data = await res.json();
    if (!data.ok) {
      console.error("Telegramga xabar yuborishda xatolik:", data);
    }
  } catch (err) {
    console.error("Telegramga ulanishda xatolik:", err);
  }
}

export default function UseCoins() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedGift, setSelectedGift] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, surname, phone, coins")
        .eq("id", student.id)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    };

    if (student) fetchProfile();
  }, [student]);

  if (!student) return null;

  const openConfirm = (gift) => {
    setSelectedGift(gift);
    setErrorMsg("");
  };

  const closeConfirm = () => {
    if (confirming) return;
    setSelectedGift(null);
    setErrorMsg("");
  };

  const handleConfirmPurchase = async () => {
    if (!selectedGift || !profile) return;
    setConfirming(true);
    setErrorMsg("");

    const { data: fresh, error: fetchError } = await supabase
      .from("students")
      .select("coins")
      .eq("id", student.id)
      .single();

    if (fetchError) {
      setErrorMsg("Xatolik yuz berdi, qayta urinib ko'ring");
      setConfirming(false);
      return;
    }

    const currentCoins = Number(fresh.coins) || 0;

    if (currentCoins < selectedGift.cost) {
      setErrorMsg("Hisobda yetarli coins mavjud emas");
      setConfirming(false);
      return;
    }

    const newCoins = currentCoins - selectedGift.cost;

    const { error: updateError } = await supabase
      .from("students")
      .update({ coins: newCoins })
      .eq("id", student.id);

    if (updateError) {
      console.error("Coinsni yechishda xatolik:", updateError);
      setErrorMsg("Xatolik yuz berdi, qayta urinib ko'ring");
      setConfirming(false);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, coins: newCoins } : prev));

    await notifyTeacher({
      name: profile.name,
      surname: profile.surname,
      phone: profile.phone,
      cost: selectedGift.cost,
      giftName: selectedGift.name,
    });

    setConfirming(false);
    setSelectedGift(null);
    setShowSuccess(true);
  };

  const myCoins = Number(profile?.coins) || 0;

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex justify-center relative overflow-hidden">
      {/* Orqa fondagi neonsimon yog'du */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center px-5 pt-12 pb-10 z-10">
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/student/coins")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-sm font-medium backdrop-blur-xl transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl rounded-2xl px-3.5 py-1.5">
            <CoinsIcon className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-amber-400 text-sm tabular-nums">
              {loading ? "…" : myCoins}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="w-full flex items-center justify-between mb-6 px-1">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Sovg'alar do'koni
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Yig'gan coinlaringizni ajoyib sovg'alarga almashtiring
            </p>
          </div>
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="w-full grid grid-cols-2 gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 bg-slate-800/40 rounded-2xl border border-white/5"
              />
            ))}
          </div>
        )}

        {/* Gifts Grid */}
        {!loading && (
          <div className="w-full grid grid-cols-2 gap-3">
            {GIFTS.map((gift) => {
              const canAfford = myCoins >= gift.cost;
              const GiftIcon = gift.icon || Gift;
              return (
                <div
                  key={gift.id}
                  className="group relative rounded-2xl p-4 bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-between gap-3 transition-all duration-300 hover:border-white/20"
                >
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <GiftIcon className="w-7 h-7" />
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <p className="font-bold text-white text-xs line-clamp-2 min-h-[32px] flex items-center justify-center">
                      {gift.name}
                    </p>

                    <div className="flex items-center gap-1 mt-1 px-2.5 py-1 rounded-xl bg-slate-950/60 border border-white/5">
                      <CoinsIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-extrabold text-amber-400 tabular-nums">
                        {gift.cost}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openConfirm(gift)}
                    disabled={!canAfford}
                    className={`w-full mt-1 py-2.5 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
                      canAfford
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20"
                        : "bg-slate-800/80 text-slate-500 border border-white/5 cursor-not-allowed active:scale-100"
                    }`}
                  >
                    {canAfford ? (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Olish</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Yetmaydi</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tasdiqlash Modal Oynasi */}
      {selectedGift && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center px-5 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

            <button
              onClick={closeConfirm}
              disabled={confirming}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-white/5 transition disabled:opacity-40"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mt-2 mb-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
                {selectedGift.icon ? (
                  <selectedGift.icon className="w-8 h-8" />
                ) : (
                  <Gift className="w-8 h-8" />
                )}
              </div>
              <h2 className="text-lg font-bold text-white">
                {selectedGift.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <CoinsIcon className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-amber-400 text-sm">
                  {selectedGift.cost} coins
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Ushbu sovg'ani sotib olishni tasdiqlaysizmi? Hisobingizdan
                coinlar yechiladi.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeConfirm}
                disabled={confirming}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-white/5 transition active:scale-95 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={confirming}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Kutilmoqda...</span>
                  </>
                ) : (
                  <span>Tasdiqlash</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Muvaffaqiyat (Success) Modal Oynasi */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center px-5 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center relative shadow-2xl">
            <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Xarid muvaffaqiyatli!
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Sovg'angiz tayyorlanmoqda va 1 hafta ichida o'qituvchingiz
              tomonidan topshiriladi.
            </p>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95"
            >
              Tushunarli (OK)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}