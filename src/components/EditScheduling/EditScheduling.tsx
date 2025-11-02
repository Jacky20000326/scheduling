import styles from "./EditScheduling.module.css";

import {
  Control,
  useWatch,
  type FieldErrors,
  type SubmitHandler,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from "react-hook-form";

import { isHalfHour } from "../utils";
import { FROM_REGISTER_NAME } from "../constants";
import { EmployeeFormValues } from "../types";

const ROLE_OPTIONS = ["客服", "菜口", "跑菜", "內場", "外場"];

type EditEmployeeProps = {
  register: UseFormRegister<EmployeeFormValues>;
  handleSubmit: UseFormHandleSubmit<EmployeeFormValues>;
  control: Control<EmployeeFormValues, any, EmployeeFormValues>;
  onSubmit: SubmitHandler<EmployeeFormValues>;
  errors: FieldErrors<EmployeeFormValues>;
  editingId: string | null;
  handleCancelEdit: () => void;
};

export const EditScheduling = ({
  register,
  handleSubmit,
  control,
  onSubmit,
  errors,
  editingId,
  handleCancelEdit,
}: EditEmployeeProps) => {
  const [shift1Start, shift1End, shift2Start, shift2End] = useWatch({
    control,
    name: ["shift1Start", "shift1End", "shift2Start", "shift2End"],
  });
  return (
    <section className="panel">
      <h2>新增員工</h2>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form__row">
          <label htmlFor={FROM_REGISTER_NAME.NAME}>姓名</label>
          <input
            id={FROM_REGISTER_NAME.NAME}
            type="text"
            placeholder="例如：王小明"
            aria-invalid={errors.name ? "true" : "false"}
            {...register(FROM_REGISTER_NAME.NAME, {
              required: "請輸入員工姓名。",
              validate: (value) => value.trim() !== "" || "請輸入員工姓名。",
            })}
          />
          {errors.name && (
            <p className="form__error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className={styles.formLayerTitle}>---- 第一段班 ----</div>
        <div className="form__row">
          <label htmlFor={FROM_REGISTER_NAME.SHIFT1_ROLE}>工作項目</label>
          <select
            id={FROM_REGISTER_NAME.SHIFT1_ROLE}
            aria-invalid={errors.shift1Role ? "true" : "false"}
            {...register(FROM_REGISTER_NAME.SHIFT1_ROLE)}
          >
            <option value="">請選擇工作項目</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.shift1Role && (
            <p className="form__error" role="alert">
              {errors.shift1Role.message}
            </p>
          )}
        </div>

        <div className="form__grid">
          <div className="form__row">
            <label htmlFor={FROM_REGISTER_NAME.SHIFT1_START}>上班開始</label>
            <input
              id={FROM_REGISTER_NAME.SHIFT1_START}
              type="time"
              value={shift1Start}
              aria-invalid={errors.shift1Start ? "true" : "false"}
              {...register(FROM_REGISTER_NAME.SHIFT1_START, {
                validate: (value) =>
                  !value || isHalfHour(value) || "分鐘僅能為 00 或 30。",
              })}
            />
            {errors.shift1Start && (
              <p className="form__error" role="alert">
                {errors.shift1Start.message}
              </p>
            )}
          </div>

          <div className="form__row">
            <label htmlFor={FROM_REGISTER_NAME.SHIFT1_END}>上班結束</label>
            <input
              id={FROM_REGISTER_NAME.SHIFT1_END}
              type="time"
              value={shift1End}
              aria-invalid={errors.shift1End ? "true" : "false"}
              {...register(FROM_REGISTER_NAME.SHIFT1_END, {
                validate: (value) =>
                  !value || isHalfHour(value) || "分鐘僅能為 00 或 30。",
              })}
            />
            {errors.shift1End && (
              <p className="form__error" role="alert">
                {errors.shift1End.message}
              </p>
            )}
          </div>
        </div>

        {/* 第二段班 */}
        <div className={styles.formLayerTitle}>---- 第二段班 ----</div>
        <div className="form__row">
          <label htmlFor={FROM_REGISTER_NAME.SHIFT2_ROLE}>工作項目</label>
          <select
            id={FROM_REGISTER_NAME.SHIFT2_ROLE}
            aria-invalid={errors.shift2Role ? "true" : "false"}
            {...register(FROM_REGISTER_NAME.SHIFT2_ROLE)}
          >
            <option value="">請選擇工作項目</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.shift2Role && (
            <p className="form__error" role="alert">
              {errors.shift2Role.message}
            </p>
          )}
        </div>
        <div className="form__grid">
          <div className="form__row">
            <label htmlFor={FROM_REGISTER_NAME.SHIFT2_START}>上班開始</label>
            <input
              id={FROM_REGISTER_NAME.SHIFT2_START}
              type="time"
              value={shift2Start}
              aria-invalid={errors.shift2Start ? "true" : "false"}
              {...register(FROM_REGISTER_NAME.SHIFT2_START, {
                validate: (value) =>
                  !value || isHalfHour(value) || "分鐘僅能為 00 或 30。",
              })}
            />
            {errors.shift2Start && (
              <p className="form__error" role="alert">
                {errors.shift2Start.message}
              </p>
            )}
          </div>

          <div className="form__row">
            <label htmlFor={FROM_REGISTER_NAME.SHIFT2_END}>上班結束</label>
            <input
              id={FROM_REGISTER_NAME.SHIFT2_END}
              type="time"
              value={shift2End}
              aria-invalid={errors.shift2End ? "true" : "false"}
              {...register(FROM_REGISTER_NAME.SHIFT2_END, {
                validate: (value) =>
                  !value || isHalfHour(value) || "分鐘僅能為 00 或 30。",
              })}
            />
            {errors.shift2End && (
              <p className="form__error" role="alert">
                {errors.shift2End.message}
              </p>
            )}
          </div>
        </div>

        <div className="form__actions">
          <button type="submit" className="form__submit">
            {editingId ? "更新員工" : "新增員工"}
          </button>
          {editingId && (
            <button
              type="button"
              className="form__cancel"
              onClick={handleCancelEdit}
            >
              取消編輯
            </button>
          )}
        </div>
      </form>

      <p className="form__hint">
        最多可新增 15 位員工。每段班次時段需介於 10:00 ~
        23:00，至少需要填寫一段班次。
      </p>
    </section>
  );
};
