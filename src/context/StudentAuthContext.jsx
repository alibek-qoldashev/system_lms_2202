import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const StudentAuthContext = createContext(null);
const STORAGE_KEY = "student_session";

export function StudentAuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setStudent(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (fullName, password) => {
    const normalized = fullName.trim().toLowerCase();

    const { data, error } = await supabase
      .from("students")
      .select(
        "id, name, surname, group_id, password, payment_sum, lesson_price, coins",
      );

    if (error) {
      return { error: "Server xatoligi, qayta urinib ko'ring" };
    }

    const match = (data || []).find(
      (s) => `${s.name} ${s.surname}`.trim().toLowerCase() === normalized,
    );

    if (!match) {
      return { error: "Talaba topilmadi" };
    }

    if (match.password !== password) {
      return { error: "Parol noto'g'ri" };
    }

    const session = {
      id: match.id,
      name: match.name,
      surname: match.surname,
      groupId: match.group_id,
    };

    setStudent(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { error: null };
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StudentAuthContext.Provider value={{ student, loading, login, logout }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx)
    throw new Error("useStudentAuth must be used within StudentAuthProvider");
  return ctx;
}
