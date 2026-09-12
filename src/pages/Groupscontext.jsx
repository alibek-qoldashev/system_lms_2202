import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../supabaseClient";

// ==========================================
// 1. HELPERS (Yordamchi funksiyalar)
// ==========================================

const lastDigits = (phone, n = 4) => {
  const digitsOnly = (phone || "").replace(/\D/g, "");
  return digitsOnly.slice(-n) || "0000";
};

const toNumberOrNull = (value) => {
  if (value === "" || value === undefined || value === null) return null;
  return Number(value);
};

const pad2 = (n) => String(n).padStart(2, "0");

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

// ==========================================
// 2. CONTEXT & PROVIDER
// ==========================================

const GroupsContext = createContext(null);

export function GroupsProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- GET DATA ---
  const fetchGroups = useCallback(async () => {
    setLoading(true);

    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .order("position", { ascending: true });

    if (groupsError) {
      console.error("Guruhlarni yuklashda xatolik:", groupsError);
      setLoading(false);
      return;
    }

    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .order("position", { ascending: true });

    if (studentsError) {
      console.error("Talabalarni yuklashda xatolik:", studentsError);
    }

    const merged = (groupsData || []).map((g) => ({
      ...g,
      time: g.lesson_time,
      days: g.lesson_days,
      students: (studentsData || [])
        .filter((s) => s.group_id === g.id)
        .map((s) => {
          let history = [];
          if (s.payment_history) {
            try {
              history =
                typeof s.payment_history === "string"
                  ? JSON.parse(s.payment_history)
                  : s.payment_history;
            } catch (e) {
              history = [];
            }
          }
          return {
            ...s,
            paymentHistory: Array.isArray(history) ? history : [],
            coins: Number(s.coins) || 0,
            lessonsSincePayment: Number(s.lessons_since_payment) || 0,
          };
        }),
    }));

    setGroups(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // --- GROUP ACTIONS ---
  const addGroup = async (group) => {
    const { data, error } = await supabase
      .from("groups")
      .insert({
        name: group.name,
        lesson_time: group.time,
        lesson_days: group.days,
        position: groups.length,
      })
      .select()
      .single();

    if (error) {
      console.error("Guruh qo'shishda xatolik:", error);
      return;
    }

    setGroups((prev) => [
      ...prev,
      { ...data, time: data.lesson_time, days: data.lesson_days, students: [] },
    ]);
  };

  const updateGroup = async (groupId, updates) => {
    const { error } = await supabase
      .from("groups")
      .update({
        name: updates.name,
        lesson_time: updates.time,
        lesson_days: updates.days,
      })
      .eq("id", groupId);

    if (error) {
      console.error("Guruhni yangilashda xatolik:", error);
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, name: updates.name, time: updates.time, days: updates.days }
          : g,
      ),
    );
  };

  const deleteGroups = async (groupIds) => {
    const { error } = await supabase.from("groups").delete().in("id", groupIds);
    if (error) {
      console.error("Guruhlarni o'chirishda xatolik:", error);
      return;
    }
    setGroups((prev) => prev.filter((g) => !groupIds.includes(g.id)));
  };

  const reorderGroups = async (newGroups) => {
    const prevGroups = groups;
    setGroups(newGroups);

    const results = await Promise.all(
      newGroups.map((g, index) =>
        supabase.from("groups").update({ position: index }).eq("id", g.id),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed) {
      console.error("Guruhlar tartibini saqlashda xatolik:", failed.error);
      setGroups(prevGroups); // Revert on failure
    }
  };

  // --- STUDENT ACTIONS ---
  const addStudent = async (groupId, student) => {
    const group = groups.find((g) => g.id === groupId);
    const position = group ? group.students.length : 0;
    const age = toNumberOrNull(student.age);

    const { data, error } = await supabase
      .from("students")
      .insert({
        group_id: groupId,
        name: student.name,
        surname: student.surname,
        age,
        phone: student.phone,
        position,
        payment_history: [],
        lessons_since_payment: 0,
        password: lastDigits(student.phone),
      })
      .select()
      .single();

    if (error) {
      console.error("Talaba qo'shishda xatolik:", error);
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: [
                ...g.students,
                {
                  ...data,
                  paymentHistory: [],
                  coins: 0,
                  lessonsSincePayment: 0,
                },
              ],
            }
          : g,
      ),
    );
  };

  const updateStudent = async (groupId, studentId, updates) => {
    const age = toNumberOrNull(updates.age);

    const { error } = await supabase
      .from("students")
      .update({
        name: updates.name,
        surname: updates.surname,
        age,
        phone: updates.phone,
      })
      .eq("id", studentId);

    if (error) {
      console.error("Talabani yangilashda xatolik:", error);
      return { error: error.message };
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === studentId
                  ? {
                      ...s,
                      name: updates.name,
                      surname: updates.surname,
                      age,
                      phone: updates.phone,
                    }
                  : s,
              ),
            }
          : g,
      ),
    );

    return { error: null };
  };

  const updateStudentPassword = async (studentId, newPassword) => {
    if (!newPassword || !newPassword.trim()) {
      return { error: "Parol bo'sh bo'lishi mumkin emas" };
    }

    const { error } = await supabase
      .from("students")
      .update({ password: newPassword })
      .eq("id", studentId);

    if (error) {
      console.error("Parolni yangilashda xatolik:", error);
      return { error: error.message };
    }

    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        students: g.students.map((s) =>
          s.id === studentId ? { ...s, password: newPassword } : s,
        ),
      })),
    );

    return { error: null };
  };

  const deleteStudents = async (groupId, studentIds) => {
    const { error } = await supabase
      .from("students")
      .delete()
      .in("id", studentIds);

    if (error) {
      console.error("Talabalarni o'chirishda xatolik:", error);
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: g.students.filter((s) => !studentIds.includes(s.id)),
            }
          : g,
      ),
    );
  };

  const reorderStudents = async (groupId, newStudents) => {
    const prevGroups = groups;
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, students: newStudents } : g)),
    );

    const results = await Promise.all(
      newStudents.map((s, index) =>
        supabase.from("students").update({ position: index }).eq("id", s.id),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed) {
      console.error("Tartibni saqlashda xatolik:", failed.error);
      setGroups(prevGroups); // Revert on failure
    }
  };

  // --- FINANCIAL & COIN ACTIONS ---

  // O'quvchi to'lov qilganda: tarixga yoziladi va "oxirgi to'lovdan beri
  // kelgan darslar" hisoblagichi 12 taga kamaytiriladi (ortib qolgani keyingi oyga o'tadi)
  const addPayment = async (groupId, studentId, amount) => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return { error: "Noto'g'ri summa" };

    const group = groups.find((g) => g.id === groupId);
    const student = group?.students.find((s) => s.id === studentId);
    if (!student) return { error: "O'quvchi topilmadi" };

    const newRecord = {
      id: Date.now().toString(),
      amount: numAmount,
      date: todayISO(),
    };
    const updatedHistory = [newRecord, ...(student.paymentHistory || [])];

    const currentLessons = Number(student.lessonsSincePayment) || 0;
    const newLessonsCount = currentLessons >= 12 ? currentLessons - 12 : 0;

    const { error: studentError } = await supabase
      .from("students")
      .update({
        payment_history: updatedHistory,
        lessons_since_payment: newLessonsCount,
      })
      .eq("id", studentId);

    if (studentError) {
      console.error("To'lovni saqlashda xatolik:", studentError);
      return { error: studentError.message };
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === studentId
                  ? {
                      ...s,
                      paymentHistory: updatedHistory,
                      lessonsSincePayment: newLessonsCount,
                    }
                  : s,
              ),
            }
          : g,
      ),
    );

    return { error: null };
  };

  // Attendance'da "keldi" belgilanganda +1, bekor qilinganda -1 —
  // oxirgi to'lovdan beri kelgan darslar sonini kuzatib boradi
  const adjustLessonsCount = async (groupId, studentId, delta) => {
    const group = groups.find((g) => g.id === groupId);
    const student = group?.students.find((s) => s.id === studentId);
    if (!student) return;

    const current = Number(student.lessonsSincePayment) || 0;
    const newCount = Math.max(0, current + delta);

    const { error } = await supabase
      .from("students")
      .update({ lessons_since_payment: newCount })
      .eq("id", studentId);

    if (error) {
      console.error("Dars hisoblagichini o'zgartirishda xatolik:", error);
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === studentId
                  ? { ...s, lessonsSincePayment: newCount }
                  : s,
              ),
            }
          : g,
      ),
    );
  };

  // Coinlarni o'zgartirish (Homework/Classwork/Extrawork/Tartib va h.k.).
  // "reason" endi coin_transactions jadvaliga ham yoziladi — shu orqali
  // CoinHistoryModal'da "nima uchun" berilgani/olingani ko'rinadi.
  const adjustCoins = async (groupId, studentId, delta, reason = null) => {
    const group = groups.find((g) => g.id === groupId);
    const student = group?.students.find((s) => s.id === studentId);
    if (!student) return { error: "O'quvchi topilmadi" };

    const newCoins = (Number(student.coins) || 0) + delta;

    const { error } = await supabase
      .from("students")
      .update({ coins: newCoins })
      .eq("id", studentId);

    if (error) {
      console.error("Coinsni o'zgartirishda xatolik:", error);
      return { error: error.message };
    }

    // MUHIM: bu qism avval umuman yo'q edi — shuning uchun coin tarixi
    // doim bo'sh ko'rinardi. Har bir o'zgarish endi sababi bilan yoziladi.
    const { error: historyError } = await supabase
      .from("coin_transactions")
      .insert({
        student_id: studentId,
        group_id: groupId,
        amount: delta,
        reason,
      });

    if (historyError) {
      // Coin allaqachon o'zgargan, faqat tarix yozilmadi — jiddiy emas,
      // lekin keyinchalik tekshirish uchun konsolga chiqaramiz.
      console.error("Coin tarixini yozishda xatolik:", historyError);
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === studentId ? { ...s, coins: newCoins } : s,
              ),
            }
          : g,
      ),
    );

    return { error: null };
  };

  // --- UTILS ---
  const getGroup = (groupId) =>
    groups.find((g) => String(g.id) === String(groupId));

  return (
    <GroupsContext.Provider
      value={{
        groups,
        loading,
        addGroup,
        updateGroup,
        addStudent,
        updateStudent,
        updateStudentPassword,
        addPayment,
        adjustLessonsCount,
        adjustCoins,
        deleteStudents,
        reorderStudents,
        deleteGroups,
        reorderGroups,
        getGroup,
        refresh: fetchGroups,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

// ==========================================
// 3. CUSTOM HOOK
// ==========================================

export function useGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups must be used within a GroupsProvider");
  return ctx;
}

export default GroupsContext;
