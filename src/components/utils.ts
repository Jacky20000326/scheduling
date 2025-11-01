import { WORK_END, WORK_START, SLOT_STEP } from "./constants";
import type { Employee } from "./types";

export const overlaps = (
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean => Math.max(startA, startB) < Math.min(endA, endB);

export const toHourFloat = (
  value: string | null | undefined
): number | null => {
  if (!value) return null;
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour + minute / 60;
};

export const formatHourLabel = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const toTimeInputValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const isHalfHour = (value: string): boolean => {
  if (!value) return true;
  const parts = value.split(":");
  if (parts.length !== 2) return false;
  const mm = Number(parts[1]);
  return mm === 0 || mm === 30;
};

export const calculateWorkHours = (employee: Employee): number => {
  let total = 0;

  if (employee.shift1) {
    total += employee.shift1.shiftEnd - employee.shift1.shiftStart;
  }

  if (employee.shift2) {
    total += employee.shift2.shiftEnd - employee.shift2.shiftStart;
  }

  return total;
};

export const formatWorkDuration = (value: number): string => {
  const totalMinutes = Math.round(value * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours} 小時`;
  }
  return `${hours} 小時 ${minutes} 分`;
};

export const TIME_SLOTS: number[] = Array.from(
  { length: Math.round((WORK_END - WORK_START) / SLOT_STEP) },
  (_, index) => WORK_START + index * SLOT_STEP
);

console.log(TIME_SLOTS);
