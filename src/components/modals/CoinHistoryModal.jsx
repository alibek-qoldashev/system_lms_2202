import React from "react";
import { X, Coins } from "lucide-react";
import Modal from "../Modal";
import { formatHistoryDate } from "../../utils/formatters";

export default function CoinHistoryModal({
  student,
  history,
  loading,
  onClose,
}) {
  return (
    <Modal open={!!student} onClose={onClose}>
      {student && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900 truncate pr-2">
              {student.name} {student.surname}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-500 shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-5 text-amber-600 font-bold text-lg">
            <Coins className="w-5 h-5" />
            {Number(student.coins) || 0} coin
          </div>

          {loading && (
            <p className="text-slate-500 text-center py-6">Yuklanmoqda...</p>
          )}

          {!loading && history.length === 0 && (
            <p className="text-slate-500 text-center py-6">
              Hali tarix mavjud emas
            </p>
          )}

          {!loading && history.length > 0 && (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {history.map((entry) => {
                const amount = Number(entry.amount) || 0;
                const isPositive = amount >= 0;
                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {entry.reason || "Sabab ko'rsatilmagan"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatHistoryDate(entry.created_at)}
                      </p>
                    </div>
                    <span
                      className={`font-bold shrink-0 ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
