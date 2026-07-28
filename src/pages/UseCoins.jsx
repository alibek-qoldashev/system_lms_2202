import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Coins as CoinsIcon, X } from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { supabase } from "../supabaseClient";

// Sovg'alar ro'yxati — hozircha kodning ichida. Narxni yoki nomini
// o'zgartirish uchun shu ro'yxatni tahrirlang.
const GIFTS = [
  { id: "book", name: "Kitob", cost: 5000 },
  { id: "pen-set", name: "Ruchka to'plami", cost: 1500 },
  { id: "notebook", name: "Daftar", cost: 1000 },
  { id: "bag", name: "Sumka", cost: 8000 },
  { id: "tshirt", name: "Futbolka", cost: 6000 },
  { id: "cup", name: "Stakan", cost: 2000 },
  { id: "candy", name: "Konfet to'plami", cost: 1200 },
  { id: "toy", name: "O'yinchoq", cost: 3000 },
  { id: "headphones", name: "Naushnik", cost: 10000 },
  { id: "powerbank", name: "Powerbank", cost: 12000 },
  { id: "cap", name: "Kepka", cost: 3500 },
  { id: "watch", name: "Sport soat", cost: 15000 },
];

// Telegram bot orqali o'qituvchiga xabar yuborish uchun.
// .env fayliga quyidagilarni qo'shing (Vite loyihalarida VITE_ prefiksi shart):
//   VITE_TELEGRAM_BOT_TOKEN=xxxxx:yyyyy
//   VITE_TELEGRAM_CHAT_ID=123456789
// .env o'zgargandan keyin dev serverni albatta qayta ishga tushiring.
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
    // Telegram xabari yuborilmasa ham, coin allaqachon yechilgan bo'ladi —
    // shuning uchun talabaga xatolik ko'rsatmaymiz, faqat konsolga yozamiz.
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
    if (confirming) return; // so'rov ketayotganda modalni yopib qo'ymaslik uchun
    setSelectedGift(null);
    setErrorMsg("");
  };

  const handleConfirmPurchase = async () => {
    if (!selectedGift || !profile) return;
    setConfirming(true);
    setErrorMsg("");

    // Balansni tasdiqlashdan oldin bazadan yangilab olamiz —
    // ekrandagi eski (stale) qiymatga ishonib qolmaslik uchun.
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

    // Coin muvaffaqiyatli yechildi — endi o'qituvchiga xabar yuboramiz.
    // Bu qadam muvaffaqiyatsiz bo'lsa ham, xarid allaqachon amalga oshgan.
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
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-2 gap-3">
          <button
            onClick={() => navigate("/student/coins")}
            className="text-slate-200 font-semibold shrink-0"
          >
            ← Back
          </button>
          <div className="flex items-center gap-1.5 bg-white/90 rounded-full pl-2.5 pr-3 py-1.5 shrink-0">
            <CoinsIcon className="w-4 h-4 text-yellow-500" strokeWidth={2.5} />
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              {loading ? "…" : myCoins}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-8">
          Sovg'alar
        </h1>

        {loading && <p className="text-slate-300">Yuklanmoqda...</p>}

        {!loading && (
          <div className="w-full grid grid-cols-2 gap-3">
            {GIFTS.map((gift) => {
              const canAfford = myCoins >= gift.cost;
              return (
                <div
                  key={gift.id}
                  className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm px-4 py-4 flex flex-col items-center gap-2"
                >
                  <Gift className="w-8 h-8 text-blue-500" strokeWidth={2} />
                  <p className="font-semibold text-slate-900 text-sm text-center leading-tight">
                    {gift.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <CoinsIcon
                      className="w-3.5 h-3.5 text-yellow-500"
                      strokeWidth={2.5}
                    />
                    <span className="text-sm font-bold text-slate-700 tabular-nums">
                      {gift.cost}
                    </span>
                  </div>
                  <button
                    onClick={() => openConfirm(gift)}
                    disabled={!canAfford}
                    className="w-full mt-1 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold py-2 transition"
                  >
                    Buy
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tasdiqlash oynasi */}
      {selectedGift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="w-full max-w-sm bg-white rounded-3xl px-6 py-6 relative">
            <button
              onClick={closeConfirm}
              disabled={confirming}
              className="absolute top-5 right-5 text-slate-500 hover:text-slate-800 disabled:opacity-40"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-3 mb-6 mt-2">
              <Gift className="w-10 h-10 text-blue-500" strokeWidth={2} />
              <h2 className="text-lg font-bold text-slate-900 text-center">
                {selectedGift.name}
              </h2>
              <div className="flex items-center gap-1">
                <CoinsIcon
                  className="w-4 h-4 text-yellow-500"
                  strokeWidth={2.5}
                />
                <span className="font-bold text-slate-700">
                  {selectedGift.cost} coins
                </span>
              </div>
              <p className="text-sm text-slate-500 text-center">
                Ushbu sovg'ani sotib olishni tasdiqlaysizmi?
              </p>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm font-semibold text-center mb-4">
                {errorMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeConfirm}
                disabled={confirming}
                className="flex-1 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 font-bold py-3 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={confirming}
                className="flex-1 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 transition"
              >
                {confirming ? "..." : "Tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Muvaffaqiyat oynasi */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="w-full max-w-sm bg-white rounded-3xl px-6 py-8 flex flex-col items-center gap-4">
            <Gift className="w-12 h-12 text-green-500" strokeWidth={2} />
            <p className="text-lg font-bold text-slate-900 text-center">
              Sovg'angiz 1 hafta ichida olasiz
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
