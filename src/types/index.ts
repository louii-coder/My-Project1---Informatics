export type Priority = 'tinggi' | 'sedang' | 'rendah';
export type TaskStatus = 'belum' | 'proses' | 'selesai';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  priority: Priority;
  estimatedMinutes: number;
  status: TaskStatus;
  completedAt?: string;
  notes?: string;
  subtasks: Subtask[];
  pointsEarned?: number;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface ScheduleItem {
  id: string;
  day: DayOfWeek;
  subject: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  roomOrTeacher?: string;
  color: string;
  notes?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  iconName: string;
  isRedeemed?: boolean;
  redeemedAt?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface StudentProfile {
  name: string;
  points: number;
  streak: number;
  lastActiveDate: string;
  completedTotal: number;
  studyMinutesTotal: number;
  avatarSeed?: string;
}
