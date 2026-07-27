import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "./supabaseClient";

const GroupsContext = createContext(null);


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
        .map((s) => ({ ...s, paymentSum: s.payment_sum })),
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
              students: [...g.students, { ...data, paymentSum: data.payment_sum }],
            }
          : g
      )
    );
  };

  const updatePaymentSum = async (groupId, studentId, paymentSum) => {
    const { error } = await supabase
      .from("students")
      .update({ payment_sum: paymentSum || null })
      .eq("id", studentId);

    if (error) {
      console.error("To'lovni yangilashda xatolik:", error);
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === studentId ? { ...s, paymentSum } : s
              ),
            }
          : g
      )
    );
  };

  const deleteStudents = async (groupId, studentIds) => {
    const { error } = await supabase.from("students").delete().in("id", studentIds);

    if (error) {
      console.error("Talabalarni o'chirishda xatolik:", error);
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, students: g.students.filter((s) => !studentIds.includes(s.id)) }
          : g
      )
    );
  };

  const reorderStudents = async (groupId, newStudents) => {
    // UI'ni darhol yangilaymiz, keyin serverga saqlaymiz
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, students: newStudents } : g))
    );

    const results = await Promise.all(
      newStudents.map((s, index) =>
        supabase.from("students").update({ position: index }).eq("id", s.id)
      )
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
    // UI'ni darhol yangilaymiz, keyin serverga saqlaymiz
    setGroups(newGroups);

    const results = await Promise.all(
      newGroups.map((g, index) =>
        supabase.from("groups").update({ position: index }).eq("id", g.id)
      )
    );

    const failed = results.find((r) => r.error);
    if (failed) console.error("Guruhlar tartibini saqlashda xatolik:", failed.error);
  };

  const getGroup = (groupId) =>
    groups.find((g) => String(g.id) === String(groupId));

  return (
    <GroupsContext.Provider
      value={{
        groups,
        loading,
        addGroup,
        addStudent,
        updatePaymentSum,
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