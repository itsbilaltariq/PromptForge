import { useState, useEffect, useRef } from 'react';

export default function ChatWindow({ messages, onSend, onGenerateNow, loading, questionCount }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const visible = messages.filter((m) => m.role !== 'system');

  // Format message content — highlight 💡 keyword lines
  const formatContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
     if (line.startsWith('💡') || line.startsWith('•')) {
  return (
    <p key={i} className={`
      text-xs leading-relaxed
      ${line.startsWith('💡')
        ? 'mt-3 text-indigo-300 font-medium'
        : 'mt-1 text-slate-300 pl-2'
      }
    `}>
      {line}
    </p>
  );
}
      if (line.startsWith('🔑')) {
        return (
          <p key={i} className="mt-2 text-xs text-amber-300 bg-amber-900/30 px-2 py-1 rounded-lg">
            {line}
          </p>
        );
      }
      return <p key={i} className={line === '' ? 'mt-1' : ''}>{line}</p>;
    });
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-full px-4">
      {/* Progress + Generate Now button */}
      <div className="flex items-center justify-between py-3 border-b border-slate-700 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Question {Math.min(questionCount, 5)} of 5
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`w-6 h-1.5 rounded-full transition ${
                  n <= questionCount ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
        {/* Generate Now button — visible after first question */}
        {questionCount >= 1 && (
          <button
            onClick={onGenerateNow}
            disabled={loading}
            className="
              px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-green-700 hover:bg-green-600 text-white
              disabled:opacity-40 disabled:cursor-not-allowed
              transition flex items-center gap-1
            "
          >
            ⚡ Generate Now
          </button>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4">
        {visible.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-sm'
                }
              `}
            >
              {msg.role === 'assistant'
                ? formatContent(msg.content)
                : <p>{msg.content}</p>
              }
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex gap-2 pt-3 border-t border-slate-700">
        <input
          type="text"
          className="
            flex-1 px-4 py-3 rounded-xl text-sm
            bg-slate-800 border border-slate-700
            text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            transition
          "
          placeholder="Type your answer… or 'generate' to finish"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoFocus
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="
            px-5 py-3 rounded-xl text-sm font-semibold
            bg-indigo-600 hover:bg-indigo-500 text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            transition
          "
        >
          Send
        </button>
      </div>
    </div>
  );
}