export type Employee = {
  id: string;
  name: string;
  role: string;
  color: string;
  shiftStart: number;
  shiftEnd: number;
  breakStart: number | null;
  breakEnd: number | null;
};

export type EmployeeFormValues = {
  name: string;
  role: string;
  shiftStart: string;
  shiftEnd: string;
  breakStart: string;
  breakEnd: string;
  root?: string;
};
