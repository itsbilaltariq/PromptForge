import { useState } from 'react';

/**
 * client/src/components/PromptInput.jsx
 * Phase: 'input'
 * User pastes their rough prompt here and clicks Analyze.
 * Parent (Home.jsx) receives the prompt via onSubmit().
 */
export default function PromptInput({ onSubmit, loading }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto mt-16 px-4">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Prompt<span className="text-indigo-400">Forge</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Paste a rough coding prompt — we'll turn it into something precise.
        </p>
      </div>

      {/* Textarea */}
      <textarea
        className="
          w-full h-48 p-4 rounded-xl
          bg-slate-800 border border-slate-700
          text-slate-100 placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          resize-none text-sm leading-relaxed
          transition
        "
        placeholder={`e.g. "Make a function that sorts a list of users"`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !prompt.trim()}
        className="
          w-full py-3 rounded-xl font-semibold text-sm
          bg-indigo-600 hover:bg-indigo-500
          disabled:opacity-40 disabled:cursor-not-allowed
          text-white transition
        "
      >
        {loading ? 'Analyzing…' : 'Analyze Prompt →'}
      </button>

      <p className="text-center text-xs text-slate-600">
        Ctrl+Enter to submit
      </p>
    </div>
  );
}
