import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
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
      <div className="relative min-h-screen w-full flex items-center justify-center bg-[#00173d] overflow-hidden">
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <p className="text-white/70 text-lg font-medium animate-pulse">
          Yuklanmoqda...
        </p>
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
    <div className="relative min-h-screen w-full flex justify-center bg-[#00173d] overflow-hidden">
      {/* Orqa fondagi Liquid Glass doiralari (Glow effect) */}
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 pt-12 pb-10 min-h-screen">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => (formOpen ? setFormOpen(false) : navigate("/"))}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white text-center flex-1 drop-shadow-sm">
            Groups
          </h1>
          <span className="w-12" />
        </div>

        {/* Empty state */}
        {view === "empty" && (
          <div className="my-auto w-full flex flex-col items-center">
            <h1 className="text-4xl font-semibold text-white/70 text-center mb-12 drop-shadow-sm leading-tight">
              Ooops
              <br />
              No groups
            </h1>

            <button
              onClick={() => setFormOpen(true)}
              className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl py-4 shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:bg-white/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
              <span className="text-lg font-semibold text-white">
                Create a group
              </span>
            </button>
          </div>
        )}

        {/* Creation form */}
        {view === "form" && (
          <div className="w-full my-auto rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6">
            <h2 className="text-2xl font-bold text-center text-white mb-6 drop-shadow-sm">
              Creating a group
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Group name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl px-5 py-3.5 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
              />

              <input
                type="text"
                inputMode="numeric"
                placeholder="Lesson time (14:00)"
                value={form.time}
                onChange={handleTimeChange}
                maxLength={5}
                className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl px-5 py-3.5 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
              />

              <input
                type="text"
                placeholder="Lesson days (Mo-We-Fr)"
                value={form.days}
                onChange={handleDaysChange}
                maxLength={8}
                className="w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl px-5 py-3.5 text-white placeholder-white/50 outline-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/30"
              />

              <button
                onClick={handleCreate}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white text-lg font-semibold py-3.5 shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-200 border border-white/20"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Groups list */}
        {view === "list" && (
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-center mb-1">
              <span className="text-sm text-white/60 font-medium">
                {groups.length} Group
              </span>
              <button
                onClick={() => {
                  setEditMode((v) => !v);
                  setSelectedIds([]);
                }}
                className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 text-white font-medium px-4 py-2 transition shadow-sm text-sm"
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
                <div className="flex flex-col gap-3">
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
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-[0.98] text-white font-semibold py-3.5 shadow-[0_4px_20px_rgba(225,29,72,0.4)] transition-all duration-200 border border-white/20"
              >
                Delete ({selectedIds.length})
              </button>
            )}

            {!editMode && (
              <button
                onClick={() => setFormOpen(true)}
                className="w-full mt-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl py-4 shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:bg-white/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                <span className="text-lg font-semibold text-white">
                  Create a group
                </span>
              </button>
            )}
          </div>
        )}

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
