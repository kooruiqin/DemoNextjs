export type WheelOption = {
  id: string;
  label: string;
  weight?: number;
};

export function weightedPick(options: WheelOption[]): number {
  const total = options.reduce((s, o) => s + Math.max(1, o.weight ?? 1), 0);
  let r = Math.random() * total;
  for (let i = 0; i < options.length; i++) {
    r -= Math.max(1, options[i].weight ?? 1);
    if (r <= 0) return i;
  }
  return options.length - 1;
}
