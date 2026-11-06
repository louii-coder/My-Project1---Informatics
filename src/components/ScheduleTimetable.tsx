import React, { useState } from 'react';
import { Plus, Trash2, Clock, MapPin, BookOpen, X } from 'lucide-react';
import { ScheduleItem, DayOfWeek } from '../types/index.ts';
import { SUBJECT_OPTIONS } from '../data/initialData.ts';

interface ScheduleTimetableProps {
  scheduleItems: ScheduleItem[];
  onAddScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  onDeleteScheduleItem: (id: string) => void;
}

export const ScheduleTimetable: React.FC<ScheduleTimetableProps> = ({
  scheduleItems,
  onAddScheduleItem,
  onDeleteScheduleItem,
}) => {
  const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Senin');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [day, setDay] = useState<DayOfWeek>('Senin');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [roomOrTeacher, setRoomOrTeacher] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAddModal = (forDay?: DayOfWeek) => {
    if (forDay) setDay(forDay);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onAddScheduleItem({
      day,
      subject,
      startTime,
      endTime,
      roomOrTeacher: roomOrTeacher.trim() || undefined,
      notes: notes.trim() || undefined,
      color: 'indigo',
    });
    setRoomOrTeacher('');
    setNotes('');
    setIsModalOpen(false);
  };

  // Color mapping
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    teal: 'bg-teal-500',
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Day Selector and Add Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Jadwal Belajar &amp; Kelas Mingguan
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atur rutinitas jam sekolah, kuliah, dan sesi belajar mandiri setiap harinya
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddModal(selectedDay)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start md:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Tambah Jadwal Kelas</span>
        </button>
      </div>

      {/* Day of Week Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {days.map((d) => {
          const count = scheduleItems.filter((s) => s.day === d).length;
          const isActive = selectedDay === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{d}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Items for Selected Day */}
      <div className="space-y-3">
        {scheduleItems.filter((s) => s.day === selectedDay).length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Belum ada jadwal di hari {selectedDay}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tambahkan mata pelajaran, sesi bimbel, atau jam belajar mandiri untuk hari ini.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddModal(selectedDay)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal {selectedDay}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scheduleItems
              .filter((s) => s.day === selectedDay)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-start justify-between gap-3 relative overflow-hidden"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      colorMap[item.color] || 'bg-indigo-500'
                    }`}
                  />
                  <div className="pl-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.subject}
                    </h4>
                    {item.roomOrTeacher && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.roomOrTeacher}</span>
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteScheduleItem(item.id)}
                    title="Hapus dari jadwal"
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Tambah Jadwal Kelas / Belajar
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hari
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ruang / Guru / Pengajar (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lab Komputer 2 · Pak Budi"
                  value={roomOrTeacher}
                  onChange={(e) => setRoomOrTeacher(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bawa jas praktikum"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
