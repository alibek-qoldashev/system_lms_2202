import React, { useState, useEffect } from "react";

// Animatsiyali modal: fon gray-blur bo'ladi, oyna scale+fade bilan chiqadi
export default function Modal({ open, onClose, children }) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl transition-all duration-200 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
