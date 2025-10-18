import { format, parseISO } from "date-fns";

export function frmtFecha(date, frmt="dd/MM/yyyy"){
  return format(parseISO(date), frmt);
}