import { useState } from 'react';

export default function FinalPrompt({ finalPrompt, onStartOver, onSave, saving }) {
  const [copied, setCopied]   = useState(false);
  const [edited, setEdited]   = useState(finalPrompt);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(edited);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = edited;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Split out the 🔑 power keywords line from the rest
  const lines = edited.split('\n');
  const keywordLineIndex = lines.findIndex((l) => l.startsWith('🔑'));
  const mainPrompt = keywordLineIndex !== -1
    ? lines.slice(0, keywordLineIndex).join('\n').trim()
    : edited;
  const keywordLine = keywordLineIndex !== -1 ? lines[keywordLineIndex] : null;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 gap-5">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          Optimized prompt ready
        </div>
        <h2 className="text-xl font-bold text-white">Your Forged Prompt</h2>
        <p className="text-slate-400 text-sm mt-1">
          Copy and paste this into ChatGPT, Claude, Gemini, or any AI tool.
        </p>
      </div>

      {/* Prompt box — editable */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
            Your prompt
          </span>
          <button
            onClick={() => setIsEditing((v) => !v)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            {isEditing ? '✓ Done editing' : '✏️ Edit'}
          </button>
        </div>

        {isEditing ? (
          <textarea
            className="
              w-full p-5 rounded-xl min-h-48
              bg-slate-800 border border-indigo-500
              text-slate-100 text-sm leading-relaxed
              focus:outline-none resize-y font-sans
            "
            value={mainPrompt}
            onChange={(e) => setEdited(
              keywordLine
                ? e.target.value + '\n\n' + keywordLine
                : e.target.value
            )}
          />
        ) : (
          <pre className="
            w-full p-5 rounded-xl
            bg-slate-800 border border-slate-700
            text-slate-100 text-sm leading-relaxed
            whitespace-pre-wrap break-words font-sans
            max-h-72 overflow-y-auto
          ">
            {mainPrompt}
          </pre>
        )}
      </div>

      {/* Power keywords */}
      {keywordLine && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-4 py-4">
          <p className="text-xs text-amber-300 font-semibold mb-2">🔑 Ideas to take this further:</p>
          {keywordLine.replace('🔑 Ideas to take this further:', '').split('•').filter(Boolean).map((idea, i) => (
            <p key={i} className="text-xs text-amber-200 mt-1 pl-2">• {idea.trim()}</p>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleCopy}
          className={`
            w-full py-3 rounded-xl font-semibold text-sm transition
            ${copied
              ? 'bg-green-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }
          `}
        >
          {copied ? '✓ Copied to clipboard!' : 'Copy Prompt'}
        </button>

        <button
          onClick={onSave}
          disabled={saving}
          className="
            w-full py-3 rounded-xl font-semibold text-sm transition
            bg-slate-700 hover:bg-slate-600 text-slate-200
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {saving ? 'Saving…' : 'Save to History'}
        </button>

        <button
          onClick={onStartOver}
          className="w-full py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 transition"
        >
          ← Start over with a new prompt
        </button>
      </div>
    </div>
  );
}