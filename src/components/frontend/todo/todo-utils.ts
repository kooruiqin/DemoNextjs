import type { TodoDTO } from "@/server/queries/todo";

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function dateToYMD(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function ymdToDate(s: string): Date {
  const [y, m, d] = s.split("-").map((p) => Number(p));
  return new Date(y, m - 1, d);
}

export function formatTime12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${period}`;
}

export function compareTodos(a: TodoDTO, b: TodoDTO): number {
  if (a.eventDate !== b.eventDate) return a.eventDate < b.eventDate ? -1 : 1;
  const at = a.eventTime ?? "99:99";
  const bt = b.eventTime ?? "99:99";
  if (at !== bt) return at < bt ? -1 : 1;
  return a.createdAt < b.createdAt ? -1 : 1;
}
