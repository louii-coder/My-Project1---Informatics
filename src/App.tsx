/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Sparkles,
  Calendar,
  BarChart3,
  Gift,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Flame,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Task, ScheduleItem, RewardItem, StudentProfile, Badge } from './types/index.ts';
import {
  INITIAL_TASKS,
  INITIAL_SCHEDULE,
  INITIAL_REWARDS,
  INITIAL_STUDENT_PROFILE,
  SUBJECT_OPTIONS,
  ASSET_IMAGES,
} from './data/initialData.ts';
import { INITIAL_BADGES, triggerConfetti, updateStreak, getLevelInfo } from './utils/gamification.ts';
import { sound } from './utils/sound.ts';
import { isToday, isOverdue } from './utils/calendar.ts';
import { Header } from './components/Header.tsx';
import { SmartReminder } from './components/SmartReminder.tsx';
import { TaskCard } from './components/TaskCard.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { ProgressCharts } from './components/ProgressCharts.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { ScheduleTimetable } from './components/ScheduleTimetable.tsx';
import { PomodoroTimer } from './components/PomodoroTimer.tsx';
import { RewardStore } from './components/RewardStore.tsx';
import { AICoachModal } from './components/AICoachModal.tsx';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studiplan_dark') === 'true';
    }
    return false;
  });

  // Main navigation tab
  const [currentTab, setCurrentTab] = useState<'tasks' | 'schedule' | 'calendar' | 'charts' | 'rewards'>('tasks');

  // Core Data States with LocalStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('studiplan_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('studiplan_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const saved = localStorage.getItem('studiplan_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('studiplan_profile');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('studiplan_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  // Active task for Pomodoro focus
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [taskForAIBreakdown, setTaskForAIBreakdown] = useState<Task | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'today' | 'pending' | 'completed' | 'high'>('all');

  // Sync theme with document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studiplan_dark', String(isDarkMode));
  }, [isDarkMode]);

  // Persist data
  useEffect(() => {
    localStorage.setItem('studiplan_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studiplan_schedule', JSON.stringify(scheduleItems));
  }, [scheduleItems]);

  useEffect(() => {
    localStorage.setItem('studiplan_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('studiplan_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('studiplan_badges', JSON.stringify(badges));
  }, [badges]);

  // Streak verification on load
  useEffect(() => {
    const updated = updateStreak(profile);
    if (updated.streak !== profile.streak || updated.lastActiveDate !== profile.lastActiveDate) {
      setProfile((prev) => ({ ...prev, ...updated }));
    }
  }, []);

  // Handlers for Tasks
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const willBeDone = t.status !== 'selesai';
          if (willBeDone) {
            sound.playTaskComplete();
            triggerConfetti('small');
            // Check if on-time
            const isOnTime = !isOverdue(t.dueDate, t.dueTime);
            const pointsEarned = isOnTime ? 75 : 50;

            // Award XP
            setProfile((prev) => ({
              ...prev,
              points: prev.points + pointsEarned,
              completedTotal: prev.completedTotal + 1,
            }));

            // Check if level up
            const oldLevel = getLevelInfo(profile.points).level;
            const newLevel = getLevelInfo(profile.points + pointsEarned).level;
            if (newLevel > oldLevel) {
              sound.playLevelUp();
              triggerConfetti('levelUp');
            }

            return {
              ...t,
              status: 'selesai',
              completedAt: new Date().toISOString(),
              pointsEarned,
            };
          } else {
            sound.playClick();
            return {
              ...t,
              status: 'belum',
              completedAt: undefined,
            };
          }
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    sound.playClick();
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    sound.playClick();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeFocusTask?.id === taskId) {
      setActiveFocusTask(null);
    }
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> | Task) => {
    sound.playClick();
    if ('id' in taskData) {
      setTasks((prev) => prev.map((t) => (t.id === taskData.id ? (taskData as Task) : t)));
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setEditingTask(null);
  };

  // Focus & Pomodoro Handlers
  const handleStartFocus = (task: Task) => {
    setActiveFocusTask(task);
    setCurrentTab('tasks');
    sound.playClick();
    // Scroll to Pomodoro
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleFinishFocusSession = (minutes: number, linkedTaskId?: string) => {
    const earnedXP = 30;
    setProfile((prev) => ({
      ...prev,
      points: prev.points + earnedXP,
      studyMinutesTotal: prev.studyMinutesTotal + minutes,
    }));

    // Unlock Pomodoro badge if locked
    setBadges((prev) =>
      prev.map((b) => (b.id === 'pomodoro_master' ? { ...b, unlockedAt: new Date().toISOString() } : b))
    );

    if (linkedTaskId) {
      // Mark linked task as in progress
      setTasks((prev) =>
        prev.map((t) => (t.id === linkedTaskId && t.status === 'belum' ? { ...t, status: 'proses' } : t))
      );
    }
  };

  // Schedule Handlers
  const handleAddScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    sound.playClick();
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    setScheduleItems((prev) => [...prev, newItem]);
  };

  const handleDeleteScheduleItem = (id: string) => {
    sound.playClick();
    setScheduleItems((prev) => prev.filter((s) => s.id !== id));
  };

  // Rewards Handlers
  const handleRedeemReward = (rewardId: string, cost: number): boolean => {
    if (profile.points < cost) return false;
    setProfile((prev) => ({
      ...prev,
      points: prev.points - cost,
    }));
    return true;
  };

  const handleAddCustomReward = (rewardData: Omit<RewardItem, 'id'>) => {
    sound.playClick();
    const newReward: RewardItem = {
      ...rewardData,
      id: `rew-cust-${Date.now()}`,
    };
    setRewards((prev) => [newReward, ...prev]);
  };

  // AI Breakdown helper via server endpoint
  const handleAutoBreakdownWithAI = async (title: string, subject: string, notes: string): Promise<string[]> => {
    try {
      const res = await fetch('/api/study-coach/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subject, notes }),
      });
      const data = await res.json();
      return data.subtasks || [];
    } catch {
      return [
        `Pahami instruksi dan kumpulkan materi untuk ${title}`,
        'Selesaikan draf bagian pertama (20 menit)',
        'Periksa kembali sebelum diserahkan',
      ];
    }
  };

  const handleApplyAIBreakdownToTask = (taskId: string, subtaskStrings: string[]) => {
    sound.playClick();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSteps = subtaskStrings.map((str, idx) => ({
            id: `st-applied-${Date.now()}-${idx}`,
            text: str,
            completed: false,
          }));
          return {
            ...t,
            subtasks: [...t.subtasks, ...newSteps],
          };
        }
        return t;
      })
    );
  };

  const handleOpenBreakdownForTask = (task: Task) => {
    setTaskForAIBreakdown(task);
    setIsAICoachOpen(true);
  };

  // Reset sample data helper
  const handleResetData = () => {
    if (confirm('Kembalikan semua jadwal dan tugas contoh awal?')) {
      setTasks(INITIAL_TASKS);
      setScheduleItems(INITIAL_SCHEDULE);
      setRewards(INITIAL_REWARDS);
      setProfile(INITIAL_STUDENT_PROFILE);
      sound.playClick();
    }
  };

  // Filter tasks logic
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Subject
    if (filterSubject !== 'all' && task.subject !== filterSubject) {
      return false;
    }

    // Status filter
    if (filterStatus === 'today') {
      return isToday(task.dueDate);
    }
    if (filterStatus === 'pending') {
      return task.status !== 'selesai';
    }
    if (filterStatus === 'completed') {
      return task.status === 'selesai';
    }
    if (filterStatus === 'high') {
      return task.priority === 'tinggi';
    }

    return true;
  });

  const levelInfo = getLevelInfo(profile.points);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* 1-Row, 3-Zone Top Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          sound.playClick();
          setCurrentTab(tab as any);
        }}
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Col: Greeting & Coach Trigger */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {levelInfo.title}
                </span>
                <span>·</span>
                <span className="font-mono tabular-nums">{profile.streak} Hari Berturut-turut</span>
                <span>·</span>
                <span className="font-mono tabular-nums">{profile.points} XP Terkumpul</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Selamat Belajar, {profile.name}! 🚀
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Kelola jadwal, selesaikan tugas harian, dan kumpulkan poin prestasi untuk meningkatkan produktivitasmu tanpa rasa jenuh.
              </p>

              {/* Action Buttons in Hero */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAICoachOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Konsultasi Mentor AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('tasks');
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mulai Pomodoro Focus</span>
                </button>
              </div>
            </div>

            {/* Right Col: Desk Illustration Card */}
            <div className="lg:col-span-5 relative rounded-xl overflow-hidden h-40 sm:h-48 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <img
                src={ASSET_IMAGES.deskHero}
                alt="Suasana Ruang Belajar Nyaman"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-4">
                <div className="text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Fokus &amp; Konsistensi
                  </span>
                  <p className="text-xs font-medium text-slate-100 mt-0.5">
                    "Setiap halaman yang dibaca hari ini adalah bekal untuk hari esok."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Reminder Banner */}
        <SmartReminder
          tasks={tasks}
          onStartFocus={handleStartFocus}
          onCompleteTask={handleToggleTaskStatus}
        />

        {/* TAB NAVIGATION VIEWPORTS */}

        {/* VIEW 1: TASKS & FOCUS */}
        {currentTab === 'tasks' && (
          <div className="space-y-6">
            {/* Pomodoro Focus Timer Section */}
            <PomodoroTimer
              tasks={tasks}
              activeTask={activeFocusTask}
              onSelectTask={setActiveFocusTask}
              onFinishFocusSession={handleFinishFocusSession}
            />

            {/* Task Controls & Filters Strip */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari tugas atau mata pelajaran..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Subject Dropdown Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">Semua Mata Pelajaran</option>
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Segmented Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'today', label: 'Hari Ini' },
                  { id: 'pending', label: 'Belum Selesai' },
                  { id: 'completed', label: 'Selesai' },
                  { id: 'high', label: 'Prioritas Tinggi' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilterStatus(item.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      filterStatus === item.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List Items */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tidak ada tugas yang sesuai
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Coba sesuaikan kata kunci pencarian atau tambah tugas baru.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    + Buat Tugas Sekarang
                  </button>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleTaskStatus}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleOpenEditTask}
                    onStartFocus={handleStartFocus}
                    onAskAIBreakdown={handleOpenBreakdownForTask}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: WEEKLY SCHEDULE */}
        {currentTab === 'schedule' && (
          <ScheduleTimetable
            scheduleItems={scheduleItems}
            onAddScheduleItem={handleAddScheduleItem}
            onDeleteScheduleItem={handleDeleteScheduleItem}
          />
        )}

        {/* VIEW 3: CALENDAR VIEW */}
        {currentTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            scheduleItems={scheduleItems}
            onAddTaskOnDate={(dateStr) => {
              setEditingTask({
                id: '',
                title: '',
                subject: SUBJECT_OPTIONS[0],
                dueDate: dateStr,
                dueTime: '17:00',
                priority: 'sedang',
                estimatedMinutes: 45,
                status: 'belum',
                subtasks: [],
              });
              setIsTaskModalOpen(true);
            }}
            onToggleTaskStatus={handleToggleTaskStatus}
            onStartFocus={handleStartFocus}
          />
        )}

        {/* VIEW 4: PROGRESS CHARTS */}
        {currentTab === 'charts' && (
          <ProgressCharts tasks={tasks} profile={profile} />
        )}

        {/* VIEW 5: REWARDS & GAMIFICATION */}
        {currentTab === 'rewards' && (
          <RewardStore
            profile={profile}
            rewards={rewards}
            badges={badges}
            onRedeemReward={handleRedeemReward}
            onAddCustomReward={handleAddCustomReward}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">StudiPlan</span>
            <span>·</span>
            <span>Asisten Belajar &amp; Tugas Pelajar Indonesia</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Contoh</span>
            </button>
            <span>© 2026 StudiPlan</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        onAutoBreakdownWithAI={handleAutoBreakdownWithAI}
      />

      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        profile={profile}
        tasks={tasks}
        initialTaskForBreakdown={taskForAIBreakdown}
        onApplySubtasks={handleApplyAIBreakdownToTask}
      />
    </div>
  );
}
