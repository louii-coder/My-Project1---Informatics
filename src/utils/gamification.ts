import confetti from 'canvas-confetti';
import { Badge, StudentProfile } from '../types/index.ts';

export interface LevelInfo {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  progressPercent: number;
  pointsToNext: number;
}

const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Pelajar Pemula', min: 0, max: 150 },
  { level: 2, title: 'Penjelajah Ilmu', min: 150, max: 400 },
  { level: 3, title: 'Cendekiawan Muda', min: 400, max: 800 },
  { level: 4, title: 'Master Produktif', min: 800, max: 1400 },
  { level: 5, title: 'Bintang Berprestasi', min: 1400, max: 2200 },
  { level: 6, title: 'Legenda Akademik', min: 2200, max: 99999 },
];

export function getLevelInfo(points: number): LevelInfo {
  let matched = LEVEL_THRESHOLDS[0];
  for (const tier of LEVEL_THRESHOLDS) {
    if (points >= tier.min) {
      matched = tier;
    }
  }

  const range = matched.max - matched.min;
  const currentInTier = Math.max(0, points - matched.min);
  const progressPercent = Math.min(100, Math.round((currentInTier / range) * 100));
  const pointsToNext = Math.max(0, matched.max - points);

  return {
    level: matched.level,
    title: matched.title,
    minPoints: matched.min,
    maxPoints: matched.max,
    progressPercent,
    pointsToNext,
  };
}

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_task',
    title: 'Langkah Pertama',
    description: 'Menyelesaikan tugas pertama dengan sukses',
    icon: '🎯',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'streak_3',
    title: 'Konsistensi Nyata',
    description: 'Menjaga streak belajar selama 3 hari berturut-turut',
    icon: '🔥',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'pomodoro_master',
    title: 'Fokus Tajam',
    description: 'Menuntaskan sesi fokus belajar Pomodoro',
    icon: '⏱️',
  },
  {
    id: 'early_bird',
    title: 'Anti SKS',
    description: 'Menyelesaikan tugas 24 jam sebelum tenggat waktu',
    icon: '⚡',
  },
  {
    id: 'subject_champion',
    title: 'Penakluk Pelajaran',
    description: 'Menyelesaikan 5 tugas dalam satu mata pelajaran',
    icon: '📚',
  },
  {
    id: 'points_500',
    title: 'Gudang Prestasi',
    description: 'Mengumpulkan total 500 Poin XP',
    icon: '🏆',
  },
];

export function triggerConfetti(intensity: 'small' | 'celebration' | 'levelUp' = 'small') {
  if (typeof window === 'undefined') return;

  if (intensity === 'small') {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
    });
  } else if (intensity === 'levelUp') {
    const end = Date.now() + 1500;
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
      });
    }, 200);
  } else {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  }
}

export function updateStreak(profile: StudentProfile): { streak: number; lastActiveDate: string } {
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastActiveDate === today) {
    return { streak: profile.streak, lastActiveDate: today };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (profile.lastActiveDate === yesterdayStr) {
    return { streak: profile.streak + 1, lastActiveDate: today };
  }

  // Missed more than 1 day, reset or start with 1
  return { streak: 1, lastActiveDate: today };
}
