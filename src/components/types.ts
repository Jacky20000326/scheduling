export type Shift = {
  role: string;
  shiftStart: number;
  shiftEnd: number;
};

export type Employee = {
  id: string;
  name: string;
  shift1: Shift | null;
  shift2: Shift | null;
};

export type EmployeeFormValues = {
  name: string;
  shift1Role: string;
  shift1Start: string;
  shift1End: string;
  shift2Role: string;
  shift2Start: string;
  shift2End: string;
  root?: string;
};
