import React from "react";
import { X } from "lucide-react";
import Modal from "../Modal";

export default function StudentViewModal({ student, onClose, onEdit }) {
  return (
    <Modal open={!!student} onClose={onClose}>
      {student && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Student details
            </h3>
            <button
              onClick={onClose}
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
