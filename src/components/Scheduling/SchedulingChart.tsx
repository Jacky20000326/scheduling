import { CSSProperties, Dispatch, SetStateAction, useMemo } from "react";
import { Employee, EmployeeFormValues } from "../types";
import {
  calculateWorkHours,
  formatHourLabel,
  formatWorkDuration,
  overlaps,
  TIME_SLOTS,
  toTimeInputValue,
} from "../utils";
import { ROLE_COLOR_OVERRIDES, SLOT_STEP, SLOT_WIDTH_PX } from "../constants";
import { UseFormClearErrors, UseFormReset } from "react-hook-form";

type CellStatus = "off" | "work";

interface Props {
  employees: Employee[];
  editingId: string | null;
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  handleCancelEdit: () => void;
  reset: UseFormReset<EmployeeFormValues>;
  clearErrors: UseFormClearErrors<EmployeeFormValues>;
  onSave: () => void;
}

export const SchedulingChart = ({
  employees,
  editingId,
  setEmployees,
  setEditingId,
  handleCancelEdit,
  reset,
  clearErrors,
  onSave,
}: Props) => {
  const handleDeleteClick = (employeeId: string) => {
    const isEditingCurrent = editingId === employeeId;

    setEmployees((prev) =>
      prev.filter((employee) => employee.id !== employeeId)
    );

    if (isEditingCurrent) {
      handleCancelEdit();
    }
  };
  const handleEditClick = (employee: Employee) => {
    setEditingId(employee.id);
    reset({
      name: employee.name,
      shift1Role: employee.shift1?.role || "",
      shift1Start: toTimeInputValue(employee.shift1?.shiftStart),
      shift1End: toTimeInputValue(employee.shift1?.shiftEnd),
      shift2Role: employee.shift2?.role || "",
      shift2Start: toTimeInputValue(employee.shift2?.shiftStart),
      shift2End: toTimeInputValue(employee.shift2?.shiftEnd),
    });
    clearErrors();
  };

  const renderCell = (
    employee: Employee,
    slotStart: number
  ): { status: CellStatus; role?: string } => {
    const blockStart = slotStart;
    const blockEnd = slotStart + SLOT_STEP;
    // Check if in shift1
    if (
      employee.shift1 &&
      overlaps(
        employee.shift1.shiftStart,
        employee.shift1.shiftEnd,
        blockStart,
        blockEnd
      )
    ) {
      return { status: "work", role: employee.shift1.role };
    }

    // Check if in shift2
    if (
      employee.shift2 &&
      overlaps(
        employee.shift2.shiftStart,
        employee.shift2.shiftEnd,
        blockStart,
        blockEnd
      )
    ) {
      return { status: "work", role: employee.shift2.role };
    }

    return { status: "off" };
  };

  const hoursGridStyle = useMemo<CSSProperties>(
    () => ({
      gridTemplateColumns: `repeat(${TIME_SLOTS.length}, minmax(${SLOT_WIDTH_PX}px, ${SLOT_WIDTH_PX}px))`,
    }),
    []
  );

  const totalWorkHours = useMemo(
    () =>
      employees.reduce(
        (sum, employee) => sum + calculateWorkHours(employee),
        0
      ),
    [employees]
  );

  return (
    <section className="panel panel--stretch">
      <div className="chart">
        <div className="chart__header">
          <div className="chart__label chart__label--header">員工</div>
          <div className="chart__hours-container chart__hours-container--header">
            <div className="chart__hours" style={hoursGridStyle}>
              {!!employees.length &&
                TIME_SLOTS.map((slot) => (
                  <div key={slot} className="chart__hour">
                    {formatHourLabel(slot)}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="chart__empty">目前沒有排班資料，請先新增員工。</div>
        ) : (
          <div className="chart__rows">
            {employees.map((employee) => {
              const workHours = calculateWorkHours(employee);
              const workHoursLabel = formatWorkDuration(workHours);
              return (
                <div key={employee.id} className="chart__row">
                  <div className="chart__label">
                    <div className="chart__label-header">
                      <span className="chart__name">{employee.name}</span>
                      <div className="chart__actions">
                        <button
                          type="button"
                          className="chart__action chart__action--edit"
                          onClick={() => handleEditClick(employee)}
                          title="編輯"
                          aria-label="編輯員工"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="chart__action chart__action--delete"
                          onClick={() => handleDeleteClick(employee.id)}
                          title="刪除"
                          aria-label="刪除員工"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <span className="chart__work-hours">
                      上班 {workHoursLabel}
                    </span>
                  </div>
                  <div className="chart__hours" style={hoursGridStyle}>
                    {TIME_SLOTS.map((slot) => {
                      const cellData = renderCell(employee, slot);
                      const cellStyle = cellData.role
                        ? ({
                            "--cell-color": ROLE_COLOR_OVERRIDES[cellData.role],
                          } as CSSProperties)
                        : {};
                      return (
                        <div
                          key={slot}
                          className={`chart__cell chart__cell--${cellData.status}`}
                          style={cellStyle}
                        >
                          <span className="chart__cell-label">
                            {cellData.status === "work"
                              ? cellData.role
                              : "休息"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {employees.length > 0 && (
        <div className="chart__summary">
          當日總工時：{formatWorkDuration(totalWorkHours)}
        </div>
      )}

      {employees.length > 0 && (
        <div className="chart__save-section">
          <button
            type="button"
            className="chart__save-button"
            onClick={onSave}
            title="保存排班資料"
            aria-label="保存排班資料到瀏覽器"
          >
            💾 保存排班資料
          </button>
        </div>
      )}

      <div className="legend">
        <h3>工作項目顏色對應</h3>
        <ul>
          {Object.entries(ROLE_COLOR_OVERRIDES).map(([role, color]) => (
            <li key={role}>
              <span
                className="legend__swatch"
                style={{ backgroundColor: color }}
              />
              <span>{role}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
