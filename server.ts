import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback motivation quotes for students in Indonesian
const FALLBACK_MOTIVATIONS = [
  "Langkah kecil hari ini adalah lompatan besar untuk masa depanmu. Jangan menyerah!",
  "Fokuslah pada progres, bukan kesempurnaan. Setiap tugas yang kamu selesaikan membawamu lebih dekat ke impianmu.",
  "Disiplin adalah jembatan antara tujuan dan pencapaianmu hari ini. Kamu pasti bisa!",
  "Belajar mungkin terasa melelahkan sekarang, tapi penyesalan akan terasa jauh lebih berat. Semangat terus!",
  "Kamu tidak perlu menjadi luar biasa untuk memulai, tapi kamu harus memulai untuk menjadi luar biasa.",
  "Istirahat sejenak jika lelah, lalu bangkitlah dengan tekad yang lebih kuat!",
];

// Endpoint: AI Daily Motivation & Smart Study Pep-Talk
app.post('/api/study-coach/motivate', async (req: Request, res: Response) => {
  try {
    const { studentName, completedTasksCount, pendingTasksCount, streak, currentLevel, points, urgentTask } = req.body;

    if (!ai) {
      const randomQuote = FALLBACK_MOTIVATIONS[Math.floor(Math.random() * FALLBACK_MOTIVATIONS.length)];
      return res.json({
        quote: randomQuote,
        coachAdvice: `Halo ${studentName || 'Sobat Belajar'}! Kamu sudah menyelesaikan ${completedTasksCount || 0} tugas dengan streak ${streak || 1} hari. Terus pertahankan ritme belajarmu!`,
        recommendedAction: urgentTask ? `Prioritaskan tugas: "${urgentTask}" sebelum tenggat waktu.` : "Buat sesi fokus 25 menit untuk tugas berikutnya.",
      });
    }

    const prompt = `Kamu adalah Asisten Belajar & Mentor Studi yang ramah, hangat, dan sangat suportif untuk seorang pelajar Indonesia bernama "${studentName || 'Pelajar'}".
Data Pelajar saat ini:
- Tugas selesai hari ini: ${completedTasksCount || 0}
- Tugas tersisa: ${pendingTasksCount || 0}
- Streak belajar berturut-turut: ${streak || 1} hari
- Level & Poin: ${currentLevel || 'Level 1'} (${points || 0} Poin XP)
- Tugas paling mendesak/terdekat: ${urgentTask || 'Tidak ada tugas mendesak'}

Berikan respons JSON dengan 3 atribut dalam Bahasa Indonesia:
1. "quote": Satu kalimat mutiara / motivasi inspiratif yang tidak klise dan menyentuh hati pelajar.
2. "coachAdvice": Paragraf singkat (2-3 kalimat) berisi nasihat ramah, memuji pencapaian mereka, dan menyemangati mereka menghadapi tugas hari ini.
3. "recommendedAction": Satu saran tindakan nyata yang konkret dan bisa dilakukan dalam 15-25 menit ke depan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Gemini motivate error:', error);
    const randomQuote = FALLBACK_MOTIVATIONS[Math.floor(Math.random() * FALLBACK_MOTIVATIONS.length)];
    return res.json({
      quote: randomQuote,
      coachAdvice: "Tetap tenang dan atur napas. Kerjakan satu per satu dengan teknik Pomodoro 25 menit.",
      recommendedAction: "Pilih 1 tugas paling ringan untuk diselesaikan sekarang agar momentum terbangun!",
    });
  }
});

// Endpoint: AI Task Breakdown Assistant
app.post('/api/study-coach/breakdown', async (req: Request, res: Response) => {
  try {
    const { title, subject, notes, estimatedMinutes } = req.body;

    if (!ai) {
      return res.json({
        subtasks: [
          `Pahami instruksi dan kumpulkan materi untuk ${title}`,
          `Buat draf atau kerangka pengerjaan (15 menit)`,
          `Selesaikan bagian utama secara bertahap`,
          `Review dan periksa kembali sebelum dikumpulkan`,
        ],
        tips: `Bagi pengerjaan ${title} ke dalam 2 sesi 25 menit agar otak tidak jenuh.`,
      });
    }

    const prompt = `Pelajar ini memiliki tugas sekolah/kuliah berikut:
Judul Tugas: "${title}"
Mata Pelajaran: "${subject || 'Umum'}"
Catatan Tambahan: "${notes || 'Tidak ada'}"
Estimasi Waktu Total: ${estimatedMinutes || 60} menit.

Tolong pecahkan tugas ini menjadi 3 sampai 5 sub-tugas kecil yang terukur, realistis, dan mudah dikerjakan langkah demi langkah.
Berikan respons dalam JSON dengan format:
{
  "subtasks": ["Langkah 1...", "Langkah 2...", "Langkah 3..."],
  "tips": "Tips belajar ringkas dan trik konsentrasi untuk materi ini"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Gemini breakdown error:', error);
    return res.json({
      subtasks: [
        `Baca ulang instruksi dan materi pokok ${req.body.title || 'tugas'}`,
        `Kerjakan inti tugas dalam 20 menit pertama`,
        `Periksa kembali hasil pengerjaan`,
      ],
      tips: "Fokus tanpa membuka media sosial selama pengerjaan.",
    });
  }
});

// Endpoint: AI Study Plan Optimization (Smart Scheduler)
app.post('/api/study-coach/schedule-plan', async (req: Request, res: Response) => {
  try {
    const { tasks, availableHoursToday } = req.body;

    if (!ai) {
      return res.json({
        scheduleRecommendation: "Gunakan metode Time-Boxing: mulai dari tugas prioritas tinggi di pagi atau sore hari saat konsentrasi puncak, selingi 5 menit istirahat setiap 25 menit.",
        prioritizedOrder: (tasks || []).map((t: any) => t.title),
      });
    }

    const prompt = `Pelajar ini memiliki daftar tugas harian berikut:
${JSON.stringify(tasks, null, 2)}
Waktu luang belajar hari ini: ${availableHoursToday || 3} jam.

Susunkan rekomendasi urutan belajar yang paling efisien berdasarkan tingkat kesulitan dan tenggat waktu, serta berikan tips pembagian waktu (time-blocking) dalam Bahasa Indonesia.
Format respons JSON:
{
  "scheduleRecommendation": "Penjelasan singkat strategi alokasi waktu dan urutan belajar",
  "prioritizedOrder": ["Judul tugas 1", "Judul tugas 2", "..."],
  "timeBlocks": [
    { "timeSlot": "16:00 - 16:45", "activity": "...", "focusTip": "..." }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Gemini schedule error:', error);
    return res.json({
      scheduleRecommendation: "Dahulukan tugas dengan batas waktu terdekat dan tugas dengan bobot kesulitan terbesar saat energi masih segar.",
      prioritizedOrder: (req.body.tasks || []).map((t: any) => t.title),
      timeBlocks: [],
    });
  }
});

// Serve frontend in development via Vite middlewares or production via static dist
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudiPlan Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
