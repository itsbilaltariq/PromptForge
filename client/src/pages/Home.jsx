import { useState, useContext } from 'react';
import axios from 'axios';
import PromptInput    from '../components/PromptInput';
import ChatWindow     from '../components/ChatWindow';
import FinalPrompt    from '../components/FinalPrompt';
import HistorySidebar from '../components/HistorySidebar';
import Navbar         from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;
const MAX_QUESTIONS = 5;

export default function Home() {
  const { userId, isGuest } = useContext(AuthContext);

  const [phase, setPhase]                 = useState('input');
  const [messages, setMessages]           = useState([]);
  const [finalPrompt, setFinalPrompt]     = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  const getHeaders = () => isGuest ? { 'x-guest-id': userId } : {};

  const callAI = async (history) => {
    const res = await axios.post(
      `${API}/api/chat`,
      { messages: history },
      { headers: getHeaders(), withCredentials: true }
    );
    return res.data.reply;
  };

  // ── Step 1: User submits rough prompt ────────────────────
  const handlePromptSubmit = async (roughPrompt) => {
    setLoading(true);
    try {
      const history = [{ role: 'user', content: roughPrompt }];
      const reply = await callAI(history);
      setMessages([...history, { role: 'assistant', content: reply }]);
      setQuestionCount(1);
      setPhase('chat');
    } catch (err) {
      console.error('AI error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: User answers a question ──────────────────────
  const handleUserReply = async (userText) => {
    const newCount = questionCount + 1;
    const updatedHistory = [...messages, { role: 'user', content: userText }];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      let historyToSend = updatedHistory;

      if (newCount > MAX_QUESTIONS) {
        historyToSend = [
          ...updatedHistory,
          {
            role: 'user',
            content: 'Now generate the final optimized prompt based on all my answers.',
          },
        ];
      }

      const reply = await callAI(historyToSend);
      const finalHistory = [...updatedHistory, { role: 'assistant', content: reply }];
      setMessages(finalHistory);
      setQuestionCount(newCount);

      if (newCount > MAX_QUESTIONS) {
        setFinalPrompt(reply);
        setPhase('result');
      }
    } catch (err) {
      console.error('AI error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Generate Now button ───────────────────────────────────
  const handleGenerateNow = async () => {
    setLoading(true);
    try {
      const historyToSend = [
        ...messages,
        {
          role: 'user',
          content: 'Now generate the final optimized prompt based on all my answers.',
        },
      ];
      const reply = await callAI(historyToSend);
      const finalHistory = [...messages, { role: 'assistant', content: reply }];
      setMessages(finalHistory);
      setFinalPrompt(reply);
      setPhase('result');
    } catch (err) {
      console.error('AI error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Save session ──────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const originalPrompt = messages.find((m) => m.role === 'user')?.content ?? 'Untitled';
      await axios.post(
        `${API}/api/session/save`,
        {
          conversation: messages,
          finalPrompt,
          title: originalPrompt.slice(0, 60),
        },
        { headers: getHeaders(), withCredentials: true }
      );
      alert('Session saved to history!');
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save session.');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────
  const handleStartOver = () => {
    setPhase('input');
    setMessages([]);
    setFinalPrompt('');
    setQuestionCount(0);
  };

  // ── Load past session ─────────────────────────────────────
  const handleLoadSession = (session) => {
    setMessages(session.conversation);
    setFinalPrompt(session.finalPrompt);
    setPhase('result');
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {sidebarOpen && (
        <HistorySidebar
          onLoadSession={handleLoadSession}
          onNewPrompt={handleStartOver}
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-y-auto py-8">
          {phase === 'input' && (
            <>
              <PromptInput onSubmit={handlePromptSubmit} loading={loading} />
              {loading && (
                <p className="text-center text-xs text-slate-500 mt-4">
                  ⏳ First response may take 10–30s on cold start…
                </p>
              )}
            </>
          )}

          {phase === 'chat' && (
            <ChatWindow
              messages={messages}
              onSend={handleUserReply}
              onGenerateNow={handleGenerateNow}
              loading={loading}
              questionCount={questionCount}
            />
          )}

          {phase === 'result' && (
            <FinalPrompt
              finalPrompt={finalPrompt}
              onStartOver={handleStartOver}
              onSave={handleSave}
              saving={saving}
            />
          )}
        </main>
      </div>
    </div>
  );
}