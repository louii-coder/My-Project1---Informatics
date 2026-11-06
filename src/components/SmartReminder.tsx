import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, Play, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { Task } from '../types/index.ts';
import { isToday, isOverdue } from '../utils/calendar.ts';
import { sound } from '../utils/sound.ts';

interface SmartReminderProps {
  tasks: Task[];
  onStartFocus: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
}

export const SmartReminder: React.FC<SmartReminderProps> = ({
  tasks,
  onStartFocus,
  onCompleteTask,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Find urgent tasks: uncompleted tasks due today or overdue
  const uncompletedTasks = tasks.filter((t) => t.status !== 'selesai');
  const overdueTasks = uncompletedTasks.filter((t) => isOverdue(t.dueDate, t.dueTime));
  const todayTasks = uncompletedTasks.filter((t) => isToday(t.dueDate) && !isOverdue(t.dueDate, t.dueTime));

  const urgentTask = overdueTasks[0] || todayTasks[0];

  // Request browser notification
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
      if (res === 'granted' && urgentTask) {
        new Notification(`[StudiPlan] Pengingat Tugas: ${urgentTask.title}`, {
          body: `Batas waktu: ${urgentTask.dueDate} ${urgentTask.dueTime}. Semangat selesaikan!`,
          icon: '/favicon.ico',
        });
      }
    } catch {
      // Notification blocked
    }
  };

  // Periodic audio reminder for urgent task if enabled
  useEffect(() => {
    if (!soundEnabled || !urgentTask) return;
    // Play a friendly soft click alert on mount if there's an urgent task
    const timer = setTimeout(() => {
      sound.playClick();
    }, 1000);
    return () => clearTimeout(timer);
  }, [urgentTask?.id, soundEnabled]);

  if (!urgentTask && overdueTasks.length === 0) {
    return (
      <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
              Hebat! Semua tugas hari ini sudah terkendali
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Tidak ada tugas mendesak atau yang melewati tenggat waktu. Pertahankan konsistensimu!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isTaskOverdue = urgentTask && isOverdue(urgentTask.dueDate, urgentTask.dueTime);

  return (
    <div
      className={`rounded-xl p-4 transition-all border ${
        isTaskOverdue
          ? 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-100'
          : 'bg-amber-50/80 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isTaskOverdue
                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
            }`}
          >
            {isTaskOverdue ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {isTaskOverdue ? 'Mendesak / Lewat Tenggat' : 'Pengingat Pintar Hari Ini'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
              <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                Jam {urgentTask.dueTime || 'Hari ini'}
              </span>
            </div>
            <h4 className="text-sm font-bold mt-0.5">{urgentTask.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Mata Pelajaran: <span className="font-medium">{urgentTask.subject}</span> · Estimasi:{' '}
              <span className="font-mono tabular-nums">{urgentTask.estimatedMinutes} menit</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Matikan Notifikasi Suara' : 'Nyalakan Notifikasi Suara'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {notificationPermission !== 'granted' && (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Aktifkan Lonceng
            </button>
          )}

          <button
            type="button"
            onClick={() => onStartFocus(urgentTask)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Mulai Fokus</span>
          </button>

          <button
            type="button"
            onClick={() => onCompleteTask(urgentTask.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Selesai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
