import { format, parseISO } from "date-fns";

export function formatDate(date, frmt="dd/MM/yyyy"){
  return format(parseISO(date), frmt);
}