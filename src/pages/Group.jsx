import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
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
import SortableGroupCard from "../components/SortableGroupCard";
import { formatTimeDigits, formatDaysLetters } from "../utils/formatters";

export default function Group() {
  const navigate = useNavigate();
  const { groups, addGroup, loading, deleteGroups, reorderGroups } =
    useGroups();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    time: "",
    days: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const view = formOpen ? "form" : groups.length === 0 ? "empty" : "list";

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#00173d]">
        <p className="text-slate-200 text-lg font-semibold">Yuklanmoqda...</p>
      </div>
    );
  }

  const handleTimeChange = (e) => {
    setForm({ ...form, time: formatTimeDigits(e.target.value) });
  };

  const handleDaysChange = (e) => {
    setForm({ ...form, days: formatDaysLetters(e.target.value) });
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;

    addGroup({ name: form.name, time: form.time, days: form.days });
    setForm({ name: "", time: "", days: "" });
    setFormOpen(false);
  };

  const toggleSelect = (groupId) => {
    setSelectedIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((i) => i !== groupId)
        : [...prev, groupId],
    );
  };

  const handleDeleteSelected = () => {
    deleteGroups(selectedIds);
    setSelectedIds([]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = groups.findIndex((g) => g.id === active.id);
    const newIndex = groups.findIndex((g) => g.id === over.id);
    reorderGroups(arrayMove(groups, oldIndex, newIndex));
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        <button
          onClick={() => navigate("/home")}
          className="self-start text-slate-200 font-semibold mb-4"
        >
          ← Home
        </button>

        {/* Empty state */}
        {view === "empty" && (
          <>
            <h1 className="text-4xl font-semibold text-slate-300 text-center mt-16">
              Ooops
              <br />
              No groups
            </h1>

            <button
              onClick={() => setFormOpen(true)}
              className="w-full mt-16 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm py-5 shadow-sm hover:bg-white/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={3} />
              <span className="text-xl font-bold text-white">
                Create a group
              </span>
            </button>
          </>
        )}

        {/* Creation form */}
        {view === "form" && (
          <div className="w-full mt-16 rounded-3xl bg-white/95 backdrop-blur-md shadow-lg px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
              Creating a group
            </h2>

            <div className="flex flex-col gap-5">
              <input
                type="text"
                placeholder="Group name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              />

              <input
                type="text"
                inputMode="numeric"
                placeholder="Lesson time (14:00)"
                value={form.time}
                onChange={handleTimeChange}
                maxLength={5}
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              />

              <input
                type="text"
                placeholder="Lesson days (Mo-We-Fr)"
                value={form.days}
                onChange={handleDaysChange}
                maxLength={8}
                className="w-full rounded-full border border-slate-800 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              />

              <button
                onClick={handleCreate}
                className="w-full mt-3 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xl font-bold py-4 shadow-md transition"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Groups list */}
        {view === "list" && (
          <div className="w-full flex flex-col gap-5 mt-4">
            <div className="w-full flex justify-end">
              <button
                onClick={() => {
                  setEditMode((v) => !v);
                  setSelectedIds([]);
                }}
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2.5 shadow-md transition"
              >
                {editMode ? "Done" : "Edit"}
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={groups.map((g) => g.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-5">
                  {groups.map((group) => (
                    <SortableGroupCard
                      key={group.id}
                      group={group}
                      editMode={editMode}
                      selected={selectedIds.includes(group.id)}
                      onToggleSelect={toggleSelect}
                      onOpen={() => navigate(`/groups/${group.id}`)}
                      onLongPress={() => setEditMode(true)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {editMode && selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 shadow-md transition"
              >
                Delete ({selectedIds.length})
              </button>
            )}

            {!editMode && (
              <button
                onClick={() => setFormOpen(true)}
                className="w-full rounded-full border border-white/30 bg-white/10 backdrop-blur-sm py-5 shadow-sm hover:bg-white/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6 text-white" strokeWidth={3} />
                <span className="text-xl font-bold text-white">
                  Create a group
                </span>
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="mt-auto pt-16 text-center text-sm text-slate-400/80">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>
    </div>
  );
}
