import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

/**
 * client/src/pages/History.jsx
 * Full-page history view at /history.
 * Shows all past sessions as cards.
 * Clicking a card expands it to show the full conversation + final prompt.
 */
export default function History() {
  const { userId, isGuest } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sessions,  setSessions]  = useState([]);
  const [expanded,  setExpanded]  = useState(null); // full session object
  const [loading,   setLoading]   = useState(true);
  const [loadingOne, setLoadingOne] = useState(false);
  const [copied,    setCopied]    = useState(false);

  const getHeaders = () => isGuest ? { 'x-guest-id': userId } : {};

  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/history`, {
        headers: getHeaders(),
        withCredentials: true,
      });
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (sessionId) => {
    // Toggle off if already expanded
    if (expanded?._id === sessionId) {
      setExpanded(null);
      return;
    }
    setLoadingOne(true);
    try {
      const res = await axios.get(`${API}/api/history/${sessionId}`, {
        headers: getHeaders(),
        withCredentials: true,
      });
      setExpanded(res.data);
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoadingOne(false);
    }
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/api/history/${sessionId}`, {
        headers: getHeaders(),
        withCredentials: true,
      });
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (expanded?._id === sessionId) setExpanded(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleCopy = async () => {
    if (!expanded?.finalPrompt) return;
    await navigator.clipboard.writeText(expanded.finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-700">
        <button
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white transition text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold">
          Prompt<span className="text-indigo-400">Forge</span>
          <span className="text-slate-400 font-normal ml-2 text-base">/ History</span>
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-slate-500 text-center mt-16">Loading history…</p>
        ) : sessions.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-slate-500 mb-4">No saved sessions yet.</p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition"
            >
              Analyze your first prompt →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <div key={s._id} className="rounded-xl border border-slate-700 overflow-hidden">
                {/* Session card header */}
                <div
                  onClick={() => handleExpand(s._id)}
                  className="
                    flex items-center justify-between
                    px-4 py-3 cursor-pointer
                    bg-slate-800 hover:bg-slate-750
                    transition
                  "
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.title || 'Untitled'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(s.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={(e) => handleDelete(e, s._id)}
                      className="text-slate-600 hover:text-red-400 transition text-xs"
                    >
                      Delete
                    </button>
                    <span className="text-slate-500 text-xs">
                      {expanded?._id === s._id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded: conversation + final prompt */}
                {expanded?._id === s._id && (
                  <div className="bg-slate-900 border-t border-slate-700 px-4 py-4 flex flex-col gap-4">
                    {loadingOne ? (
                      <p className="text-slate-500 text-sm text-center py-4">Loading…</p>
                    ) : (
                      <>
                        {/* Conversation */}
                        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                          {expanded.conversation
                            .filter((m) => m.role !== 'system')
                            .map((m, i) => (
                              <div
                                key={i}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`
                                  max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap
                                  ${m.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                                  }
                                `}>
                                  {m.content}
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Final prompt */}
                        <div>
                          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                            Final Optimized Prompt
                          </p>
                          <pre className="
                            bg-slate-800 border border-slate-700
                            rounded-xl p-4 text-xs text-slate-100
                            whitespace-pre-wrap break-words font-sans
                            max-h-48 overflow-y-auto
                          ">
                            {expanded.finalPrompt}
                          </pre>
                          <button
                            onClick={handleCopy}
                            className={`
                              mt-2 w-full py-2 rounded-lg text-xs font-semibold transition
                              ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              }
                            `}
                          >
                            {copied ? '✓ Copied!' : 'Copy Prompt'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}