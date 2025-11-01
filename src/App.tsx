import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { WORK_END, WORK_START } from "./components/constants";
import { toHourFloat } from "./components/utils";
import { EditScheduling } from "./components/EditScheduling/EditScheduling";
import { SchedulingChart } from "./components/Scheduling/SchedulingChart";
import { Employee, EmployeeFormValues } from "./components/types";

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

  const onSubmit: SubmitHandler<EmployeeFormValues> = (form) => {
    clearErrors();
    const isEditing = Boolean(editingId);
    console.log(form);
    if (!isEditing && employees.length >= 15) {
      setError("root", {
        type: "manual",
        message: "已達 15 位員工的上限。",
      });
      return;
    }

    const name = form.name.trim();

    // Parse shift 1
    const shift1 =
      form.shift1Role && form.shift1Start && form.shift1End
        ? {
            role: form.shift1Role.trim(),
            shiftStart: toHourFloat(form.shift1Start)!,
            shiftEnd: toHourFloat(form.shift1End)!,
          }
        : null;

    // Parse shift 2
    const shift2 =
      form.shift2Role && form.shift2Start && form.shift2End
        ? {
            role: form.shift2Role.trim(),
            shiftStart: toHourFloat(form.shift2Start)!,
            shiftEnd: toHourFloat(form.shift2End)!,
          }
        : null;

    // Validate at least one shift
    if (!shift1 && !shift2) {
      setError("root", {
        type: "manual",
        message: "至少需要填寫一段班次。",
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
          handleCancelEdit={handleCancelEdit}
          setEditingId={setEditingId}
          reset={reset}
          clearErrors={clearErrors}
        />
      </main>
    </div>
  );
}

export default App;
