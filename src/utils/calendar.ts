import { Task, ScheduleItem } from '../types/index.ts';

/**
 * Generates an instant Google Calendar event creation URL
 */
export function createGoogleCalendarUrl(task: Task): string {
  const [year, month, day] = task.dueDate.split('-');
  const [hours, minutes] = (task.dueTime || '12:00').split(':');

  const start = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10)
  );

  // Default duration based on task estimated minutes or 45 mins
  const durationMs = (task.estimatedMinutes || 45) * 60 * 1000;
  const end = new Date(start.getTime() + durationMs);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const title = encodeURIComponent(`[StudiPlan] ${task.subject}: ${task.title}`);
  const details = encodeURIComponent(
    `Tugas: ${task.title}\n` +
    `Mata Pelajaran: ${task.subject}\n` +
    `Prioritas: ${task.priority.toUpperCase()}\n` +
    `Estimasi Waktu: ${task.estimatedMinutes} Menit\n\n` +
    `Catatan:\n${task.notes || 'Dikelola melalui StudiPlan Pelajar'}\n\n` +
    `Subtugas:\n${task.subtasks.map((st) => `- [${st.completed ? 'x' : ' '}] ${st.text}`).join('\n')}`
  );

  const dates = `${formatGCalDate(start)}/${formatGCalDate(end)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

/**
 * Exports tasks or schedule into standard iCalendar (.ics) format
 */
export function exportToIcs(tasks: Task[], scheduleItems: ScheduleItem[] = [], filename = 'jadwal-tugas-studiplan.ics') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudiPlan//Pelajar Indonesia//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:StudiPlan Jadwal & Tugas',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  const nowIso = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '');

  // Add tasks as events
  tasks.forEach((task) => {
    const [year, month, day] = task.dueDate.split('-');
    const [hours, minutes] = (task.dueTime || '12:00').split(':');
    const start = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10)
    );
    const durationMs = (task.estimatedMinutes || 45) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    const formatIcs = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:task-${task.id}@studiplan.app`);
    lines.push(`DTSTAMP:${nowIso}`);
    lines.push(`DTSTART:${formatIcs(start)}`);
    lines.push(`DTEND:${formatIcs(end)}`);
    lines.push(`SUMMARY:[Tugas] ${task.subject} - ${task.title}`);
    lines.push(`DESCRIPTION:Prioritas: ${task.priority}\\nCatatan: ${task.notes || 'Tidak ada catatan'}`);
    lines.push(`STATUS:${task.status === 'selesai' ? 'COMPLETED' : 'CONFIRMED'}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  const icsContent = lines.join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format date in Indonesian
 */
export function formatIndonesianDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

/**
 * Check if date is overdue (past today)
 */
export function isOverdue(dateStr: string, timeStr?: string): boolean {
  const now = new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '23:59').split(':').map(Number);
  const due = new Date(y, m - 1, d, hh, mm);
  return due.getTime() < now.getTime();
}
