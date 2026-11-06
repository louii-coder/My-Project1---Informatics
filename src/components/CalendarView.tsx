import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Task, ScheduleItem } from '../types/index.ts';
import { exportToIcs, createGoogleCalendarUrl, formatIndonesianDate } from '../utils/calendar.ts';
import { SUBJECT_COLORS } from '../data/initialData.ts';

interface CalendarViewProps {
  tasks: Task[];
  scheduleItems: ScheduleItem[];
  onAddTaskOnDate: (dateStr: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  scheduleItems,
  onAddTaskOnDate,
  onToggleTaskStatus,
  onStartFocus,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar cells
  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: false });
  }

  // Current month days
  const todayStr = new Date().toISOString().split('T')[0];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete grid (42 cells max for 6 rows)
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells && calendarCells.length < 35; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: false });
  }

  // Selected date tasks
  const selectedDateTasks = tasks.filter((t) => t.dueDate === selectedDateStr);

  // Day of week name for selected date
  const selDateObj = new Date(selectedDateStr);
  const indonesianDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const selDayName = indonesianDayNames[selDateObj.getDay()] as any;
  const dayScheduleItems = scheduleItems.filter((s) => s.day === selDayName);

  return (
    <div className="space-y-6">
      {/* Header and Sync Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Kalender Belajar &amp; Tugas
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sinkronisasi jadwal belajar ke Google Calendar atau ekspor ke perangkat HP / Laptop
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Hari Ini
          </button>

          <button
            type="button"
            onClick={() => exportToIcs(tasks, scheduleItems)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor iCal (.ics)</span>
          </button>

          <button
            type="button"
            onClick={() => onAddTaskOnDate(selectedDateStr)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah di Tanggal Ini</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Calendar Grid (2 cols) & Day Agenda (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell) => {
              const dayTasks = tasks.filter((t) => t.dueDate === cell.dateStr);
              const isSelected = cell.dateStr === selectedDateStr;
              const hasTasks = dayTasks.length > 0;
              const allDone = hasTasks && dayTasks.every((t) => t.status === 'selesai');

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[64px] sm:min-h-[76px] p-1.5 rounded-lg text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                      : cell.isToday
                      ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/10'
                      : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${!cell.isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        cell.isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]'
                          : isSelected
                          ? 'font-bold text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasTasks && (
                      <span
                        className={`text-[10px] font-mono tabular-nums px-1 rounded ${
                          allDone
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                        }`}
                      >
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Mini Badges in Cell */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] truncate px-1 py-0.5 rounded leading-tight ${
                          t.status === 'selesai'
                            ? 'line-through text-slate-400 bg-slate-100 dark:bg-slate-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-slate-400 block px-1">
                        +{dayTasks.length - 2} lagi
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Date Agenda Detail */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                  Agenda Tanggal
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatIndonesianDate(selectedDateStr)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onAddTaskOnDate(selectedDateStr)}
                title="Tambah tugas di tanggal ini"
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Routine Schedule on this day */}
            {dayScheduleItems.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                  Jadwal Belajar Rutin ({selDayName}):
                </span>
                <div className="space-y-1.5">
                  {dayScheduleItems.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.subject}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {s.roomOrTeacher || 'Sesi Belajar'}
                        </div>
                      </div>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {s.startTime} - {s.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks on this day */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Tugas yang Jatuh Tempo ({selectedDateTasks.length}):
              </span>

              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tidak ada tugas di tanggal ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddTaskOnDate(selectedDateStr)}
                    className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    + Buat Tugas Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateTasks.map((t) => {
                    const isDone = t.status === 'selesai';
                    return (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-start justify-between gap-2"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => onToggleTaskStatus(t.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-500 shrink-0"
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                isDone ? 'text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40' : ''
                              }`}
                            />
                          </button>
                          <div className="min-w-0">
                            <span
                              className={`font-semibold block truncate ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {t.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {t.subject} · {t.dueTime ? `Jam ${t.dueTime}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {!isDone && (
                            <button
                              type="button"
                              onClick={() => onStartFocus(t)}
                              title="Mulai Fokus"
                              className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => window.open(createGoogleCalendarUrl(t), '_blank')}
                            title="Buka di Google Calendar"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-500 dark:text-slate-400">
            Tip: Klik tombol <span className="font-semibold text-slate-700 dark:text-slate-300">"Ekspor iCal"</span> di atas untuk menambahkan semua jadwal ke aplikasi kalender smartphone Anda.
          </div>
        </div>
      </div>
    </div>
  );
};
