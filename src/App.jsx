import { useEffect, useMemo, useRef, useState } from 'react';

const WORK_START = 10;
const WORK_END = 23;
const SLOT_STEP = 0.5;
const SLOT_WIDTH_PX = 72;
const TIME_SLOTS = Array.from(
  { length: (WORK_END - WORK_START) / SLOT_STEP },
  (_, index) => WORK_START + index * SLOT_STEP,
);
const COLOR_PALETTE = [
  '#4F46E5',
  '#F97316', //
  '#10B981',
  '#EC4899',
  '#14B8A6',
  '#6366F1',
  '#E11D48',
  '#0EA5E9',
  '#A855F7',
  '#F59E0B',
  '#84CC16',
  '#D946EF',
  '#FACC15',
  '#FB7185',
  '#22D3EE',
];

const overlaps = (startA, endA, startB, endB) => Math.max(startA, startB) < Math.min(endA, endB);

const toHourFloat = (value) => {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  return hour + minute / 60;
};

const formatHourLabel = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const toTimeInputValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const calculateWorkHours = (employee) => {
  const totalShift = employee.shiftEnd - employee.shiftStart;
  const breakDuration = employee.breakStart !== null ? employee.breakEnd - employee.breakStart : 0;
  return totalShift - breakDuration;
};

const formatWorkDuration = (value) => {
  const totalMinutes = Math.round(value * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours} 小時`;
  }
  return `${hours} 小時 ${minutes} 分`;
};

const ROLE_COLOR_OVERRIDES = {
  菜口: '#1d4ed8',
  跑菜: '#60a5fa',

};

function App() {
  const [employees, setEmployees] = useState([]);
  const [roleColors, setRoleColors] = useState({});
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    role: '',
    shiftStart: '10:00',
    shiftEnd: '18:00',
    breakStart: '',
    breakEnd: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      role: '',
      shiftStart: '10:00',
      shiftEnd: '18:00',
      breakStart: '',
      breakEnd: '',
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const isEditing = Boolean(editingId);

    if (!isEditing && employees.length >= 15) {
      setError('已達 15 位員工的上限。');
      return;
    }

    const name = form.name.trim();
    const role = form.role.trim();
    const shiftStart = toHourFloat(form.shiftStart);
    const shiftEnd = toHourFloat(form.shiftEnd);
    const breakStart = form.breakStart ? toHourFloat(form.breakStart) : null;
    const breakEnd = form.breakEnd ? toHourFloat(form.breakEnd) : null;

    if (!name) {
      setError('請輸入員工姓名。');
      return;
    }

    if (!role) {
      setError('請輸入工作項目。');
      return;
    }

    if (shiftStart === null || shiftEnd === null) {
      setError('請輸入完整的上班時段。');
      return;
    }

    if (shiftStart < WORK_START || shiftEnd > WORK_END) {
      setError('上班時間需介於 10:00 ~ 23:00。');
      return;
    }

    if (shiftStart >= shiftEnd) {
      setError('上班開始時間需早於結束時間。');
      return;
    }

    if ((breakStart !== null && breakEnd === null) || (breakStart === null && breakEnd !== null)) {
      setError('請輸入完整的休息起迄時間，或全部留空。');
      return;
    }

    if (breakStart !== null) {
      if (breakStart < shiftStart || breakEnd > shiftEnd) {
        setError('休息時段需介於 10:00 ~ 23:00。');
        return;
      }
      if (breakStart >= breakEnd) {
        setError('休息開始時間需早於結束時間。');
        return;
      }
    }

    const overrideColor = ROLE_COLOR_OVERRIDES[role];
    let roleColor = roleColors[role];

    if (overrideColor) {
      roleColor = overrideColor;
      setRoleColors((prev) => {
        if (prev[role] === overrideColor) {
          return prev;
        }
        return {
          ...prev,
          [role]: overrideColor,
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

    const originalEmployee = isEditing ? employees.find((employee) => employee.id === editingId) : null;

    const newEmployee = {
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
            : employee,
        );

        if (originalEmployee && originalEmployee.role !== role) {
          const roleStillUsed = updatedEmployees.some((employee) => employee.role === originalEmployee.role);
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

    resetForm();
  };

  const legendItems = useMemo(
    () => Object.entries(roleColors).map(([role, color]) => ({ role, color })),
    [roleColors],
  );

  const hoursGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${TIME_SLOTS.length}, minmax(${SLOT_WIDTH_PX}px, ${SLOT_WIDTH_PX}px))`,
    }),
    [],
  );

  const totalWorkHours = useMemo(
    () => employees.reduce((sum, employee) => sum + calculateWorkHours(employee), 0),
    [employees],
  );

  useEffect(() => {
    const header = headerScrollRef.current;
    const body = bodyScrollRef.current;
    if (!header || !body) {
      return undefined;
    }

    const syncScroll = () => {
      header.scrollLeft = body.scrollLeft;
    };

    body.addEventListener('scroll', syncScroll);
    syncScroll();

    return () => {
      body.removeEventListener('scroll', syncScroll);
    };
  }, [employees.length]);

  const handleEditClick = (employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      role: employee.role,
      shiftStart: toTimeInputValue(employee.shiftStart),
      shiftEnd: toTimeInputValue(employee.shiftEnd),
      breakStart: toTimeInputValue(employee.breakStart),
      breakEnd: toTimeInputValue(employee.breakEnd),
    });
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
    setError('');
  };

  const handleDeleteClick = (employeeId) => {
    const targetEmployee = employees.find((employee) => employee.id === employeeId);
    const isEditingCurrent = editingId === employeeId;

    setEmployees((prev) => {
      const updatedEmployees = prev.filter((employee) => employee.id !== employeeId);

      if (targetEmployee) {
        const roleStillUsed = updatedEmployees.some((employee) => employee.role === targetEmployee.role);
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

  const renderCell = (employee, slotStart) => {
    const blockStart = slotStart;
    const blockEnd = slotStart + SLOT_STEP;
    const withinShift = overlaps(employee.shiftStart, employee.shiftEnd, blockStart, blockEnd);

    if (!withinShift) {
      return 'off';
    }

    if (employee.breakStart !== null && overlaps(employee.breakStart, employee.breakEnd, blockStart, blockEnd)) {
      return 'break';
    }

    return 'work';
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>排班長條圖</h1>
        <p>新增員工的上班與休息時段，快速掌握誰正在工作或休息。</p>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>新增員工</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form__row">
              <label htmlFor="name">姓名</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleInputChange}
                placeholder="例如：王小明"
                required
              />
            </div>

            <div className="form__row">
              <label htmlFor="role">工作項目</label>
              <input
                id="role"
                name="role"
                type="text"
                value={form.role}
                onChange={handleInputChange}
                placeholder="例如：客服"
                required
              />
            </div>

            <div className="form__grid">
              <div className="form__row">
                <label htmlFor="shiftStart">上班開始</label>
                <input
                  id="shiftStart"
                  name="shiftStart"
                  type="time"
                  min="10:00"
                  max="23:00"
                  step="1800"
                  value={form.shiftStart}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form__row">
                <label htmlFor="shiftEnd">上班結束</label>
                <input
                  id="shiftEnd"
                  name="shiftEnd"
                  type="time"
                  min="10:00"
                  max="23:00"
                  step="1800"
                  value={form.shiftEnd}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form__grid">
              <div className="form__row">
                <label htmlFor="breakStart">休息開始</label>
                <input
                  id="breakStart"
                  name="breakStart"
                  type="time"
                  min="10:00"
                  max="23:00"
                  step="1800"
                  value={form.breakStart}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form__row">
                <label htmlFor="breakEnd">休息結束</label>
                <input
                  id="breakEnd"
                  name="breakEnd"
                  type="time"
                  min="10:00"
                  max="23:00"
                  step="1800"
                  value={form.breakEnd}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && <p className="form__error" role="alert">{error}</p>}

            <div className="form__actions">
              <button type="submit" className="form__submit">
                {editingId ? '更新員工' : '新增員工'}
              </button>
              {editingId && (
                <button type="button" className="form__cancel" onClick={handleCancelEdit}>
                  取消編輯
                </button>
              )}
            </div>
          </form>

          <p className="form__hint">最多可新增 15 位員工。上班與休息時段需介於 10:00 ~ 23:00，休息時間可留空。</p>
        </section>

        <section className="panel panel--stretch">
          <div className="chart">
            <div className="chart__header">
              <div className="chart__label chart__label--header">員工</div>
              <div className="chart__hours-container chart__hours-container--header" ref={headerScrollRef}>
                <div className="chart__hours" style={hoursGridStyle}>
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot} className="chart__hour">{formatHourLabel(slot)}</div>
                  ))}
                </div>
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="chart__empty">目前沒有排班資料，請先新增員工。</div>
            ) : (
              <div className="chart__rows" ref={bodyScrollRef}>
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
                        <span className="chart__role" style={{ backgroundColor: employee.color }}>
                          {employee.role}
                        </span>
                        <span className="chart__work-hours">上班 {workHoursLabel}</span>
                      </div>
                      <div className="chart__hours" style={hoursGridStyle}>
                        {TIME_SLOTS.map((slot) => {
                          const status = renderCell(employee, slot);
                          const cellStyle = { '--cell-color': employee.color };
                          return (
                            <div key={slot} className={`chart__cell chart__cell--${status}`} style={cellStyle}>
                              <span className="chart__cell-label">
                                {status === 'work' && '上班'}
                                {status === 'break' && '休息'}
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
            <div className="chart__summary">當日總工時：{formatWorkDuration(totalWorkHours)}</div>
          )}

          {legendItems.length > 0 && (
            <div className="legend">
              <h3>工作項目顏色對應</h3>
              <ul>
                {legendItems.map((item) => (
                  <li key={item.role}>
                    <span className="legend__swatch" style={{ backgroundColor: item.color }} />
                    <span>{item.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
