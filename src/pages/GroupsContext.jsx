import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../supabaseClient";

const GroupsContext = createContext(null);

function pad2(n) {
  return String(n).padStart(2, "0");
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function GroupsProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

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
            paymentSum: Number(s.payment_sum) || 0,
            paymentHistory: Array.isArray(history) ? history : [],
          };
        }),
    }));

    setGroups(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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

  const addStudent = async (groupId, student) => {
    const group = groups.find((g) => g.id === groupId);
    const position = group ? group.students.length : 0;

    const { data, error } = await supabase
      .from("students")
      .insert({
        group_id: groupId,
        name: student.name,
        surname: student.surname,
        age: student.age ? Number(student.age) : null,
        phone: student.phone,
        position,
        payment_sum: 0,
        payment_history: [],
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
                  paymentSum: 0,
                  paymentHistory: [],
                },
              ],
            }
          : g,
      ),
    );
  };

  const updateStudent = async (groupId, studentId, updates) => {
    const { error } = await supabase
      .from("students")
      .update({
        name: updates.name,
        surname: updates.surname,
        age: updates.age ? Number(updates.age) : null,
        phone: updates.phone,
        payment_sum: updates.paymentSum ?? 0,
      })
      .eq("id", studentId);

    if (error) {
      console.error("Talabani yangilashda xatolik:", error);
      return;
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
                      age: updates.age ? Number(updates.age) : null,
                      phone: updates.phone,
                      paymentSum: updates.paymentSum ?? s.paymentSum,
                    }
                  : s,
              ),
            }
          : g,
      ),
    );
  };

  // Yangi to'lov saqlash (students.payment_history ustuniga yozadi)
  const addPayment = async (groupId, studentId, amount) => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return { error: "Noto'g'ri summa" };

    const group = groups.find((g) => g.id === groupId);
    const student = group?.students.find((s) => s.id === studentId);
    if (!student) return { error: "O'quvchi topilmadi" };

    const newPaymentSum = (Number(student.paymentSum) || 0) + numAmount;
    const newRecord = {
      id: Date.now().toString(),
      amount: numAmount,
      date: todayISO(),
    };
    const updatedHistory = [newRecord, ...(student.paymentHistory || [])];

    const { error: studentError } = await supabase
      .from("students")
      .update({
        payment_sum: newPaymentSum,
        payment_history: updatedHistory,
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
                      paymentSum: newPaymentSum,
                      paymentHistory: updatedHistory,
                    }
                  : s,
              ),
            }
          : g,
      ),
    );

    return { error: null };
  };

  // Davomatda balansni kamaytirish/oshirish uchun
  const adjustPaymentSum = async (groupId, studentId, delta) => {
    const group = groups.find((g) => g.id === groupId);
    const student = group?.students.find((s) => s.id === studentId);
    if (!student) return;

    const newPaymentSum = (Number(student.paymentSum) || 0) + delta;

    const { error } = await supabase
      .from("students")
      .update({ payment_sum: newPaymentSum })
      .eq("id", studentId);

    if (error) {
      console.error("Balansni o'zgartirishda xatolik:", error);
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === studentId ? { ...s, paymentSum: newPaymentSum } : s,
              ),
            }
          : g,
      ),
    );
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
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, students: newStudents } : g)),
    );

    const results = await Promise.all(
      newStudents.map((s, index) =>
        supabase.from("students").update({ position: index }).eq("id", s.id),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed) console.error("Tartibni saqlashda xatolik:", failed.error);
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
    setGroups(newGroups);

    const results = await Promise.all(
      newGroups.map((g, index) =>
        supabase.from("groups").update({ position: index }).eq("id", g.id),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed)
      console.error("Guruhlar tartibini saqlashda xatolik:", failed.error);
  };

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
        addPayment,
        adjustPaymentSum,
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

export function useGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups must be used within a GroupsProvider");
  return ctx;
}

export default GroupsContext;
