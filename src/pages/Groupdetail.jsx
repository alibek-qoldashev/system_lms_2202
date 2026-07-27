import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Pencil, GripVertical } from "lucide-react";
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

function SortableStudentRow({
  student,
  index,
  editMode,
  selected,
  onToggleSelect,
  onEditPayment,
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
        <span className="font-semibold text-slate-900 truncate uppercase">
          {index + 1}. {student.name} {student.surname}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-slate-500 text-sm">
          {student.paymentSum ? `${student.paymentSum} so'm` : "Payment sum"}
        </span>
        {!editMode && (
          <button
            onClick={() => onEditPayment(student)}
            className="text-slate-800"
            aria-label="Edit payment sum"
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
    addStudent,
    deleteStudents,
    reorderStudents,
    updatePaymentSum,
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
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [paymentInput, setPaymentInput] = useState("");

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
    addStudent(group.id, form);
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

  const openPaymentEdit = (student) => {
    setEditingPaymentId(student.id);
    setPaymentInput(student.paymentSum || "");
  };

  const savePayment = () => {
    updatePaymentSum(group.id, editingPaymentId, paymentInput);
    setEditingPaymentId(null);
    setPaymentInput("");
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

        <h1 className="text-3xl font-bold text-white text-center">
          {group.name}
        </h1>git add .
git commit -m "Fix file name casing for GroupsContext"
git push origin main

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
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              />
              <input
                type="text"
                placeholder="Student surname"
                value={form.surname}
                onChange={(e) => setForm({ ...form, surname: e.target.value })}
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              />
              <input
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              />

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
                      onEditPayment={openPaymentEdit}
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

        {/* Payment sum edit modal */}
        {editingPaymentId && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-6 z-50">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Payment sum
              </h3>
              <input
                type="number"
                value={paymentInput}
                onChange={(e) => setPaymentInput(e.target.value)}
                placeholder="Payment sum"
                autoFocus
                className="w-full rounded-full border border-slate-800 px-6 py-3 mb-4 outline-none focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingPaymentId(null)}
                  className="flex-1 rounded-full border border-slate-400 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={savePayment}
                  className="flex-1 rounded-full bg-blue-500 text-white py-3 font-bold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-auto pt-16 text-center text-sm text-slate-400/80">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>
    </div>
  );
}
// alibek-qoldashev
