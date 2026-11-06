import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { Task } from '../types/index.ts';
import { sound } from '../utils/sound.ts';
import { triggerConfetti } from '../utils/gamification.ts';

interface PomodoroTimerProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onFinishFocusSession: (minutes: number, taskId?: string) => void;
}

type Mode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_CONFIG = {
  focus: { title: 'Sesi Fokus', durationMinutes: 25, xp: 30 },
  shortBreak: { title: 'Istirahat Singkat', durationMinutes: 5, xp: 5 },
  longBreak: { title: 'Istirahat Panjang', durationMinutes: 15, xp: 10 },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  activeTask,
  onSelectTask,
  onFinishFocusSession,
}) => {
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const totalTime = MODE_CONFIG[mode].durationMinutes * 60;
  const progressPercent = Math.round(((totalTime - timeLeft) / totalTime) * 100);

  const uncompletedTasks = tasks.filter((t) => t.status !== 'selesai');

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      sound.playTimerAlert();
      triggerConfetti('celebration');

      // Award XP
      const sessionMinutes = MODE_CONFIG[mode].durationMinutes;
      onFinishFocusSession(sessionMinutes, activeTask?.id);

      if (mode === 'focus') {
        setCompletedSessionsCount((c) => c + 1);
        // Switch to break
        if ((completedSessionsCount + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(MODE_CONFIG.longBreak.durationMinutes * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(MODE_CONFIG.shortBreak.durationMinutes * 60);
        }
      } else {
        setMode('focus');
        setTimeLeft(MODE_CONFIG.focus.durationMinutes * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, activeTask, completedSessionsCount, onFinishFocusSession]);

  const handleToggleTimer = () => {
    sound.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(MODE_CONFIG[mode].durationMinutes * 60);
  };

  const handleSwitchMode = (newMode: Mode) => {
    sound.playClick();
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(MODE_CONFIG[newMode].durationMinutes * 60);
  };

  const handleToggleAmbient = () => {
    const nextState = !isAmbientOn;
    setIsAmbientOn(nextState);
    sound.toggleAmbientRain(nextState);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Zona Fokus Produktivitas
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Pomodoro Focus Timer (+30 XP)
          </h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => handleSwitchMode('focus')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'focus'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Fokus 25m
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('shortBreak')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Rehat 5m
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('longBreak')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Rehat 15m
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-6">
        {/* Left: Big Circular Timer Display */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={mode === 'focus' ? '#4f46e5' : '#10b981'}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            {/* Time readout */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-mono font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
                {timeFormatted}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {MODE_CONFIG[mode].title}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleToggleTimer}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mulai Sesi</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Reset Timer"
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Active Task Linking & Ambient Noise */}
        <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hubungkan Tugas yang Sedang Dikerjakan:
            </label>
            <select
              value={activeTask?.id || ''}
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value) || null;
                onSelectTask(found);
              }}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="">-- Fokus Umum (Belajar Bebas) --</option>
              {uncompletedTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.subject}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {activeTask && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Tugas Aktif:
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {activeTask.title}
              </p>
              {activeTask.notes && (
                <p className="text-slate-500 text-[11px] line-clamp-2">
                  {activeTask.notes}
                </p>
              )}
            </div>
          )}

          {/* Ambient Sound Controller */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                {isAmbientOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Suara Hujan Relaksasi
                </span>
                <span className="text-[11px] text-slate-500">
                  {isAmbientOn ? 'Sedang berputar (Membantu konsentrasi)' : 'Mati'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAmbient}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isAmbientOn
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isAmbientOn ? 'Matikan' : 'Putar Audio'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Sesi Fokus Hari Ini:{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
            {completedSessionsCount} kali
          </span>
        </span>
        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Selesaikan sesi untuk mendapatkan +30 Poin XP!
        </span>
      </div>
    </div>
  );
};
