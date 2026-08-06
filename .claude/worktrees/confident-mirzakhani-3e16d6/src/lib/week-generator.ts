export interface WeekDay {
  day: string;
  date: string;
  full: string;
  iso: string;
}

export function generateWeek(fromDate: Date = new Date()): WeekDay[] {
  const date = new Date(fromDate);
  const dayOfWeek = date.getDay();
  // Calculate days to subtract to get to Monday
  // Sunday (0) → 6 days back, Monday (1) → 0 days back, Tuesday (2) → 1 day back, etc.
  const daysBack = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - daysBack);

  const weekDays: WeekDay[] = [];
  const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);

    const dayNum = currentDay.getDate();
    const monthNum = currentDay.getMonth();
    const year = currentDay.getFullYear();

    const monthNames = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];

    const full = `${dayNum} de ${monthNames[monthNum]}`;
    // Use local date formatting instead of toISOString() to avoid timezone issues
    const iso = `${year}-${String(monthNum + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

    weekDays.push({
      day: dayLabels[i],
      date: dayNum.toString().padStart(2, "0"),
      full,
      iso,
    });
  }

  return weekDays;
}

export function getCurrentWeekIndex(): number {
  // JavaScript getDay: 0=Sunday, 1=Monday, ..., 6=Saturday
  // Our array indices: 0=Monday, 1=Tuesday, ..., 6=Sunday
  return (new Date().getDay() + 6) % 7;
}

export function getTodayIsoString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateToIsoString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isToday(isoDate: string): boolean {
  return isoDate === getTodayIsoString();
}

export function isBefore(isoDate: string): boolean {
  return isoDate < getTodayIsoString();
}

export function isAfter(isoDate: string): boolean {
  return isoDate > getTodayIsoString();
}
