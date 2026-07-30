import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

// Sistema iyul 2026'dan ochilgan, shundan oldingi sanalar mavjud emas.
// Maksimal tanlash mumkin bo'lgan sana - dekabr 2028.
const MIN_YEAR = 2026;
const MIN_MONTH = 7;
const MAX_YEAR = 2028;
const MAX_MONTH = 12;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// "Mo-We-Fr" harflarini JS getDay() qiymatlariga moslash (0=Yakshanba..6=Shanba)
const WEEKDAY_TO_JS = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 0 };

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseLessonDays(daysStr) {
  if (!daysStr) return [];
  return daysStr
    .split("-")
    .map((abbr) => WEEKDAY_TO_JS[abbr])
    .filter((v) => v !== undefined);
}

// Oyning 1-kuni Dushanbadan boshlab nechinchi ustunda turishini hisoblaydi
function firstWeekdayOffset(month, year) {
  const jsDay = new Date(year, month - 1, 1).getDay();
  return (jsDay + 6) % 7;
}

const isBeforeMin = (year, month) =>
  year < MIN_YEAR || (year === MIN_YEAR && month < MIN_MONTH);
const isAfterMax = (year, month) =>
  year > MAX_YEAR || (year === MAX_YEAR && month > MAX_MONTH);

/**
 * Props:
 * - selectedDate: { day, month, year }
 * - onChange: (newDate) => void
 * - lessonDaysStr: masalan "Mo-We-Fr" — shu kunlar kalendarda belgilanadi
 * - markedDates: Set<"YYYY-MM-DD"> — davomat allaqachon kiritilgan kunlar
 */
export default function AttendanceDatePicker({
  selectedDate,
  onChange,
  lessonDaysStr,
  markedDates,
}) {
  const [viewYear, setViewYear] = useState(selectedDate.year);
  const [viewMonth, setViewMonth] = useState(selectedDate.month);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Boshqa guruh tanlanganda yoki sana tashqaridan o'zgarganda ko'rinishni sinxronlaymiz
  useEffect(() => {
    setViewYear(selectedDate.year);
    setViewMonth(selectedDate.month);
  }, [selectedDate.year, selectedDate.month]);

  const lessonWeekdays = useMemo(
    () => parseLessonDays(lessonDaysStr),
    [lessonDaysStr],
  );

  const totalDays = daysInMonth(viewMonth, viewYear);
  const offset = firstWeekdayOffset(viewMonth, viewYear);

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(d);
    return arr;
  }, [offset, totalDays]);

  const today = new Date();

  const isToday = (d) =>
    d === today.getDate() &&
    viewMonth === today.getMonth() + 1 &&
    viewYear === today.getFullYear();

  const isSelected = (d) =>
    d === selectedDate.day &&
    viewMonth === selectedDate.month &&
    viewYear === selectedDate.year;

  const isLessonDay = (d) => {
    if (lessonWeekdays.length === 0) return false;
    const weekday = new Date(viewYear, viewMonth - 1, d).getDay();
    return lessonWeekdays.includes(weekday);
  };

  const isMarked = (d) => {
    if (!markedDates) return false;
    const iso = `${viewYear}-${pad2(viewMonth)}-${pad2(d)}`;
    return markedDates.has(iso);
  };

  const canGoPrev = !isBeforeMin(
    viewMonth === 1 ? viewYear - 1 : viewYear,
    viewMonth === 1 ? 12 : viewMonth - 1,
  );
  const canGoNext = !isAfterMax(
    viewMonth === 12 ? viewYear + 1 : viewYear,
    viewMonth === 12 ? 1 : viewMonth + 1,
  );

  const goPrevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDay = (d) => {
    if (!d) return;
    onChange({ day: d, month: viewMonth, year: viewYear });
  };

  const jumpToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
    onChange({
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });
  };

  const yearOptions = [];
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) yearOptions.push(y);

  const monthOptionsFor = (year) => {
    const start = year === MIN_YEAR ? MIN_MONTH : 1;
    const end = year === MAX_YEAR ? MAX_MONTH : 12;
    const arr = [];
    for (let m = start; m <= end; m++) arr.push(m);
    return arr;
  };

  return (
    <div className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-4">
      {/* Oy/yil navigatsiyasi */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrevMonth}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition"
          aria-label="Oldingi oy"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-semibold text-sm hover:bg-white/10 transition"
        >
          <CalendarIcon className="w-4 h-4 text-white/60" />
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </button>

        <button
          onClick={goNextMonth}
          disabled={!canGoNext}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition"
          aria-label="Keyingi oy"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Tezkor yil/oy tanlash paneli */}
      {pickerOpen && (
        <div className="mb-4 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {yearOptions.map((y) => (
              <button
                key={y}
                onClick={() => {
                  setViewYear(y);
                  const opts = monthOptionsFor(y);
                  if (!opts.includes(viewMonth)) setViewMonth(opts[0]);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  y === viewYear
                    ? "bg-blue-500 text-white"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {monthOptionsFor(viewYear).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setViewMonth(m);
                  setPickerOpen(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  m === viewMonth
                    ? "bg-blue-500 text-white"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                {MONTH_NAMES[m - 1].slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hafta kunlari sarlavhasi */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-semibold text-white/40 py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Kunlar gridi */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;

          const selected = isSelected(d);
          const todayFlag = isToday(d);
          const lessonFlag = isLessonDay(d);
          const markedFlag = isMarked(d);

          return (
            <button
              key={d}
              onClick={() => selectDay(d)}
              className={`relative aspect-square rounded-xl text-sm font-semibold flex items-center justify-center transition ${
                selected
                  ? "bg-blue-500 text-white shadow-[0_2px_10px_rgba(59,130,246,0.5)]"
                  : lessonFlag
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "text-white/50 hover:bg-white/10 hover:text-white"
              } ${todayFlag && !selected ? "ring-1 ring-blue-400" : ""}`}
            >
              {d}
              {markedFlag && (
                <span
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    selected ? "bg-white" : "bg-emerald-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bugungi kunga tez o'tish */}
      <button
        onClick={jumpToToday}
        className="w-full mt-3 text-xs font-semibold text-blue-300 hover:text-blue-200 transition"
      >
        Bugungi kunga o'tish
      </button>

      {/* Izoh */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white/20 border border-white/30" />
          Dars kuni
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Belgilangan
        </span>
      </div>
    </div>
  );
}
