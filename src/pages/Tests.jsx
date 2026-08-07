import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useGroups } from "./GroupsContext";
import { useTests } from "./TestsContext";
import AddTopicModal from "../components/modals/AddTopicModal";
import SendTestModal from "../components/modals/SendTestModal";

export default function Tests() {
  const navigate = useNavigate();
  const { groups, loading: groupsLoading } = useGroups();
  const {
    topics,
    loading: topicsLoading,
    addTopic,
    addCard,
    sendTestToGroup,
  } = useTests();

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [sendCard, setSendCard] = useState(null);
  const [addingCard, setAddingCard] = useState(false);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const handleBack = () => {
    if (selectedTopicId) return setSelectedTopicId(null);
    if (selectedGroupId) return setSelectedGroupId(null);
    navigate("/home");
  };

  const handleAddCard = async () => {
    if (!selectedTopicId || addingCard) return;
    setAddingCard(true);
    const res = await addCard(selectedTopicId);
    setAddingCard(false);

    if (res.error) {
      alert("Xatolik: " + res.error);
      return;
    }

    navigate(`/tests/card/${res.cardId}`);
  };

  const handleCardClick = (card) => {
    if (card.questionCount < 10) {
      navigate(`/tests/card/${card.id}`);
      return;
    }
    setSendCard(card);
  };

  const handleSend = async () => {
    const res = await sendTestToGroup(sendCard.id, selectedGroupId);
    if (!res.error) setSendCard(null);
    return res;
  };

  const headerTitle = selectedTopic ? selectedTopic.name : "Tests";

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#00173d]">
      <div className="w-full max-w-md flex flex-col items-center px-6 pt-14 pb-10">
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
           <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white text-center flex-1">
            {headerTitle}
          </h1>
          <span className="w-14 shrink-0" />
        </div>

        {/* 1-qadam: guruh */}
        {!selectedGroupId && (
          <>
            {groupsLoading && (
              <p className="text-slate-300 text-center">Yuklanmoqda...</p>
            )}

            {!groupsLoading && groups.length === 0 && (
              <div className="w-full rounded-3xl bg-white/90 shadow-sm px-6 py-10">
                <p className="text-slate-600 text-lg font-semibold text-center">
                  Guruhlar mavjud emas
                </p>
              </div>
            )}

            {!groupsLoading && groups.length > 0 && (
              <div className="w-full rounded-3xl bg-white/90 shadow-sm px-4 py-4 flex flex-col gap-4">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className="w-full text-left rounded-2xl border border-slate-800 bg-slate-100/80 px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-200/80 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-slate-900 truncate">
                        {g.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {g.students.length} o'quvchi
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-500 shrink-0">
                      <p>{g.time || "—"}</p>
                      <p>{g.days || "—"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* 2-qadam: mavzu */}
        {selectedGroupId && !selectedTopicId && (
          <>
            {topicsLoading && (
              <p className="text-slate-300 text-center">Yuklanmoqda...</p>
            )}

            {!topicsLoading && (
              <div className="w-full flex flex-col gap-3">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTopicId(t.id)}
                    className="w-full rounded-full bg-white/90 hover:bg-white text-slate-900 font-bold py-4 text-center transition"
                  >
                    {t.name}
                  </button>
                ))}

                <button
                  onClick={() => setShowAddTopic(true)}
                  className="w-full rounded-full border-2 border-dashed border-white/40 text-white font-bold py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition"
                >
                  <Plus className="w-5 h-5" /> Theme
                </button>
              </div>
            )}
          </>
        )}

        {/* 3-qadam: kartalar */}
        {selectedGroupId && selectedTopicId && selectedTopic && (
          <div className="w-full rounded-3xl bg-white/10 px-3 py-4">
            <div className="grid grid-cols-4 gap-3">
              {selectedTopic.cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="aspect-square rounded-2xl bg-slate-100 hover:bg-white flex items-center justify-center text-center px-1 text-sm font-semibold text-slate-900 transition relative"
                >
                  {card.name}
                  {card.questionCount < 10 && (
                    <span className="absolute bottom-1 text-[10px] text-slate-400 font-normal">
                      {card.questionCount}/10
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={handleAddCard}
                disabled={addingCard}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-300 hover:text-white hover:border-white transition"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        <p className="mt-auto pt-16 text-center text-sm text-slate-400/80">
          Copyright © 2026
          <br />
          by Qo&apos;ldoshev Alibek
        </p>
      </div>

      {showAddTopic && (
        <AddTopicModal
          onClose={() => setShowAddTopic(false)}
          onSave={addTopic}
        />
      )}

      {sendCard && (
        <SendTestModal
          topicName={selectedTopic?.name}
          card={sendCard}
          onCancel={() => setSendCard(null)}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
