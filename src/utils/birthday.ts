import { lunarToSolar } from "./lunar";

export interface BirthdayInfo {
  /** Current age (years) */
  age: number;
  /** Solar date of the next birthday as "YYYY-MM-DD" */
  next_date: string;
  /** Days until next birthday (0 = today) */
  days_left: number;
  /** Whether the birthday is today */
  is_today: boolean;
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Parse "YYYY-MM-DD" into [year, month, day] numbers */
function parseDate(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) {
    throw new Error(`Invalid date: ${s}`);
  }
  return [y, m, d];
}

/** Calculate age given a solar birth date and a reference date */
function calcAge(birthSolar: Date, now: Date): number {
  let age = now.getFullYear() - birthSolar.getFullYear();
  const thisYearBirthday = new Date(now.getFullYear(), birthSolar.getMonth(), birthSolar.getDate());
  if (now < thisYearBirthday) age--;
  return age;
}

/**
 * Compute birthday display info: age, next occurrence, days remaining.
 * @param brithday_date  "YYYY-MM-DD" — solar date if isLunar=0, lunar date if isLunar=1
 * @param isLunar        0 = solar, 1 = lunar
 * @param now             reference "today" (defaults to actual today, UTC+8)
 */
export function computeBirthday(
  brithday_date: string,
  isLunar: number,
  now?: Date,
): BirthdayInfo {
  const today = startOfDay(now ?? new Date());

  if (isLunar) {
    return computeLunarBirthday(brithday_date, today);
  }
  return computeSolarBirthday(brithday_date, today);
}

function computeSolarBirthday(dateStr: string, today: Date): BirthdayInfo {
  const [birthYear, month, day] = parseDate(dateStr);
  const birthSolar = new Date(birthYear, month - 1, day);

  // This year's birthday
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) {
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }

  const age = calcAge(birthSolar, today);
  const daysLeft = Math.round((next.getTime() - today.getTime()) / 86400000);
  const isToday = daysLeft === 0;

  return { age, next_date: fmtDate(next), days_left: daysLeft, is_today: isToday };
}

function computeLunarBirthday(dateStr: string, today: Date): BirthdayInfo {
  const [lunarYear, lunarMonth, lunarDay] = parseDate(dateStr);
  const birthSolar = lunarToSolar(lunarYear, lunarMonth, lunarDay);

  // This year's lunar birthday → solar date
  let thisYearSolar = lunarToSolar(today.getFullYear(), lunarMonth, lunarDay);
  let next: Date;
  if (thisYearSolar >= today) {
    next = thisYearSolar;
  } else {
    next = lunarToSolar(today.getFullYear() + 1, lunarMonth, lunarDay);
  }

  const age = calcAge(birthSolar, today);
  const daysLeft = Math.round((next.getTime() - today.getTime()) / 86400000);
  const isToday = daysLeft === 0;

  return { age, next_date: fmtDate(next), days_left: daysLeft, is_today: isToday };
}
