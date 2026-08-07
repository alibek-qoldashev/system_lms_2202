import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTests } from "./TestsContext";
import { ArrowLeft } from "lucide-react";

const EMPTY_QUESTION = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "a",
};

export default function CardQuestions() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { getCard, saveQuestions } = useTests();

  const [cardName, setCardName] = useState("");
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, () => ({ ...EMPTY_QUESTION })),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getCard(cardId);
      if (res.error) {
        setLoading(false);
        return;
      }

      setCardName(res.card.name);

      if (res.questions.length > 0) {
        const filled = Array.from({ length: 10 }, (_, i) => {
          const existing = res.questions[i];
          return existing
            ? {
                question: existing.question || "",
                option_a: existing.option_a || "",
                option_b: existing.option_b || "",
                option_c: existing.option_c || "",
                option_d: existing.option_d || "",
                correct_option: existing.correct_option || "a",
              }
            : { ...EMPTY_QUESTION };
        });
        setQuestions(filled);
      }

      setLoading(false);
    };

    load();
  }, [cardId, getCard]);

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const allFilled = questions.every(
    (q) =>
      q.question.trim() &&
      q.option_a.trim() &&
      q.option_b.trim() &&
      q.option_c.trim() &&
      q.option_d.trim(),
  );

  const handleSave = async () => {
    if (!allFilled) return;
    setSaving(true);
    const res = await saveQuestions(cardId, questions);
    setSaving(false);

    if (res.error) {
      alert("Xatolik: " + res.error);
      return;
    }

    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-[#00173d]">
        <p className="text-slate-300">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white text-center flex-1">
            {cardName}
          </h1>
          <span className="w-14 shrink-0" />
        </div>

        <div className="w-full flex flex-col gap-5">
          {questions.map((q, i) => (
            <div key={i} className="rounded-2xl bg-white/95 px-5 py-4">
              <p className="text-sm font-bold text-slate-500 mb-2">
                Savol {i + 1}
              </p>

              <textarea
                value={q.question}
                onChange={(e) => updateQuestion(i, "question", e.target.value)}
                placeholder="Savol matni"
                rows={2}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 mb-3 text-sm"
              />

              {["a", "b", "c", "d"].map((opt) => (
                <div key={opt} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={q.correct_option === opt}
                    onChange={() => updateQuestion(i, "correct_option", opt)}
                    className="accent-blue-600 shrink-0"
                  />
                  <input
                    type="text"
                    value={q[`option_${opt}`]}
                    onChange={(e) =>
                      updateQuestion(i, `option_${opt}`, e.target.value)
                    }
                    placeholder={`Variant ${opt.toUpperCase()}`}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-1">
                To'g'ri javobni chap tomondan belgilang
              </p>
            </div>
          ))}

          <button
            onClick={() => {
              handleSave();
              navigate(-1);
            }}
            disabled={saving || !allFilled}
            className="w-full rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-4 transition"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
