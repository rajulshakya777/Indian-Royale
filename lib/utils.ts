export const MEAL_PRICE = Number(process.env.NEXT_PUBLIC_MEAL_PRICE || 10);

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export type DayName = (typeof DAY_NAMES)[number];
export type MealType = "lunch" | "dinner";

export function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "RI-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getDayIndex(day: DayName): number {
  const map: Record<DayName, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
  };
  return map[day];
}

export function generateDeliveryDates(
  selectedDays: { day: DayName; mealType: MealType }[],
  weeks: number
): { date: Date; day: DayName; mealType: MealType }[] {
  const now = new Date();
  const minStartTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const deliveries: { date: Date; day: DayName; mealType: MealType }[] = [];

  for (let week = 0; week < weeks + 2; week++) {
    for (const { day, mealType } of selectedDays) {
      const dayIndex = getDayIndex(day);
      const date = new Date(now);
      const currentDay = date.getDay();
      let daysUntil = dayIndex - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      date.setDate(date.getDate() + daysUntil + week * 7);

      const deliveryHour = mealType === "lunch" ? 13 : 19;
      date.setHours(deliveryHour, 0, 0, 0);

      if (date > minStartTime && deliveries.length < selectedDays.length * weeks) {
        deliveries.push({ date, day, mealType });
      }
    }
  }

  return deliveries
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, selectedDays.length * weeks);
}

export function canCancelWithRefund(deliveryDate: Date | string): boolean {
  const now = new Date();
  const d = typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate;
  const hoursUntilDelivery =
    (d.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilDelivery > 48;
}

export function canCancelOrder(deliveryDate: Date | string): boolean {
  const now = new Date();
  const d = typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate;
  return d.getTime() > now.getTime();
}
