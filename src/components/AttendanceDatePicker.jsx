import React, { useMemo } from "react";

// Sistema shu oydan (iyul 2026) ochilgan, shundan oldingi sanalar mavjud emas.
const MIN_YEAR = 2026;
const MIN_MONTH = 7;
const MAX_YEAR = 2028;

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

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

export default function AttendanceDatePicker({ selectedDate, onChange }) {
  const yearOptions = useMemo(() => {
    const arr = [];
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) arr.push(y);
    return arr;
  }, []);

  const monthOptions = useMemo(() => {
    if (selectedDate.year === MIN_YEAR) {
      const arr = [];
      for (let m = MIN_MONTH; m <= 12; m++) arr.push(m);
      return arr;
    }
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, [selectedDate.year]);

  const dayOptions = useMemo(() => {
    const total = daysInMonth(selectedDate.month, selectedDate.year);
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [selectedDate.month, selectedDate.year]);

  const handleYearChange = (value) => {
    const year = Number(value);
    let month = selectedDate.month;
    if (year === MIN_YEAR && month < MIN_MONTH) month = MIN_MONTH;
    const maxDay = daysInMonth(month, year);
    const day = Math.min(selectedDate.day, maxDay);
    onChange({ day, month, year });
  };

  const handleMonthChange = (value) => {
    const month = Number(value);
    const maxDay = daysInMonth(month, selectedDate.year);
    const day = Math.min(selectedDate.day, maxDay);
    onChange({ ...selectedDate, month, day });
  };

  const handleDayChange = (value) => {
    onChange({ ...selectedDate, day: Number(value) });
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      <select
        value={selectedDate.day}
        onChange={(e) => handleDayChange(e.target.value)}
        className="rounded-full bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 outline-none cursor-pointer"
      >
        {dayOptions.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={selectedDate.month}
        onChange={(e) => handleMonthChange(e.target.value)}
        className="rounded-full bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 outline-none cursor-pointer"
      >
        {monthOptions.map((m) => (
          <option key={m} value={m}>
            {MONTH_NAMES[m - 1]}
          </option>
        ))}
      </select>

      <select
        value={selectedDate.year}
        onChange={(e) => handleYearChange(e.target.value)}
        className="rounded-full bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 outline-none cursor-pointer"
      >
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
