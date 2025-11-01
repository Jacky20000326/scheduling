import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  COLOR_PALETTE,
  ROLE_COLOR_OVERRIDES,
  WORK_END,
  WORK_START,
} from "./components/constants";
import { toHourFloat } from "./components/utils";
import { EditScheduling } from "./components/EditScheduling/EditScheduling";
import { SchedulingChart } from "./components/Scheduling/SchedulingChart";
import { Employee, EmployeeFormValues } from "./components/types";
import { insertScheduleTable } from "./supabase/utils";

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roleColors, setRoleColors] = useState<Record<string, string>>({});
  const [paletteIndex, setPaletteIndex] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    defaultValues: {
      name: "",
      role: "",
      shiftStart: "10:00",
      shiftEnd: "18:00",
      breakStart: "",
      breakEnd: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<EmployeeFormValues> = async (form) => {
    clearErrors();

    const isEditing = Boolean(editingId);

    if (!isEditing && employees.length >= 15) {
      setError("root", {
        type: "manual",
        message: "已達 15 位員工的上限。",
      });
      return;
    }

    const name = form.name.trim();
    const role = form.role.trim();
    const shiftStart = toHourFloat(form.shiftStart);
    const shiftEnd = toHourFloat(form.shiftEnd);
    const breakStart = form.breakStart ? toHourFloat(form.breakStart) : null;
    const breakEnd = form.breakEnd ? toHourFloat(form.breakEnd) : null;

    if (shiftStart === null || shiftEnd === null) {
      setError("shiftStart", {
        type: "manual",
        message: "請輸入完整的上班時段。",
      });
      setError("shiftEnd", {
        type: "manual",
        message: "請輸入完整的上班時段。",
      });
      return;
    }

    if (shiftStart < WORK_START || shiftEnd > WORK_END) {
      if (shiftStart < WORK_START) {
        setError("shiftStart", {
          type: "manual",
          message: "上班時間需介於 10:00 ~ 23:00。",
        });
      }
      if (shiftEnd > WORK_END) {
        setError("shiftEnd", {
          type: "manual",
          message: "上班時間需介於 10:00 ~ 23:00。",
        });
      }
      return;
    }

    if (shiftStart >= shiftEnd) {
      setError("shiftEnd", {
        type: "manual",
        message: "上班開始時間需早於結束時間。",
      });
      return;
    }

    if (
      (breakStart !== null && breakEnd === null) ||
      (breakStart === null && breakEnd !== null)
    ) {
      setError("breakStart", {
        type: "manual",
        message: "請輸入完整的休息起迄時間，或全部留空。",
      });
      setError("breakEnd", {
        type: "manual",
        message: "請輸入完整的休息起迄時間，或全部留空。",
      });
      return;
    }

    if (breakStart !== null && breakEnd !== null) {
      if (breakStart < shiftStart || breakEnd > shiftEnd) {
        if (breakStart < shiftStart) {
          setError("breakStart", {
            type: "manual",
            message: "休息時段需介於 10:00 ~ 23:00。",
          });
        }
        if (breakEnd > shiftEnd) {
          setError("breakEnd", {
            type: "manual",
            message: "休息時段需介於 10:00 ~ 23:00。",
          });
        }
        return;
      }
      if (breakStart >= breakEnd) {
        setError("breakEnd", {
          type: "manual",
          message: "休息開始時間需早於結束時間。",
        });
        return;
      }
    }

    const overrideColor = ROLE_COLOR_OVERRIDES.hasOwnProperty(role);
    let roleColor = roleColors[role];

    if (overrideColor) {
      roleColor = role;
      setRoleColors((prev) => {
        if (prev[role] === role) {
          return prev;
        }
        return {
          ...prev,
          [role]: role,
        };
      });
    } else if (!roleColor) {
      const nextColor = COLOR_PALETTE[paletteIndex % COLOR_PALETTE.length];
      roleColor = nextColor;
      setRoleColors((prev) => ({
        ...prev,
        [role]: nextColor,
      }));
      setPaletteIndex((prev) => prev + 1);
    }

    const originalEmployee = isEditing
      ? employees.find((employee) => employee.id === editingId)
      : undefined;

    const newEmployee: Employee = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      role,
      color: roleColor,
      shiftStart,
      shiftEnd,
      breakStart,
      breakEnd,
    };

    if (isEditing) {
      setEmployees((prev) => {
        const updatedEmployees = prev.map((employee) =>
          employee.id === editingId
            ? {
                ...employee,
                name,
                role,
                color: roleColor,
                shiftStart,
                shiftEnd,
                breakStart,
                breakEnd,
              }
            : employee
        );

        if (originalEmployee && originalEmployee.role !== role) {
          const roleStillUsed = updatedEmployees.some(
            (employee) => employee.role === originalEmployee.role
          );
          if (!roleStillUsed) {
            setRoleColors((prevColors) => {
              const updatedColors = { ...prevColors };
              delete updatedColors[originalEmployee.role];
              return updatedColors;
            });
          }
        }

        return updatedEmployees;
      });
      setEditingId(null);
    } else {
      setEmployees((prev) => [...prev, newEmployee]);
    }

    const data = await insertScheduleTable(form);
    console.log(data);
    reset();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
    clearErrors();
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>排班長條圖</h1>
        <p>新增員工的上班與休息時段，快速掌握誰正在工作或休息。</p>
      </header>
      <main className="layout">
        <EditScheduling
          register={register}
          handleSubmit={handleSubmit}
          control={control}
          onSubmit={onSubmit}
          errors={errors}
          editingId={editingId}
          handleCancelEdit={handleCancelEdit}
        />
        <SchedulingChart
          employees={employees}
          editingId={editingId}
          setEmployees={setEmployees}
          setRoleColors={setRoleColors}
          handleCancelEdit={handleCancelEdit}
          roleColors={roleColors}
          setEditingId={setEditingId}
          reset={reset}
          clearErrors={clearErrors}
        />
      </main>
    </div>
  );
}

export { App as SchedulingPage };
export default App;
