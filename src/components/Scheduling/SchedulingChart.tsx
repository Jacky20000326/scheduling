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

type CellStatus = "off" | "break" | "work";

type LegendItem = { role: string; color: string };

interface Props {
  employees: Employee[];
  editingId: string | null;
  roleColors: Record<string, string>;
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  setRoleColors: Dispatch<SetStateAction<Record<string, string>>>;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  handleCancelEdit: () => void;
  reset: UseFormReset<EmployeeFormValues>;
  clearErrors: UseFormClearErrors<EmployeeFormValues>;
}

export const SchedulingChart = ({
  employees,
  editingId,
  roleColors,
  setEmployees,
  setRoleColors,
  setEditingId,
  handleCancelEdit,
  reset,
  clearErrors,
}: Props) => {
  const handleDeleteClick = (employeeId: string) => {
    const targetEmployee = employees.find(
      (employee) => employee.id === employeeId
    );
    const isEditingCurrent = editingId === employeeId;

    setEmployees((prev) => {
      const updatedEmployees = prev.filter(
        (employee) => employee.id !== employeeId
      );

      if (targetEmployee) {
        const roleStillUsed = updatedEmployees.some(
          (employee) => employee.role === targetEmployee.role
        );
        if (!roleStillUsed) {
          setRoleColors((prevColors) => {
            const updatedColors = { ...prevColors };
            delete updatedColors[targetEmployee.role];
            return updatedColors;
          });
        }
      }

      return updatedEmployees;
    });

    if (isEditingCurrent) {
      handleCancelEdit();
    }
  };
  const handleEditClick = (employee: Employee) => {
    setEditingId(employee.id);
    reset({
      name: employee.name,
      role: employee.role,
      shiftStart: toTimeInputValue(employee.shiftStart),
      shiftEnd: toTimeInputValue(employee.shiftEnd),
      breakStart: toTimeInputValue(employee.breakStart),
      breakEnd: toTimeInputValue(employee.breakEnd),
    });
    clearErrors();
  };

  const renderCell = (employee: Employee, slotStart: number): CellStatus => {
    const blockStart = slotStart;
    const blockEnd = slotStart + SLOT_STEP;
    const withinShift = overlaps(
      employee.shiftStart,
      employee.shiftEnd,
      blockStart,
      blockEnd
    );

    if (!withinShift) {
      return "off";
    }

    if (
      employee.breakStart !== null &&
      employee.breakEnd !== null &&
      overlaps(employee.breakStart, employee.breakEnd, blockStart, blockEnd)
    ) {
      return "break";
    }

    return "work";
  };

  const legendItems = useMemo<LegendItem[]>(
    () => Object.entries(roleColors).map(([role, color]) => ({ role, color })),
    [roleColors]
  );

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
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          className="chart__action chart__action--delete"
                          onClick={() => handleDeleteClick(employee.id)}
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                    <span
                      className="chart__role"
                      style={{ backgroundColor: employee.color }}
                    >
                      {employee.role}
                    </span>
                    <span className="chart__work-hours">
                      上班 {workHoursLabel}
                    </span>
                  </div>
                  <div className="chart__hours" style={hoursGridStyle}>
                    {TIME_SLOTS.map((slot) => {
                      const status = renderCell(employee, slot);
                      const cellStyle = {
                        "--cell-color": ROLE_COLOR_OVERRIDES[employee.color],
                      } as CSSProperties;
                      return (
                        <div
                          key={slot}
                          className={`chart__cell chart__cell--${status}`}
                          style={cellStyle}
                        >
                          <span className="chart__cell-label">
                            {status === "work" && "上班"}
                            {status === "break" && "休息"}
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
