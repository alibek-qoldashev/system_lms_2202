import React, { useState } from "react";

export default function SendTestModal({ topicName, card, onCancel, onSend }) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    const res = await onSend();
    setSending(false);
    if (res?.error) alert("Xatolik: " + res.error);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
      <div className="w-full max-w-xs bg-[#00173d] rounded-3xl px-6 py-8 text-center">
        <h2 className="text-xl font-bold text-white mb-6">{topicName}</h2>

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center font-semibold text-slate-900">
            {card.name}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-full bg-white text-slate-900 font-bold py-3 transition">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 transition"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}