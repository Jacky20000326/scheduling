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
  吧台: "#FB7185",
  內場: "#D946EF",
  外場: "#E11D48",
};
export const FROM_REGISTER_NAME = {
  NAME: "name",
  SHIFT1_ROLE: "shift1Role",
  SHIFT1_START: "shift1Start",
  SHIFT1_END: "shift1End",
  SHIFT2_ROLE: "shift2Role",
  SHIFT2_START: "shift2Start",
  SHIFT2_END: "shift2End",
} as const;
