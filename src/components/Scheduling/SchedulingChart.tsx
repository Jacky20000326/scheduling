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
}

export const SchedulingChart = ({
  employees,
  editingId,
  setEmployees,
  setEditingId,
  handleCancelEdit,
  reset,
  clearErrors,
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
                    {employee.shift1 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor:
                              ROLE_COLOR_OVERRIDES[employee.shift1.role],
                            width: "10px",
                            height: "10px",
                          }}
                        />
                        <span className="chart__role">
                          第一段班: {employee.shift1.role}
                        </span>
                      </div>
                    )}
                    {employee.shift2 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor:
                              ROLE_COLOR_OVERRIDES[employee.shift2.role],
                            width: "10px",
                            height: "10px",
                          }}
                        />
                        <span className="chart__role">
                          第二段班: {employee.shift2.role}
                        </span>
                      </div>
                    )}
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
                            {cellData.status === "work" ? "上班" : "休息"}
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
