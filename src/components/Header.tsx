import React from 'react';
import { Plus, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewTaskModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTaskModal,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('tasks')}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 text-left flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              S
            </span>
            <span>StudiPlan</span>
          </button>

          {/* Zone 2: 4-5 clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => onSelectTab('tasks')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'tasks' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Tugas Harian
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('schedule')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'schedule' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Jadwal Mingguan
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('calendar')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'calendar' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Kalender
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('charts')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'charts' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Grafik Progres
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('rewards')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'rewards' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Poin &amp; Reward
            </button>
          </nav>

          {/* Zone 3: 1 primary action button & theme toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tugas Baru</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
