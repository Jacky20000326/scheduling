import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { WORK_END, WORK_START } from "./components/constants";
import {
  toHourFloat,
  encodeEmployeesToURL,
  decodeEmployeesFromURL,
} from "./components/utils";
import { EditScheduling } from "./components/EditScheduling/EditScheduling";
import { SchedulingChart } from "./components/Scheduling/SchedulingChart";
import { SaveSuccessPopup } from "./components/SaveSuccessPopup/SaveSuccessPopup";
import { Employee, EmployeeFormValues } from "./components/types";

const STORAGE_KEY = "scheduling-employees";

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

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

  // 從 URL 或 localStorage 讀取資料（URL 優先）
  useEffect(() => {
    try {
      // 優先從 URL hash 讀取
      const hash = window.location.hash;
      if (hash.startsWith("#data=")) {
        const encoded = hash.substring(6); // 移除 "#data="
        const urlData = decodeEmployeesFromURL(encoded);
        if (urlData) {
          setEmployees(urlData);
          return;
        }
      }

      // 如果 URL 沒有資料，則從 localStorage 讀取
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as Employee[];
        setEmployees(parsedData);
      }
    } catch (error) {
      console.error("無法讀取資料:", error);
    }
  }, []);

  // 當 employees 改變時，自動同步到 URL
  useEffect(() => {
    if (employees.length === 0) {
      // 如果沒有員工資料，清除 URL hash
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      return;
    }

    const encoded = encodeEmployeesToURL(employees);
    if (encoded) {
      const newHash = `#data=${encoded}`;
      // 使用 replaceState 避免產生瀏覽器歷史記錄
      window.history.replaceState(null, "", newHash);
    }
  }, [employees]);

  const onSubmit: SubmitHandler<EmployeeFormValues> = (form) => {
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

  const handleSaveToLocalStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
      const currentUrl = window.location.href;
      setShareUrl(currentUrl);
      setShowSavePopup(true);
    } catch (error) {
      console.error("保存資料時發生錯誤:", error);
      alert("保存失敗，請稍後再試。");
    }
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
          onSave={handleSaveToLocalStorage}
        />
      </main>
      <SaveSuccessPopup
        isOpen={showSavePopup}
        onClose={() => setShowSavePopup(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
}

export default App;
