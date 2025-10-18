export const WORK_START = 10;
export const WORK_END = 23;
export const SLOT_STEP = 0.5;
export const SLOT_WIDTH_PX = 72;

export const COLOR_PALETTE = [
  "#4F46E5",
  "#F97316",
  "#10B981",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
  "#E11D48",
  "#0EA5E9",
  "#A855F7",
  "#F59E0B",
  "#84CC16",
  "#D946EF",
  "#FACC15",
  "#FB7185",
  "#22D3EE",
];

export const ROLE_COLOR_OVERRIDES: Record<string, string> = {
  菜口: "#1d4ed8",
  跑菜: "#60a5fa",
  客服: "#FB7185",
  內場: "#D946EF",
  外場: "#E11D48",
};
const obj = { foo: "bar", baz: 42 };
console.log(Object.entries(obj)); // [ ['foo', 'bar'], ['baz', 42] ]
