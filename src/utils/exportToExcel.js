import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportToExcel(data, fileName = "reporte") {
  // Convierte los datos a hoja de Excel
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hoja1");

  // Convierte el libro en un archivo binario
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Guarda el archivo
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}.xlsx`);
}
