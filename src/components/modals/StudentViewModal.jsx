import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import Modal from "../Modal";

export default function StudentViewModal({ student, onClose, onEdit }) {
  const [showPassword, setShowPassword] = useState(false);

  // Modal yopilganda parol ko'rinishini qayta yashiramiz, keyingi safar
  // boshqa/o'sha talaba ochilganda tasodifan ochiq qolib ketmasin.
  const handleClose = () => {
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal open={!!student} onClose={handleClose}>
      {student && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Student details
            </h3>
            <button
              onClick={handleClose}
              className="text-slate-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 text-slate-800">
            <div>
              <p className="text-xs text-slate-500 uppercase">Name</p>
              <p className="font-semibold">{student.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Surname</p>
              <p className="font-semibold">{student.surname || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Age</p>
              <p className="font-semibold">{student.age || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Phone</p>
              <p className="font-semibold">{student.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Payment sum</p>
              <p className="font-semibold">
                {student.paymentSum ? `${student.paymentSum} so'm` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Coins</p>
              <p className="font-semibold">{Number(student.coins) || 0}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase">Login parol</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold tracking-wide">
                  {student.password
                    ? showPassword
                      ? student.password
                      : "•".repeat(Math.max(student.password.length, 6))
                    : "—"}
                </p>
                {student.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={
                      showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onEdit(student)}
            className="w-full mt-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-3 shadow-md transition"
          >
            Edit
          </button>
        </>
      )}
    </Modal>
  );
}
