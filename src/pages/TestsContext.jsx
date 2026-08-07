import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../supabaseClient";

const TestsContext = createContext(null);

export function TestsProvider({ children }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = useCallback(async () => {
    setLoading(true);

    const { data: topicsData, error: topicsError } = await supabase
      .from("test_topics")
      .select("*")
      .order("position", { ascending: true });

    if (topicsError) {
      console.error("Mavzularni yuklashda xatolik:", topicsError);
      setLoading(false);
      return;
    }

    const { data: cardsData, error: cardsError } = await supabase
      .from("test_cards")
      .select("*")
      .order("position", { ascending: true });

    if (cardsError) console.error("Kartalarni yuklashda xatolik:", cardsError);

    const { data: questionsData, error: questionsError } = await supabase
      .from("test_questions")
      .select("card_id");

    if (questionsError)
      console.error("Savollarni yuklashda xatolik:", questionsError);

    const questionCounts = {};
    (questionsData || []).forEach((q) => {
      questionCounts[q.card_id] = (questionCounts[q.card_id] || 0) + 1;
    });

    const merged = (topicsData || []).map((t) => ({
      ...t,
      cards: (cardsData || [])
        .filter((c) => c.topic_id === t.id)
        .map((c) => ({ ...c, questionCount: questionCounts[c.id] || 0 })),
    }));

    setTopics(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const addTopic = async (name) => {
    const { error } = await supabase
      .from("test_topics")
      .insert({ name, position: topics.length + 1 });

    if (error) {
      console.error("Mavzu qo'shishda xatolik:", error);
      return { error: error.message };
    }

    await fetchTopics();
    return { error: null };
  };

  const addCard = async (topicId) => {
    const topic = topics.find((t) => t.id === topicId);
    const position = topic ? topic.cards.length + 1 : 1;
    const name = `Card ${position}`;

    const { data, error } = await supabase
      .from("test_cards")
      .insert({ topic_id: topicId, name, position })
      .select()
      .single();

    if (error) {
      console.error("Karta qo'shishda xatolik:", error);
      return { error: error.message, cardId: null };
    }

    await fetchTopics();
    return { error: null, cardId: data.id };
  };

  const getCard = async (cardId) => {
    const { data: card, error: cardError } = await supabase
      .from("test_cards")
      .select("*")
      .eq("id", cardId)
      .single();

    if (cardError) return { error: cardError.message };

    const { data: questions, error: qError } = await supabase
      .from("test_questions")
      .select("*")
      .eq("card_id", cardId)
      .order("position", { ascending: true });

    if (qError) return { error: qError.message };

    return { card, questions: questions || [], error: null };
  };

  const saveQuestions = async (cardId, questions) => {
    const { error: deleteError } = await supabase
      .from("test_questions")
      .delete()
      .eq("card_id", cardId);

    if (deleteError) {
      console.error("Eski savollarni o'chirishda xatolik:", deleteError);
      return { error: deleteError.message };
    }

    const rows = questions.map((q, i) => ({
      card_id: cardId,
      position: i + 1,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
    }));

    const { error: insertError } = await supabase
      .from("test_questions")
      .insert(rows);

    if (insertError) {
      console.error("Savollarni saqlashda xatolik:", insertError);
      return { error: insertError.message };
    }

    await fetchTopics();
    return { error: null };
  };

  const sendTestToGroup = async (cardId, groupId) => {
    const { error } = await supabase
      .from("test_assignments")
      .insert({ card_id: cardId, group_id: groupId });

    if (error) {
      console.error("Testni yuborishda xatolik:", error);
      return { error: error.message };
    }

    return { error: null };
  };

  return (
    <TestsContext.Provider
      value={{
        topics,
        loading,
        addTopic,
        addCard,
        getCard,
        saveQuestions,
        sendTestToGroup,
        refresh: fetchTopics,
      }}
    >
      {children}
    </TestsContext.Provider>
  );
}

export function useTests() {
  const ctx = useContext(TestsContext);
  if (!ctx) throw new Error("useTests must be used within TestsProvider");
  return ctx;
}
