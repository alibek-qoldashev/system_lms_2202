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
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#00173d] px-6">
        <p className="text-slate-200 text-lg font-semibold">Guruh topilmadi</p>
        <button
          onClick={() => navigate("/groups")}
          className="rounded-full bg-blue-500 text-white px-6 py-3 font-bold"
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
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        <button
          onClick={() => navigate("/groups")}
          className="self-start text-slate-200 font-semibold mb-4"
        >
          ← Groups
        </button>

        <div className="w-full flex items-center justify-center relative">
          <h1 className="text-3xl font-bold text-white text-center px-8">
            {group.name}
          </h1>
          <button
            onClick={openGroupEdit}
            className="absolute right-0 text-white"
            aria-label="Edit group"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        {/* Empty state */}
        {!formOpen && group.students.length === 0 && (
          <>
            <h2 className="text-4xl font-semibold text-slate-300 text-center mt-10">
              Ooops
              <br />
              No Students
            </h2>

            <div className="w-full mt-10 rounded-3xl bg-white/90 backdrop-blur-sm shadow-sm px-6 py-6">
              <button
                onClick={() => setFormOpen(true)}
                className="w-full rounded-full border border-slate-800 py-4 flex items-center justify-center gap-2 hover:bg-slate-100 transition"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                <span className="text-lg font-bold text-slate-900">
                  Add a student
                </span>
              </button>
            </div>
          </>
        )}

        {/* Student form */}
        {formOpen && (
          <div className="w-full mt-10 rounded-3xl bg-white/95 backdrop-blur-md shadow-lg px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
              Adding student
            </h2>

            <div className="flex flex-col gap-5">
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
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
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
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
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
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              />
              <div className="w-full flex items-center rounded-full border border-slate-800 bg-transparent px-6 py-4 gap-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-300 transition">
                <span className="text-slate-500 font-semibold shrink-0">
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
                  className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-500"
                />
              </div>

              <button
                onClick={handleAddStudent}
                className="w-full mt-3 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xl font-bold py-4 shadow-md transition"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Students list */}
        {!formOpen && group.students.length > 0 && (
          <div className="w-full mt-10 rounded-3xl bg-white/90 backdrop-blur-sm shadow-sm px-6 py-6 flex flex-col gap-4">
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
                className="w-full rounded-full border border-slate-800 py-4 flex items-center justify-center gap-2 hover:bg-slate-100 transition"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                <span className="text-lg font-bold text-slate-900">
                  Add a student
                </span>
              </button>
            )}

            <div className="flex justify-end gap-3 mt-2">
              {editMode && selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 shadow-md transition"
                >
                  Delete ({selectedIds.length})
                </button>
              )}
              <button
                onClick={() => {
                  setEditMode((v) => !v);
                  setSelectedIds([]);
                }}
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 shadow-md transition"
              >
                {editMode ? "Done" : "Edit"}
              </button>
            </div>
          </div>
        )}

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

        <p className="mt-auto pt-16 text-center text-sm text-slate-400/80">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>
    </div>
  );
}
