import styles from "./EditScheduling.module.css";

import {
  Control,
  useWatch,
  type FieldErrors,
  type SubmitHandler,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from "react-hook-form";

import { isHalfHour, toTimeInputValue } from "../utils";
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
  const [shiftStart, shiftEnd] = useWatch({
    control,
    name: ["shiftStart", "shiftEnd"],
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
          <label htmlFor={FROM_REGISTER_NAME.ROLE}>工作項目</label>
          <select
            id={FROM_REGISTER_NAME.ROLE}
            aria-invalid={errors.role ? "true" : "false"}
            {...register(FROM_REGISTER_NAME.ROLE, {
              required: "請輸入工作項目。",
              validate: (value) => value.trim() !== "" || "請輸入工作項目。",
            })}
          >
            <option value="" disabled>
              請選擇工作項目
            </option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="form__error" role="alert">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="form__grid">
          <div className="form__row">
            <label htmlFor="shiftStart">上班開始</label>
            <input
              id="shiftStart"
              type="time"
              value={shiftStart}
              aria-invalid={errors.shiftStart ? "true" : "false"}
              {...register("shiftStart", {
                required: "請輸入時段。",
              })}
            />
            {errors.shiftStart && (
              <p className="form__error" role="alert">
                {errors.shiftStart.message}
              </p>
            )}
          </div>

          <div className="form__row">
            <label htmlFor="shiftEnd">上班結束</label>
            <input
              id="shiftEnd"
              type="time"
              value={shiftEnd}
              aria-invalid={errors.shiftEnd ? "true" : "false"}
              {...register("shiftEnd", {
                required: "請輸入時段。",
                validate: (value) =>
                  isHalfHour(value) || "分鐘僅能為 00 或 30。",
              })}
            />
            {errors.shiftEnd && (
              <p className="form__error" role="alert">
                {errors.shiftEnd.message}
              </p>
            )}
          </div>
        </div>

        {/* 第二段班 */}
        <div className={styles.formLayerTitle}>---- 第二段班 ----</div>
        <div className="form__row">
          <label htmlFor={FROM_REGISTER_NAME.ROLE}>工作項目</label>
          <select
            id={FROM_REGISTER_NAME.ROLE}
            aria-invalid={errors.role ? "true" : "false"}
            {...register(FROM_REGISTER_NAME.ROLE, {
              required: "請輸入工作項目。",
              validate: (value) => value.trim() !== "" || "請輸入工作項目。",
            })}
          >
            <option value="" disabled>
              請選擇工作項目
            </option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="form__error" role="alert">
              {errors.role.message}
            </p>
          )}
        </div>
        <div className="form__grid">
          <div className="form__row">
            <label htmlFor="shiftStart">上班開始</label>
            <input
              id="shiftStart"
              type="time"
              value={shiftStart}
              aria-invalid={errors.shiftStart ? "true" : "false"}
              {...register("shiftStart", {
                required: "請輸入時段。",
              })}
            />
            {errors.shiftStart && (
              <p className="form__error" role="alert">
                {errors.shiftStart.message}
              </p>
            )}
          </div>
          <div className="form__row">
            <label htmlFor="shiftEnd">上班結束</label>
            <input
              id="shiftEnd"
              type="time"
              value={shiftEnd}
              aria-invalid={errors.shiftEnd ? "true" : "false"}
              {...register("shiftEnd", {
                required: "請輸入時段。",
                validate: (value) =>
                  isHalfHour(value) || "分鐘僅能為 00 或 30。",
              })}
            />
            {errors.shiftEnd && (
              <p className="form__error" role="alert">
                {errors.shiftEnd.message}
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
        最多可新增 15 位員工。上班與休息時段需介於 10:00 ~
        23:00，休息時間可留空。
      </p>
    </section>
  );
};
