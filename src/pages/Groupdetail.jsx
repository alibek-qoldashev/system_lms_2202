import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Pencil, GripVertical, X } from "lucide-react";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGroups } from "./GroupsContext";

// "1400" -> "14:00" ko'rinishida, faqat raqamlar, soat 00-23, minut 00-59
function formatTimeDigits(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  let hh = digits.slice(0, 2);
  let mm = digits.slice(2, 4);

  if (parseInt(hh, 10) > 23) hh = "23";
  if (mm.length === 2 && parseInt(mm, 10) > 59) mm = "59";

  return `${hh}:${mm}`;
}

// faqat harflar, har 2 harfdan keyin "-" avtomatik, jami 6 harf (3 ta kun)
function formatDaysLetters(raw) {
  const letters = raw.replace(/[^a-zA-Z]/g, "").slice(0, 6);

  const groups = [];
  for (let i = 0; i < letters.length; i += 2) {
    groups.push(letters.slice(i, i + 2));
  }

  const formatted = groups.map((g) => {
    if (g.length === 0) return g;
    if (g.length === 1) return g[0].toUpperCase();
    return g[0].toUpperCase() + g[1].toLowerCase();
  });

  return formatted.join("-");
}

// faqat bitta so'z (probellar olib tashlanadi), birinchi harf katta
function formatSingleWordName(raw) {
  const noSpaces = raw.replace(/\s/g, "");
  if (!noSpaces) return "";
  return noSpaces[0].toUpperCase() + noSpaces.slice(1);
}

// faqat raqam, 2 xonagacha
function formatAge(raw) {
  return raw.replace(/\D/g, "").slice(0, 2);
}

// faqat raqam, 9 xonagacha (telefon +998 dan keyingi qism)
function formatPhoneDigits(raw) {
  return raw.replace(/\D/g, "").slice(0, 9);
}

// Animatsiyali modal: fon gray-blur bo'ladi, oyna scale+fade bilan chiqadi
function Modal({ open, onClose, children }) {
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

function SortableStudentRow({
  student,
  index,
  editMode,
  selected,
  onToggleSelect,
  onView,
  onEdit,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full rounded-2xl border border-slate-800 bg-white/90 px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {editMode && (
          <>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-500 shrink-0 touch-none"
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(student.id)}
              className="w-5 h-5 accent-blue-600 shrink-0"
            />
          </>
        )}

        {editMode ? (
          <span className="font-semibold  text-slate-900 truncate uppercase">
            {index + 1}. {student.name} {student.surname}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onView(student)}
            className="font-semibold text-sm text-slate-900 truncate uppercase text-left hover:text-blue-600 transition"
          >
            {index + 1}. {student.name} {student.surname}
          </button>
        )}
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <span className="text-slate-500 text-xs">
          {student.paymentSum ? `${student.paymentSum} so'm` : "Payment sum"}
        </span>
        {!editMode && (
          <button
            onClick={() => onEdit(student)}
            className="text-slate-800"
            aria-label="Edit student"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

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

        {/* Guruhni edit qilish modali */}
        <Modal open={groupEditOpen} onClose={() => setGroupEditOpen(false)}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Edit group</h3>
            <button
              onClick={() => setGroupEditOpen(false)}
              className="text-slate-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Group name"
              value={groupEditForm.name}
              onChange={(e) =>
                setGroupEditForm({ ...groupEditForm, name: e.target.value })
              }
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Lesson time (14:00)"
              value={groupEditForm.time}
              onChange={(e) =>
                setGroupEditForm({
                  ...groupEditForm,
                  time: formatTimeDigits(e.target.value),
                })
              }
              maxLength={5}
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
            <input
              type="text"
              placeholder="Lesson days (Mo-We-Fr)"
              value={groupEditForm.days}
              onChange={(e) =>
                setGroupEditForm({
                  ...groupEditForm,
                  days: formatDaysLetters(e.target.value),
                })
              }
              maxLength={8}
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />

            <button
              onClick={saveGroupEdit}
              className="w-full mt-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-3 shadow-md transition"
            >
              Save
            </button>
          </div>
        </Modal>

        {/* O'quvchi to'liq ma'lumotini ko'rish modali */}
        <Modal open={!!viewingStudent} onClose={() => setViewingStudent(null)}>
          {viewingStudent && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Student details
                </h3>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="text-slate-500"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-slate-800">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Name</p>
                  <p className="font-semibold">{viewingStudent.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Surname</p>
                  <p className="font-semibold">
                    {viewingStudent.surname || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Age</p>
                  <p className="font-semibold">{viewingStudent.age || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Phone</p>
                  <p className="font-semibold">{viewingStudent.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">
                    Payment sum
                  </p>
                  <p className="font-semibold">
                    {viewingStudent.paymentSum
                      ? `${viewingStudent.paymentSum} so'm`
                      : "—"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const student = viewingStudent;
                  setViewingStudent(null);
                  openStudentEdit(student);
                }}
                className="w-full mt-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-3 shadow-md transition"
              >
                Edit
              </button>
            </>
          )}
        </Modal>

        {/* O'quvchini edit qilish modali */}
        <Modal open={!!editingStudent} onClose={() => setEditingStudent(null)}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Edit student</h3>
            <button
              onClick={() => setEditingStudent(null)}
              className="text-slate-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Student name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  name: formatSingleWordName(e.target.value),
                })
              }
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
            <input
              type="text"
              placeholder="Student surname"
              value={editForm.surname}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  surname: formatSingleWordName(e.target.value),
                })
              }
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Age"
              value={editForm.age}
              onChange={(e) =>
                setEditForm({ ...editForm, age: formatAge(e.target.value) })
              }
              maxLength={2}
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
            <div className="w-full flex items-center rounded-full border border-slate-800 bg-transparent px-6 py-3 gap-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-300 transition">
              <span className="text-slate-500 font-semibold shrink-0">
                +998
              </span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="90 123 45 67"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    phone: formatPhoneDigits(e.target.value),
                  })
                }
                maxLength={9}
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-500"
              />
            </div>
            <input
              type="number"
              placeholder="Payment sum"
              value={editForm.paymentSum}
              onChange={(e) =>
                setEditForm({ ...editForm, paymentSum: e.target.value })
              }
              className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-3 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />

            <button
              onClick={saveStudentEdit}
              className="w-full mt-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-3 shadow-md transition"
            >
              Save
            </button>
          </div>
        </Modal>

        <p className="mt-auto pt-16 text-center text-sm text-slate-400/80">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>
    </div>
  );
}