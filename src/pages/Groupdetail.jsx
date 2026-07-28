import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useGroups } from "./GroupsContext";
import { supabase } from "../supabaseClient";
import SortableStudentRow from "../components/SortableStudentRow";
import {
  GroupEditModal,
  StudentViewModal,
  StudentEditModal,
  CoinHistoryModal,
} from "../components/modals";
import {
  formatSingleWordName,
  formatAge,
  formatPhoneDigits,
} from "../utils/formatters";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getGroup,
    updateGroup,
    addStudent,
    updateStudent,
    deleteStudents,
    reorderStudents,
  } = useGroups();

  const group = getGroup(id);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    age: "",
    phone: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Guruhni edit qilish modali
  const [groupEditOpen, setGroupEditOpen] = useState(false);
  const [groupEditForm, setGroupEditForm] = useState({
    name: "",
    time: "",
    days: "",
  });

  // O'quvchi to'liq ma'lumotini ko'rish modali
  const [viewingStudent, setViewingStudent] = useState(null);

  // O'quvchini edit qilish modali
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    surname: "",
    age: "",
    phone: "",
    paymentSum: "",
  });

  // Coin tarixi modali
  const [coinHistoryStudent, setCoinHistoryStudent] = useState(null);
  const [coinHistory, setCoinHistory] = useState([]);
  const [coinHistoryLoading, setCoinHistoryLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  if (!group) {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#00173d] px-6 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <p className="text-white/80 text-lg font-medium drop-shadow-sm">
          Guruh topilmadi
        </p>
        <button
          onClick={() => navigate("/groups")}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 border border-white/20 text-white px-6 py-3 font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition active:scale-95"
        >
          Groups ga qaytish
        </button>
      </div>
    );
  }

  const handleAddStudent = () => {
    if (!form.name.trim()) return;
    addStudent(group.id, {
      name: form.name,
      surname: form.surname,
      age: form.age,
      phone: form.phone ? `+998${form.phone}` : "",
    });
    setForm({ name: "", surname: "", age: "", phone: "" });
    setFormOpen(false);
  };

  const toggleSelect = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((i) => i !== studentId)
        : [...prev, studentId],
    );
  };

  const handleDeleteSelected = () => {
    deleteStudents(group.id, selectedIds);
    setSelectedIds([]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = group.students.findIndex((s) => s.id === active.id);
    const newIndex = group.students.findIndex((s) => s.id === over.id);
    reorderStudents(group.id, arrayMove(group.students, oldIndex, newIndex));
  };

  // --- Guruhni edit qilish ---
  const openGroupEdit = () => {
    setGroupEditForm({
      name: group.name || "",
      time: group.time || "",
      days: group.days || "",
    });
    setGroupEditOpen(true);
  };

  const saveGroupEdit = () => {
    if (!groupEditForm.name.trim()) return;
    updateGroup(group.id, groupEditForm);
    setGroupEditOpen(false);
  };

  // --- O'quvchini edit qilish ---
  const openStudentEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || "",
      surname: student.surname || "",
      age: student.age ? String(student.age) : "",
      phone: (student.phone || "").replace("+998", ""),
      paymentSum: student.paymentSum || "",
    });
  };

  const saveStudentEdit = () => {
    if (!editForm.name.trim() || !editingStudent) return;
    updateStudent(group.id, editingStudent.id, {
      name: editForm.name,
      surname: editForm.surname,
      age: editForm.age,
      phone: editForm.phone ? `+998${editForm.phone}` : "",
      paymentSum: editForm.paymentSum,
    });
    setEditingStudent(null);
  };

  // --- Coin tarixi ---
  const openCoinHistory = async (student) => {
    setCoinHistoryStudent(student);
    setCoinHistory([]);
    setCoinHistoryLoading(true);

    const { data, error } = await supabase
      .from("coin_transactions")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Coin tarixini yuklashda xatolik:", error);
      setCoinHistory([]);
    } else {
      setCoinHistory(data || []);
    }

    setCoinHistoryLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center bg-[#00173d] overflow-hidden">
      {/* Orqa fondagi Liquid Glass Glow doiralari */}
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 pt-12 pb-10 min-h-screen">
        {/* Header Back Button */}
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={() =>
              formOpen ? setFormOpen(false) : navigate("/groups")
            }
            className="text-white/80 hover:text-white font-medium transition flex items-center gap-1"
          >
            ← {formOpen ? "Group" : "Groups"}
          </button>
        </div>

        {/* Group Name Banner */}
        <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-3xl flex items-center justify-between relative shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <h1 className="text-xl font-bold text-white text-center w-full px-8 drop-shadow-sm truncate">
            {group.name}
          </h1>
          <button
            onClick={openGroupEdit}
            className="absolute right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 p-2 rounded-2xl transition backdrop-blur-md active:scale-95"
            aria-label="Edit group"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Empty state */}
        {!formOpen && group.students.length === 0 && (
          <div className="my-auto w-full flex flex-col items-center">
            <h2 className="text-4xl font-semibold text-white/70 text-center mb-10 drop-shadow-sm leading-tight">
              Ooops
              <br />
              No Students
            </h2>

            <button
              onClick={() => setFormOpen(true)}
              className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl py-4 shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:bg-white/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
              <span className="text-lg font-semibold text-white">
                Add a student
              </span>
            </button>
          </div>
        )}

        {/* Student creation form */}
        {formOpen && (
          <div className="w-full my-auto rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6">
            <h2 className="text-2xl font-bold text-center text-white mb-6 drop-shadow-sm">
              Adding student
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Student name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: formatSingleWordName(e.target.value),
                  })
                }
                className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl px-5 py-3.5 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                placeholder="Student surname"
                value={form.surname}
                onChange={(e) =>
                  setForm({
                    ...form,
                    surname: formatSingleWordName(e.target.value),
                  })
                }
                className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl px-5 py-3.5 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Age"
                value={form.age}
                onChange={(e) =>
                  setForm({ ...form, age: formatAge(e.target.value) })
                }
                maxLength={2}
                className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl px-5 py-3.5 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
              />

              <div className="w-full flex items-center rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl px-5 py-3.5 gap-2 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] focus-within:bg-white/20 focus-within:border-white/60 focus-within:ring-2 focus-within:ring-white/30 transition-all duration-300">
                <span className="text-white/60 font-semibold text-sm shrink-0">
                  +998
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="90 123 45 67"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: formatPhoneDigits(e.target.value),
                    })
                  }
                  maxLength={9}
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/50 text-sm"
                />
              </div>

              <button
                onClick={handleAddStudent}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white text-lg font-semibold py-3.5 shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-200 border border-white/20"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Students list */}
        {!formOpen && group.students.length > 0 && (
          <div className="w-full mt-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-5 flex flex-col gap-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={group.students.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {group.students.map((student, index) => (
                    <SortableStudentRow
                      key={student.id}
                      student={student}
                      index={index}
                      editMode={editMode}
                      selected={selectedIds.includes(student.id)}
                      onToggleSelect={toggleSelect}
                      onView={setViewingStudent}
                      onEdit={openStudentEdit}
                      onCoinsClick={openCoinHistory}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {!editMode && (
              <button
                onClick={() => setFormOpen(true)}
                className="w-full mt-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-white/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                <span className="text-base font-semibold text-white">
                  Add a student
                </span>
              </button>
            )}

            <div className="flex justify-end gap-3 mt-1">
              {editMode && selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white font-semibold px-5 py-2.5 shadow-[0_4px_15px_rgba(225,29,72,0.4)] transition text-sm border border-white/20"
                >
                  Delete ({selectedIds.length})
                </button>
              )}
              <button
                onClick={() => {
                  setEditMode((v) => !v);
                  setSelectedIds([]);
                }}
                className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 text-white font-medium px-6 py-2.5 transition shadow-sm text-sm"
              >
                {editMode ? "Done" : "Edit"}
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <GroupEditModal
          open={groupEditOpen}
          onClose={() => setGroupEditOpen(false)}
          form={groupEditForm}
          setForm={setGroupEditForm}
          onSave={saveGroupEdit}
        />

        <StudentViewModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onEdit={(student) => {
            setViewingStudent(null);
            openStudentEdit(student);
          }}
        />

        <StudentEditModal
          open={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          form={editForm}
          setForm={setEditForm}
          onSave={saveStudentEdit}
        />

        <CoinHistoryModal
          student={coinHistoryStudent}
          history={coinHistory}
          loading={coinHistoryLoading}
          onClose={() => setCoinHistoryStudent(null)}
        />

        {/* Footer */}
        <p className="mt-auto pt-16 text-center text-xs text-white/50">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>
    </div>
  );
}
