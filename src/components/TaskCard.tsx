import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  Share2,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Task, Subtask } from '../types/index.ts';
import { createGoogleCalendarUrl, formatIndonesianDate, isOverdue } from '../utils/calendar.ts';
import { SUBJECT_COLORS } from '../data/initialData.ts';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onAskAIBreakdown: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onToggleSubtask,
  onDeleteTask,
  onEditTask,
  onStartFocus,
  onAskAIBreakdown,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isDone = task.status === 'selesai';
  const overdue = !isDone && isOverdue(task.dueDate, task.dueTime);
  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;
  const subtasksPercent =
    totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const subjectBadgeClass =
    SUBJECT_COLORS[task.subject] ||
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  const priorityBadge = {
    tinggi: 'text-rose-600 dark:text-rose-400 font-medium',
    sedang: 'text-amber-600 dark:text-amber-400 font-medium',
    rendah: 'text-slate-500 dark:text-slate-400',
  }[task.priority];

  const handleGoogleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = createGoogleCalendarUrl(task);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all shadow-xs ${
        isDone
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80'
          : overdue
          ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          aria-label={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
          className={`mt-0.5 shrink-0 transition-transform active:scale-90 ${
            isDone
              ? 'text-emerald-500 dark:text-emerald-400'
              : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-50 dark:fill-emerald-950/40" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Metadata line */}
          <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${subjectBadgeClass}`}
            >
              {task.subject}
            </span>

            <span className="text-slate-400">·</span>

            <span className={priorityBadge}>
              Prioritas {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>

            <span className="text-slate-400">·</span>

            <span className="flex items-center gap-1 font-mono tabular-nums text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {task.estimatedMinutes}m
            </span>

            {overdue && (
              <>
                <span className="text-slate-400">·</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                  Lewat Tenggat
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h4
            className={`text-sm sm:text-base font-semibold leading-snug break-words ${
              isDone
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {task.title}
          </h4>

          {/* Notes preview */}
          {task.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {task.notes}
            </p>
          )}

          {/* Subtasks Progress Bar if available */}
          {totalSubtasksCount > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>
                  Langkah ({completedSubtasksCount}/{totalSubtasksCount})
                </span>
                <span className="font-mono tabular-nums">{subtasksPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${subtasksPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Expanded Subtasks Checklist */}
          {expanded && totalSubtasksCount > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Checklist Pengerjaan:
              </span>
              <div className="space-y-1.5">
                {task.subtasks.map((st: Subtask) => (
                  <label
                    key={st.id}
                    className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onToggleSubtask(task.id, st.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className={st.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                      {st.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
            {/* Due Date & Time */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono tabular-nums">
                {formatIndonesianDate(task.dueDate)} {task.dueTime ? `· ${task.dueTime}` : ''}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1">
              {totalSubtasksCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{expanded ? 'Tutup' : 'Langkah'}</span>
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              {!isDone && (
                <>
                  <button
                    type="button"
                    onClick={() => onStartFocus(task)}
                    title="Mulai Sesi Fokus Pomodoro untuk tugas ini"
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span className="hidden sm:inline">Fokus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAskAIBreakdown(task)}
                    title="Pecah tugas menjadi langkah terukur dengan Asisten AI"
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 rounded transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden sm:inline">Pecah AI</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleGoogleCalendarClick}
                title="Tambahkan ke Google Calendar"
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
              >
                <Share2 className="w-3 h-3" />
                <span className="hidden md:inline">Google Cal</span>
              </button>

              <button
                type="button"
                onClick={() => onEditTask(task)}
                title="Edit Tugas"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                title="Hapus Tugas"
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
