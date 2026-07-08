import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

/**
 * client/src/components/Navbar.jsx
 * Top bar with:
 *  - Sidebar toggle button (hamburger)
 *  - PromptForge branding
 *  - Login/Logout button (right side)
 */
export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, isGuest, logout } = useContext(AuthContext);

  return (
    <header className="
      flex items-center justify-between
      px-4 py-3
      bg-slate-900 border-b border-slate-700
      flex-shrink-0
    ">
      {/* Left: sidebar toggle + branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="
            p-1.5 rounded-lg text-slate-400
            hover:text-white hover:bg-slate-700
            transition
          "
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {/* Hamburger icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-base font-bold text-white tracking-tight">
          Prompt<span className="text-indigo-400">Forge</span>
        </span>
      </div>

      {/* Right: auth button */}
      <div>
        {isGuest ? (
          /* Guest → show Login button */
          <a
            href={`${API}/auth/google`}
            className="
              flex items-center gap-2
              px-4 py-1.5 rounded-lg text-sm font-semibold
              bg-indigo-600 hover:bg-indigo-500 text-white
              transition
            "
          >
            {/* Google icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </a>
        ) : (
          /* Logged in → show name + logout */
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="
                px-3 py-1.5 rounded-lg text-sm font-medium
                text-slate-400 hover:text-white hover:bg-slate-700
                transition
              "
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}