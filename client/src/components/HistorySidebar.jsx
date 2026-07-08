import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;
export default function HistorySidebar({ onLoadSession, onNewPrompt }) {
  const { userId, isGuest, user } = useContext(AuthContext);
  const [sessions, setSessions]   = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId]   = useState(null);

  const getHeaders = () => isGuest ? { 'x-guest-id': userId } : {};

  // Fetch session list on mount and when userId changes
  useEffect(() => {
    if (!userId) return;
    fetchSessions();
 }, [userId, isGuest]);

  const fetchSessions = async () => {
    setLoadingList(true);
    try {
      const res = await axios.get(`${API}/api/history`, {
        headers: getHeaders(),
        withCredentials: true,
      });
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleClick = async (sessionId) => {
    setActiveId(sessionId);
    try {
      const res = await axios.get(`${API}/api/history/${sessionId}`, {
        headers: getHeaders(),
        withCredentials: true,
      });
      onLoadSession(res.data);
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation(); // don't trigger handleClick
    try {
      await axios.delete(`${API}/api/history/${sessionId}`, {
        headers: getHeaders(),
        withCredentials: true,
      });
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (activeId === sessionId) setActiveId(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-700 flex flex-col h-screen">
      {/* Top: New prompt button */}
      <div className="p-3 border-b border-slate-700">
        <button
          onClick={onNewPrompt}
          className="
            w-full py-2 rounded-lg text-sm font-semibold
            bg-indigo-600 hover:bg-indigo-500 text-white
            transition flex items-center justify-center gap-2
          "
        >
          <span className="text-lg leading-none">+</span> New Prompt
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">
        {loadingList ? (
          <p className="text-xs text-slate-500 text-center mt-8">Loading history…</p>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center mt-8 px-4">
            No sessions yet. Analyze a prompt to get started.
          </p>
        ) : (
          sessions.map((s) => (
            <div
              key={s._id}
              onClick={() => handleClick(s._id)}
              className={`
                group flex items-start justify-between gap-2
                px-3 py-2.5 mx-2 my-0.5 rounded-lg cursor-pointer
                transition text-sm
                ${activeId === s._id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
              `}
            >
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-xs leading-snug">
                  {s.title || 'Untitled'}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {formatDate(s.createdAt)}
                </p>
              </div>
              {/* Delete button — only visible on hover */}
              <button
                onClick={(e) => handleDelete(e, s._id)}
                className="
                  opacity-0 group-hover:opacity-100
                  text-slate-600 hover:text-red-400
                  transition text-xs mt-0.5 flex-shrink-0
                "
                title="Delete session"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom: login prompt for guests */}
      {isGuest && (
        <div className="p-3 border-t border-slate-700">
          <p className="text-[10px] text-slate-500 mb-2 text-center">
            Log in to save history across devices
          </p>
          <a
            href={`${API}/auth/google`}
            className="
              block w-full py-2 rounded-lg text-xs font-semibold text-center
              bg-slate-700 hover:bg-slate-600 text-slate-200
              transition
            "
          >
            Login with Google
          </a>
        </div>
      )}

      {/* Bottom: user info for logged-in */}
      {!isGuest && user && (
        <div className="p-3 border-t border-slate-700">
          <p className="text-[10px] text-slate-400 truncate text-center">{user.name}</p>
        </div>
      )}
    </aside>
  );
}