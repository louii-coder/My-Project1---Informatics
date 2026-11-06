import { Task, ScheduleItem, RewardItem, StudentProfile } from '../types/index.ts';

export const ASSET_IMAGES = {
  mascot: '/src/assets/images/study_mascot_student_1793926086581.jpg',
  deskHero: '/src/assets/images/study_desk_illustration_1793926088381.jpg',
  trophy: '/src/assets/images/achievement_trophy_badge_1793926086969.jpg',
};

// Calculate relative sample dates
const getSampleDate = (daysFromToday: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().split('T')[0];
};

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Budi Pratama',
  points: 380,
  streak: 4,
  lastActiveDate: getSampleDate(0),
  completedTotal: 12,
  studyMinutesTotal: 340,
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Latihan Soal Matematika: Turunan & Integral',
    subject: 'Matematika',
    dueDate: getSampleDate(0), // Today
    dueTime: '17:00',
    priority: 'tinggi',
    estimatedMinutes: 45,
    status: 'proses',
    notes: 'Buku paket hal. 142 nomor 1 - 10 bagian B. Fokus pemahaman rumus dasar.',
    subtasks: [
      { id: 'st-1', text: 'Pahami contoh soal halaman 140', completed: true },
      { id: 'st-2', text: 'Kerjakan soal no 1 - 5', completed: true },
      { id: 'st-3', text: 'Kerjakan soal analisis no 6 - 10', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Esai Bahasa Indonesia: Resensi Buku Fiksi',
    subject: 'Bahasa Indonesia',
    dueDate: getSampleDate(1), // Tomorrow
    dueTime: '20:00',
    priority: 'sedang',
    estimatedMinutes: 60,
    status: 'belum',
    notes: 'Minimal 500 kata, sertakan sinopsis, kelebihan, kekurangan, dan kesimpulan.',
    subtasks: [
      { id: 'st-4', text: 'Tentukan buku yang akan diresensi', completed: true },
      { id: 'st-5', text: 'Buat outline poin penting', completed: false },
      { id: 'st-6', text: 'Tulis draf awal dan periksa tata bahasa EYD', completed: false },
    ],
  },
  {
    id: 'task-3',
    title: 'Praktikum Biologi: Laporan Fotosintesis',
    subject: 'Biologi',
    dueDate: getSampleDate(2),
    dueTime: '14:00',
    priority: 'sedang',
    estimatedMinutes: 50,
    status: 'belum',
    notes: 'Lampirkan tabel pengamatan gelembung gas Hydrilla dan foto dokumentasi.',
    subtasks: [
      { id: 'st-7', text: 'Input data tabel pengamatan praktikum', completed: false },
      { id: 'st-8', text: 'Buat pembahasan grafik laju fotosintesis', completed: false },
      { id: 'st-9', text: 'Cetak dan tandatangani lembar pengesahan', completed: false },
    ],
  },
  {
    id: 'task-4',
    title: 'Kuis Singkat Rumus Hukum Newton',
    subject: 'Fisika',
    dueDate: getSampleDate(0), // Today
    dueTime: '21:30',
    priority: 'tinggi',
    estimatedMinutes: 30,
    status: 'selesai',
    completedAt: new Date().toISOString(),
    notes: 'Review Hukum I, II, dan III Newton beserta diagram gaya bebas.',
    subtasks: [
      { id: 'st-10', text: 'Review catatan rumus di binder', completed: true },
      { id: 'st-11', text: 'Latihan 5 soal gaya gesek', completed: true },
    ],
    pointsEarned: 75,
  },
  {
    id: 'task-5',
    title: 'Presentasi Proyek Pemrograman Web Sederhana',
    subject: 'Informatika',
    dueDate: getSampleDate(3),
    dueTime: '13:00',
    priority: 'rendah',
    estimatedMinutes: 90,
    status: 'belum',
    notes: 'Siapkan slide PPT 7 halaman dan demo live aplikasi di browser.',
    subtasks: [
      { id: 'st-12', text: 'Finalisasi kode JavaScript', completed: false },
      { id: 'st-13', text: 'Buat slide presentasi di Canva', completed: false },
      { id: 'st-14', text: 'Latihan presentasi 10 menit', completed: false },
    ],
  },
];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    day: 'Senin',
    subject: 'Matematika Peminatan',
    startTime: '07:30',
    endTime: '09:00',
    roomOrTeacher: 'Ruang 12 · Pak Hendra',
    color: 'emerald',
    notes: 'Bawa kalkulator saintifik dan penggaris',
  },
  {
    id: 'sch-2',
    day: 'Senin',
    subject: 'Fisika Terapan',
    startTime: '09:30',
    endTime: '11:00',
    roomOrTeacher: 'Lab Fisika · Bu Rina',
    color: 'sky',
    notes: 'Praktikum gelombang bunyi',
  },
  {
    id: 'sch-3',
    day: 'Selasa',
    subject: 'Bahasa Indonesia',
    startTime: '08:00',
    endTime: '09:30',
    roomOrTeacher: 'Ruang 12 · Pak Danu',
    color: 'amber',
  },
  {
    id: 'sch-4',
    day: 'Selasa',
    subject: 'Biologi Sel',
    startTime: '10:00',
    endTime: '11:30',
    roomOrTeacher: 'Lab Biologi · Bu Melati',
    color: 'teal',
  },
  {
    id: 'sch-5',
    day: 'Rabu',
    subject: 'Bahasa Inggris',
    startTime: '07:30',
    endTime: '09:00',
    roomOrTeacher: 'Ruang Multimedia · Ms. Sarah',
    color: 'indigo',
  },
  {
    id: 'sch-6',
    day: 'Rabu',
    subject: 'Informatika & Coding',
    startTime: '10:00',
    endTime: '12:00',
    roomOrTeacher: 'Lab Komputer 2 · Pak Aditya',
    color: 'violet',
  },
  {
    id: 'sch-7',
    day: 'Kamis',
    subject: 'Kimia Larutan',
    startTime: '08:30',
    endTime: '10:30',
    roomOrTeacher: 'Lab Kimia · Bu Wahyuni',
    color: 'rose',
  },
  {
    id: 'sch-8',
    day: 'Jumat',
    subject: 'Sejarah Indonesia',
    startTime: '07:30',
    endTime: '09:00',
    roomOrTeacher: 'Ruang 12 · Pak Suryo',
    color: 'orange',
  },
  {
    id: 'sch-9',
    day: 'Sabtu',
    subject: 'Sesi Belajar Mandiri & Ambis',
    startTime: '09:00',
    endTime: '11:30',
    roomOrTeacher: 'Perpustakaan / Meja Belajar',
    color: 'blue',
    notes: 'Review materi ujian dan cicil tugas pekan depan',
  },
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'Istirahat Nonton Film / Anime 1 Episode',
    description: 'Reward santai tanpa rasa bersalah setelah target belajar tuntas.',
    cost: 120,
    iconName: 'Tv',
  },
  {
    id: 'rew-2',
    title: 'Jajan Kopi Susu / Minuman Favorit',
    description: 'Self-reward traktir diri sendiri ke kafe atau pesan online.',
    cost: 200,
    iconName: 'Coffee',
  },
  {
    id: 'rew-3',
    title: 'Main Game Santai 45 Menit',
    description: 'Refresh pikiran bersama teman-teman setelah tugas selesai.',
    cost: 150,
    iconName: 'Gamepad2',
  },
  {
    id: 'rew-4',
    title: 'Tidur Siang Nyenyak Bebas Khawatir',
    description: 'Power nap 30-45 menit untuk mengisi ulang energi otak.',
    cost: 100,
    iconName: 'Moon',
  },
  {
    id: 'rew-5',
    title: 'Beli Buku Bacaan Baru / Novel Impian',
    description: 'Investasi ilmu dan hobi bacaan baru atas kerja kerasmu.',
    cost: 500,
    iconName: 'BookMarked',
  },
];

export const SUBJECT_OPTIONS = [
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Informatika',
  'Sejarah',
  'Ekonomi',
  'Geografi',
  'Sosiologi',
  'Seni Budaya',
  'Lainnya',
];

export const SUBJECT_COLORS: Record<string, string> = {
  Matematika: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  Fisika: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  Kimia: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  Biologi: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  'Bahasa Indonesia': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  'Bahasa Inggris': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  Informatika: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
  Sejarah: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  Lainnya: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};
