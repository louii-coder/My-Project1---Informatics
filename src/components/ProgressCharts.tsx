import React from 'react';
import { Task, StudentProfile } from '../types/index.ts';
import { isToday } from '../utils/calendar.ts';
import { CheckCircle2, Flame, Award } from 'lucide-react';

interface ProgressChartsProps {
  tasks: Task[];
  profile: StudentProfile;
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ tasks, profile }) => {
  // Statistics calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'selesai').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'proses').length;
  const pendingTasks = tasks.filter((t) => t.status === 'belum').length;
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Today stats
  const todayTasks = tasks.filter((t) => isToday(t.dueDate));
  const todayDone = todayTasks.filter((t) => t.status === 'selesai').length;
  const todayPercent = todayTasks.length > 0 ? Math.round((todayDone / todayTasks.length) * 100) : 0;

  // Last 7 days breakdown calculation
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const now = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    const tasksOnDay = tasks.filter((t) => t.dueDate === dateStr);
    const doneOnDay = tasksOnDay.filter((t) => t.status === 'selesai').length;
    const totalOnDay = tasksOnDay.length;

    return {
      dateStr,
      dayName,
      isCurrentDay: i === 6,
      done: doneOnDay,
      total: totalOnDay,
    };
  });

  const maxDailyTasks = Math.max(3, ...past7Days.map((d) => d.total));

  // Subject workload distribution
  const subjectMap = new Map<string, { total: number; completed: number; minutes: number }>();
  tasks.forEach((t) => {
    const existing = subjectMap.get(t.subject) || { total: 0, completed: 0, minutes: 0 };
    existing.total += 1;
    existing.minutes += t.estimatedMinutes || 30;
    if (t.status === 'selesai') existing.completed += 1;
    subjectMap.set(t.subject, existing);
  });

  const subjectList = Array.from(subjectMap.entries())
    .map(([subject, data]) => ({ subject, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tugas Selesai</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
              {completedTasks}
              <span className="text-xs text-slate-400 font-sans font-normal ml-1">/ {totalTasks}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tingkat penyelesaian: {overallPercent}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Streak Belajar</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
              {profile.streak}
              <span className="text-sm font-sans font-normal text-slate-500">Hari</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Konsistensi harian aktif
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Poin XP</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
              {profile.points}
              <span className="text-xs font-sans font-normal text-slate-500 ml-1">XP</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bisa ditukar reward
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Waktu Belajar</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400 mt-1">
              {Math.round(profile.studyMinutesTotal / 60)}
              <span className="text-xs font-sans font-normal text-slate-500 ml-1">Jam {profile.studyMinutesTotal % 60}m</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sesi produktif tercatat
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold font-mono">⏱️</span>
          </div>
        </div>
      </div>

      {/* Main Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Radial Ring & Progress Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Pencapaian Hari Ini
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {todayDone} / {todayTasks.length} Tugas
              </span>
            </div>

            <div className="flex flex-col items-center justify-center my-6">
              {/* Radial Progress Ring SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Track circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  {/* Filled progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - todayPercent / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {todayPercent}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Tuntas Hari Ini
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                Selesai
              </span>
              <span className="font-mono tabular-nums font-semibold">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                Sedang Dikerjakan
              </span>
              <span className="font-mono tabular-nums font-semibold">{inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                Belum Dimulai
              </span>
              <span className="font-mono tabular-nums font-semibold">{pendingTasks}</span>
            </div>
          </div>
        </div>

        {/* Center Column: 7-Day Weekly Activity Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Aktivitas 7 Hari Terakhir
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tugas harian
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualisasi jumlah tugas selesai vs target per hari
            </p>

            {/* Vertical Bar Chart */}
            <div className="h-44 mt-6 flex items-end justify-between gap-2 pt-6">
              {past7Days.map((day) => {
                const heightPercent = day.total > 0 ? Math.round((day.total / maxDailyTasks) * 100) : 10;
                const donePercent = day.total > 0 ? Math.round((day.done / day.total) * 100) : 0;

                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                      {day.done} selesai dari {day.total} tugas
                    </div>

                    {/* Bar background */}
                    <div
                      className={`w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all ${
                        day.isCurrentDay
                          ? 'ring-2 ring-indigo-500/40 bg-slate-100 dark:bg-slate-800'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                      style={{ height: `${Math.max(12, heightPercent)}%` }}
                    >
                      {/* Done portion */}
                      <div
                        className="w-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                        style={{ height: `${donePercent}%` }}
                      />
                    </div>

                    <span
                      className={`text-[11px] font-mono mt-2 ${
                        day.isCurrentDay
                          ? 'font-bold text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
              Selesai
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />
              Tersisa
            </span>
          </div>
        </div>

        {/* Right Column: Subject Workload Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Beban Per Mata Pelajaran
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {subjectList.length} Mapel
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Distribusi tugas dan estimasi waktu belajar
            </p>

            <div className="space-y-3.5 mt-5">
              {subjectList.map((item) => {
                const percent = totalTasks > 0 ? Math.round((item.total / totalTasks) * 100) : 0;
                return (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                        {item.subject}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {item.total} tugas · {item.minutes}m
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata fokus per mapel</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
              {Math.round(profile.studyMinutesTotal / Math.max(1, subjectList.length))} Menit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
