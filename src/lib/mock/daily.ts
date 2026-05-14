export type MealType = "lunch" | "dinner";

export type FoodOption = {
  id: string;
  name: string;
  mealType: MealType | "both";
  enabled: boolean;
  weight: number;
};

export type SpinRecord = {
  id: string;
  mealType: MealType;
  optionName: string;
  accepted: boolean | null;
  createdAt: Date;
};

export type WalletKind = "in" | "out";

export type WalletLabel = {
  id: string;
  name: string;
  color: string;
};

export type WalletEntry = {
  id: string;
  kind: WalletKind;
  amount: number;
  currency: string;
  place: string | null;
  description: string | null;
  occurredAt: Date;
  labels: WalletLabel[];
};

export const MOCK_FOOD_OPTIONS: FoodOption[] = [
  { id: "f1", name: "Chicken rice", mealType: "both", enabled: true, weight: 1 },
  { id: "f2", name: "Nasi lemak", mealType: "both", enabled: true, weight: 1 },
  { id: "f3", name: "Char kway teow", mealType: "lunch", enabled: true, weight: 1 },
  { id: "f4", name: "Wantan mee", mealType: "lunch", enabled: true, weight: 1 },
  { id: "f5", name: "Bak kut teh", mealType: "dinner", enabled: true, weight: 1 },
  { id: "f6", name: "Curry mee", mealType: "lunch", enabled: true, weight: 1 },
  { id: "f7", name: "Hokkien mee", mealType: "dinner", enabled: true, weight: 1 },
  { id: "f8", name: "Yong tau foo", mealType: "both", enabled: true, weight: 1 },
];

const today = new Date();
const day = (offset: number, h = 12, m = 30) => {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  d.setHours(h, m, 0, 0);
  return d;
};

export const MOCK_SPIN_RECORDS: SpinRecord[] = [
  { id: "s1", mealType: "lunch", optionName: "Chicken rice", accepted: true, createdAt: day(0, 12, 15) },
  { id: "s2", mealType: "dinner", optionName: "Bak kut teh", accepted: true, createdAt: day(-1, 19, 5) },
  { id: "s3", mealType: "lunch", optionName: "Nasi lemak", accepted: false, createdAt: day(-1, 12, 10) },
  { id: "s4", mealType: "dinner", optionName: "Hokkien mee", accepted: true, createdAt: day(-2, 19, 20) },
  { id: "s5", mealType: "lunch", optionName: "Wantan mee", accepted: null, createdAt: day(-3, 12, 30) },
];

export const MOCK_WALLET_LABELS: WalletLabel[] = [
  { id: "l1", name: "Food", color: "#f97316" },
  { id: "l2", name: "Transport", color: "#3b82f6" },
  { id: "l3", name: "Salary", color: "#10b981" },
  { id: "l4", name: "Groceries", color: "#8b5cf6" },
  { id: "l5", name: "Coffee", color: "#a16207" },
  { id: "l6", name: "Entertainment", color: "#ec4899" },
];

const L = Object.fromEntries(MOCK_WALLET_LABELS.map((l) => [l.id, l]));

export const MOCK_WALLET_ENTRIES: WalletEntry[] = [
  {
    id: "w1",
    kind: "in",
    amount: 4200,
    currency: "MYR",
    place: "Acme Bhd",
    description: "May salary",
    occurredAt: day(-1, 9, 0),
    labels: [L.l3],
  },
  {
    id: "w2",
    kind: "out",
    amount: 12.5,
    currency: "MYR",
    place: "Hawker centre",
    description: "Lunch — chicken rice",
    occurredAt: day(0, 12, 30),
    labels: [L.l1],
  },
  {
    id: "w3",
    kind: "out",
    amount: 6.0,
    currency: "MYR",
    place: "Starbucks",
    description: "Iced latte",
    occurredAt: day(0, 15, 10),
    labels: [L.l5, L.l1],
  },
  {
    id: "w4",
    kind: "out",
    amount: 38.9,
    currency: "MYR",
    place: "Grab",
    description: "Ride to office",
    occurredAt: day(-2, 8, 45),
    labels: [L.l2],
  },
  {
    id: "w5",
    kind: "out",
    amount: 124.4,
    currency: "MYR",
    place: "Jaya Grocer",
    description: "Weekly groceries",
    occurredAt: day(-3, 18, 0),
    labels: [L.l4],
  },
  {
    id: "w6",
    kind: "out",
    amount: 45,
    currency: "MYR",
    place: "GSC",
    description: "Movie + popcorn",
    occurredAt: day(-4, 20, 30),
    labels: [L.l6],
  },
  {
    id: "w7",
    kind: "in",
    amount: 150,
    currency: "MYR",
    place: "Friend",
    description: "Split-bill repayment",
    occurredAt: day(-5, 14, 0),
    labels: [],
  },
];

export function formatMoney(amount: number, currency = "MYR") {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
