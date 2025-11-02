import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { WORK_END, WORK_START } from "./components/constants";
import { toHourFloat } from "./components/utils";
import { EditScheduling } from "./components/EditScheduling/EditScheduling";
import { SchedulingChart } from "./components/Scheduling/SchedulingChart";
import { Employee, EmployeeFormValues } from "./components/types";
import { insertScheduleTable } from "./supabase/utils";

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
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
      shift1Role: "",
      shift1Start: "10:00",
      shift1End: "14:00",
      shift2Role: "",
      shift2Start: "17:00",
      shift2End: "21:00",
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

    // 第一段班：根據工作項目判斷是否需要填寫
    const hasShift1Role = form.shift1Role && form.shift1Role.trim() !== "";

    if (hasShift1Role) {
      // 如果選了工作項目，檢查時間是否完整
      const hasShift1Start = form.shift1Start && form.shift1Start.trim() !== "";
      const hasShift1End = form.shift1End && form.shift1End.trim() !== "";

      if (!hasShift1Start) {
        setError("shift1Start", {
          type: "manual",
          message: "請輸入第一段班的上班開始時間。",
        });
        return;
      }
      if (!hasShift1End) {
        setError("shift1End", {
          type: "manual",
          message: "請輸入第一段班的上班結束時間。",
        });
        return;
      }
    }

    // 第二段班：只根據工作項目判斷（時間有默認值，用戶不選工作項目就等於不填第二段班）
    const hasShift2Role = form.shift2Role && form.shift2Role.trim() !== "";

    if (hasShift2Role) {
      // 如果選了工作項目，檢查時間是否完整
      const hasShift2Start = form.shift2Start && form.shift2Start.trim() !== "";
      const hasShift2End = form.shift2End && form.shift2End.trim() !== "";

      if (!hasShift2Start) {
        setError("shift2Start", {
          type: "manual",
          message: "請輸入第二段班的上班開始時間。",
        });
        return;
      }
      if (!hasShift2End) {
        setError("shift2End", {
          type: "manual",
          message: "請輸入第二段班的上班結束時間。",
        });
        return;
      }
    }

    // 解析第一段班（只有選了工作項目才解析）
    const shift1 = hasShift1Role
      ? {
          role: form.shift1Role.trim(),
          shiftStart: toHourFloat(form.shift1Start)!,
          shiftEnd: toHourFloat(form.shift1End)!,
        }
      : null;

    // 解析第二段班（只有選了工作項目才解析）
    const shift2 = hasShift2Role
      ? {
          role: form.shift2Role.trim(),
          shiftStart: toHourFloat(form.shift2Start)!,
          shiftEnd: toHourFloat(form.shift2End)!,
        }
      : null;

    // 驗證至少要有一段班次
    if (!shift1 && !shift2) {
      setError("root", {
        type: "manual",
        message: "至少需要選擇一段班次的工作項目。",
      });
      return;
    }

    // Validate shift 1
    if (shift1) {
      if (shift1.shiftStart >= shift1.shiftEnd) {
        setError("shift1End", {
          type: "manual",
          message: "結束時間需晚於開始時間。",
        });
        return;
      }
      if (shift1.shiftStart < WORK_START || shift1.shiftEnd > WORK_END) {
        setError("shift1Start", {
          type: "manual",
          message: `時段需介於 ${WORK_START}:00 ~ ${WORK_END}:00。`,
        });
        return;
      }
    }

    // Validate shift 2
    if (shift2) {
      if (shift2.shiftStart >= shift2.shiftEnd) {
        setError("shift2End", {
          type: "manual",
          message: "結束時間需晚於開始時間。",
        });
        return;
      }
      if (shift2.shiftStart < WORK_START || shift2.shiftEnd > WORK_END) {
        setError("shift2Start", {
          type: "manual",
          message: `時段需介於 ${WORK_START}:00 ~ ${WORK_END}:00。`,
        });
        return;
      }
    }

    const newEmployee: Employee = {
      id: isEditing
        ? editingId!
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      shift1,
      shift2,
    };

    if (isEditing) {
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === editingId ? newEmployee : employee
        )
      );
      setEditingId(null);
    } else {
      setEmployees((prev) => [...prev, newEmployee]);
    }

    reset({
      name: "",
      shift1Role: "",
      shift1Start: "10:00",
      shift1End: "14:00",
      shift2Role: "",
      shift2Start: "17:00",
      shift2End: "21:00",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
    clearErrors();
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>文迪大老闆專用排班工具</h1>
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
          handleCancelEdit={handleCancelEdit}
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
