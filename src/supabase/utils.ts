import { EmployeeFormValues } from "../components/types";
import { supabase } from "./connect";

export const insertScheduleTable = async ({
  name,
  role,
  shiftStart,
  shiftEnd,
  breakStart,
  breakEnd,
}: EmployeeFormValues) => {
  const { data, error } = await supabase
    .from("scheduling")
    .insert({
      user_id: "c59d57f2-60d4-431d-ad6c-1d311dc81fb3",
      name,
      role,
      shiftStart,
      shiftEnd,
      breakStart,
      breakEnd,
    })
    .select();
  if (error) {
    console.log(error);
    return;
  }
  return data;
};
