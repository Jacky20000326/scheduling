import { WORK_END, WORK_START, SLOT_STEP } from "./constants";
import type { Employee } from "./types";

export const overlaps = (
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean => {
  if (endA === startB) {
    return true;
  }
  return Math.max(startA, startB) < Math.min(endA, endB);
};

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
    const shift1Hours = employee.shift1.shiftEnd - employee.shift1.shiftStart;
    console.log(
      `員工 ${employee.name} 第一段班: ${employee.shift1.shiftStart} - ${employee.shift1.shiftEnd} = ${shift1Hours} 小時`
    );
    total += shift1Hours;
  }

  if (employee.shift2) {
    const shift2Hours = employee.shift2.shiftEnd - employee.shift2.shiftStart;
    console.log(
      `員工 ${employee.name} 第二段班: ${employee.shift2.shiftStart} - ${employee.shift2.shiftEnd} = ${shift2Hours} 小時`
    );
    total += shift2Hours;
  }

  console.log(`員工 ${employee.name} 總工時: ${total} 小時`);
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

/**
 * 將員工資料編碼為 URL hash 字串
 * 使用 Base64 編碼確保 URL 安全性，並支援中文字符
 */
export const encodeEmployeesToURL = (employees: Employee[]): string => {
  try {
    const json = JSON.stringify(employees);
    // 使用 encodeURIComponent 處理中文字符，然後 base64 編碼
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch (error) {
    console.error("編碼資料到 URL 時發生錯誤:", error);
    return "";
  }
};

/**
 * 從 URL hash 字串解碼員工資料
 * 包含資料結構驗證，防止惡意或損壞的資料
 */
export const decodeEmployeesFromURL = (
  encoded: string
): Employee[] | null => {
  try {
    if (!encoded || encoded.trim() === "") {
      return null;
    }
    // base64 解碼，然後用 decodeURIComponent 處理中文字符
    const json = decodeURIComponent(atob(encoded));
    const employees = JSON.parse(json) as Employee[];

    // 驗證資料格式
    if (!Array.isArray(employees)) {
      return null;
    }

    // 簡單驗證每個員工物件的結構
    const isValid = employees.every(
      (emp) =>
        typeof emp.id === "string" &&
        typeof emp.name === "string" &&
        (emp.shift1 === null ||
          (typeof emp.shift1 === "object" &&
            typeof emp.shift1.role === "string" &&
            typeof emp.shift1.shiftStart === "number" &&
            typeof emp.shift1.shiftEnd === "number")) &&
        (emp.shift2 === null ||
          (typeof emp.shift2 === "object" &&
            typeof emp.shift2.role === "string" &&
            typeof emp.shift2.shiftStart === "number" &&
            typeof emp.shift2.shiftEnd === "number"))
    );

    return isValid ? employees : null;
  } catch (error) {
    console.error("從 URL 解碼資料時發生錯誤:", error);
    return null;
  }
};
