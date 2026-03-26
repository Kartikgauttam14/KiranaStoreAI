const FESTIVALS_2025_2026 = [
  { name: 'Dussehra', date: '2025-10-02' },
  { name: 'Diwali', date: '2025-10-20' },
  { name: 'Bhai Dooj', date: '2025-10-22' },
  { name: 'Chhath Puja', date: '2025-10-28' },
  { name: 'Eid ul-Fitr', date: '2026-03-20' },
  { name: 'Holi', date: '2026-03-05' },
  { name: 'Navratri Start', date: '2026-03-22' },
  { name: 'Ram Navami', date: '2026-04-06' },
  { name: 'Eid ul-Adha', date: '2026-05-27' },
  { name: 'Janmashtami', date: '2026-08-16' },
  { name: 'Ganesh Chaturthi', date: '2026-08-23' },
  { name: 'Navratri Start', date: '2026-09-18' },
];

export function getFestivalsInRange(from: Date, to: Date): string[] {
  return FESTIVALS_2025_2026
    .filter((f) => {
      const d = new Date(f.date);
      return d >= from && d <= to;
    })
    .map((f) => f.name);
}
