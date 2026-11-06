import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, Check, ArrowRight, BookOpen, Lightbulb, HeartHandshake } from 'lucide-react';
import { Task, StudentProfile } from '../types/index.ts';
import { ASSET_IMAGES } from '../data/initialData.ts';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  tasks: Task[];
  initialTaskForBreakdown?: Task | null;
  onApplySubtasks?: (taskId: string, subtasks: string[]) => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  profile,
  tasks,
  initialTaskForBreakdown,
  onApplySubtasks,
}) => {
  const [activeTab, setActiveTab] = useState<'motivation' | 'breakdown' | 'scheduler'>('motivation');

  // Motivation state
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  const [motivationData, setMotivationData] = useState<{
    quote: string;
    coachAdvice: string;
    recommendedAction: string;
  } | null>(null);

  // Breakdown state
  const [selectedTaskForBreakdown, setSelectedTaskForBreakdown] = useState<Task | null>(
    initialTaskForBreakdown || tasks[0] || null
  );
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [breakdownResult, setBreakdownResult] = useState<{
    subtasks: string[];
    tips: string;
  } | null>(null);
  const [breakdownApplied, setBreakdownApplied] = useState(false);

  // Scheduler state
  const [availableHours, setAvailableHours] = useState(3);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<{
    scheduleRecommendation: string;
    prioritizedOrder: string[];
    timeBlocks?: { timeSlot: string; activity: string; focusTip: string }[];
  } | null>(null);

  if (!isOpen) return null;

  // Fetch Daily Motivation
  const fetchMotivation = async () => {
    setIsLoadingMotivation(true);
    try {
      const urgent = tasks.find((t) => t.status !== 'selesai');
      const res = await fetch('/api/study-coach/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: profile.name,
          completedTasksCount: tasks.filter((t) => t.status === 'selesai').length,
          pendingTasksCount: tasks.filter((t) => t.status !== 'selesai').length,
          streak: profile.streak,
          currentLevel: `Level ${Math.floor(profile.points / 300) + 1}`,
          points: profile.points,
          urgentTask: urgent?.title,
        }),
      });
      const data = await res.json();
      setMotivationData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMotivation(false);
    }
  };

  // Run Task Breakdown
  const runBreakdown = async () => {
    if (!selectedTaskForBreakdown) return;
    setIsBreakdownLoading(true);
    setBreakdownApplied(false);
    try {
      const res = await fetch('/api/study-coach/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTaskForBreakdown.title,
          subject: selectedTaskForBreakdown.subject,
          notes: selectedTaskForBreakdown.notes,
          estimatedMinutes: selectedTaskForBreakdown.estimatedMinutes,
        }),
      });
      const data = await res.json();
      setBreakdownResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  // Run Schedule Optimizer
  const runScheduleOptimizer = async () => {
    setIsScheduleLoading(true);
    try {
      const uncompleted = tasks.filter((t) => t.status !== 'selesai');
      const res = await fetch('/api/study-coach/schedule-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: uncompleted.map((t) => ({
            title: t.title,
            subject: t.subject,
            due: `${t.dueDate} ${t.dueTime}`,
            priority: t.priority,
            minutes: t.estimatedMinutes,
          })),
          availableHoursToday: availableHours,
        }),
      });
      const data = await res.json();
      setScheduleResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const handleApplyBreakdownToTask = () => {
    if (!selectedTaskForBreakdown || !breakdownResult || !onApplySubtasks) return;
    onApplySubtasks(selectedTaskForBreakdown.id, breakdownResult.subtasks);
    setBreakdownApplied(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-indigo-500/30 shrink-0">
              <img
                src={ASSET_IMAGES.mascot}
                alt="Mascot Teman Belajar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Mentor Belajar Pintar
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyemangat harian, pemecah tugas rumit, dan perencana jadwal cerdas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('motivation')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'motivation'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Penyemangat &amp; Motivasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('breakdown')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'breakdown'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pecah Tugas Rumit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scheduler')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'scheduler'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Strategi Waktu Belajar</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 space-y-4">
          {/* TAB 1: MOTIVATION */}
          {activeTab === 'motivation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Sapaan &amp; Evaluasi Harian untukmu
                </span>
                <button
                  type="button"
                  onClick={fetchMotivation}
                  disabled={isLoadingMotivation}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMotivation ? 'animate-spin' : ''}`} />
                  <span>{motivationData ? 'Minta Motivasi Baru' : 'Dapatkan Kata Motivasi'}</span>
                </button>
              </div>

              {!motivationData && !isLoadingMotivation && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center border border-slate-200/80 dark:border-slate-700/60">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Mulai Hari dengan Semangat Penuh!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Klik tombol di atas untuk mendengarkan pesan penyemangat dan analisis progres dari Mentor AI-mu.
                  </p>
                  <button
                    type="button"
                    onClick={fetchMotivation}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Dapatkan Nasihat Belajar Hari Ini
                  </button>
                </div>
              )}

              {isLoadingMotivation && (
                <div className="p-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Menghubungkan ke Gemini AI &amp; menganalisis daftar tugasmu...
                  </p>
                </div>
              )}

              {motivationData && !isLoadingMotivation && (
                <div className="space-y-3 animate-in fade-in">
                  {/* Quote Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                      Kutipan Inspirasi Hari Ini
                    </span>
                    <blockquote className="text-sm font-semibold text-slate-900 dark:text-slate-100 italic">
                      "{motivationData.quote}"
                    </blockquote>
                  </div>

                  {/* Coach Advice */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Catatan Mentor untuk {profile.name}:</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {motivationData.coachAdvice}
                    </p>
                  </div>

                  {/* Recommended Immediate Action */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      🎯 Rekomendasi Tindakan 15 Menit Ke Depan:
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-200">
                      {motivationData.recommendedAction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TASK BREAKDOWN */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Tugas yang Ingin Dipecah Langkah-Langkahnya:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTaskForBreakdown?.id || ''}
                    onChange={(e) => {
                      const found = tasks.find((t) => t.id === e.target.value) || null;
                      setSelectedTaskForBreakdown(found);
                      setBreakdownResult(null);
                      setBreakdownApplied(false);
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.subject}] {t.title}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={runBreakdown}
                    disabled={isBreakdownLoading || !selectedTaskForBreakdown}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isBreakdownLoading ? 'Memproses...' : 'Pecah Langkah'}</span>
                  </button>
                </div>
              </div>

              {isBreakdownLoading && (
                <div className="p-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">
                    AI sedang merumuskan langkah pengerjaan yang terukur...
                  </p>
                </div>
              )}

              {breakdownResult && !isBreakdownLoading && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Rekomendasi Langkah Terukur:
                    </span>
                    <ol className="space-y-2 list-decimal list-inside text-xs text-slate-700 dark:text-slate-300">
                      {breakdownResult.subtasks.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {breakdownResult.tips && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-bold">Tips Belajar: </span>
                      {breakdownResult.tips}
                    </div>
                  )}

                  {onApplySubtasks && selectedTaskForBreakdown && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={breakdownApplied}
                        onClick={handleApplyBreakdownToTask}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          breakdownApplied
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        {breakdownApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Langkah Ditambahkan ke Tugas!</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Terapkan Checklist ke Kartu Tugas</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHEDULER */}
          {activeTab === 'scheduler' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Berapa jam waktu belajarmu hari ini?
                  </label>
                  <select
                    value={availableHours}
                    onChange={(e) => setAvailableHours(Number(e.target.value))}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value={1}>1 Jam (Sesi Ringan)</option>
                    <option value={2}>2 Jam</option>
                    <option value={3}>3 Jam (Standar Produktif)</option>
                    <option value={4}>4 Jam</option>
                    <option value={5}>5 Jam (Persiapan Ujian / Ambis)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={runScheduleOptimizer}
                  disabled={isScheduleLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 self-start sm:self-end whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isScheduleLoading ? 'Menyusun...' : 'Susun Jadwal Optimal'}</span>
                </button>
              </div>

              {isScheduleLoading && (
                <div className="p-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">
                    Menyusun urutan pengerjaan tugas berdasarkan urgensi dan energi fokus...
                  </p>
                </div>
              )}

              {scheduleResult && !isScheduleLoading && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block mb-1">
                      Strategi Alokasi Waktu:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {scheduleResult.scheduleRecommendation}
                    </p>
                  </div>

                  {scheduleResult.prioritizedOrder && scheduleResult.prioritizedOrder.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                        Urutan Prioritas Belajar:
                      </span>
                      <div className="space-y-1.5">
                        {scheduleResult.prioritizedOrder.map((taskTitle, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                          >
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {taskTitle}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
