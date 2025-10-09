// usePrintReport.js - Solución Optimizada
import { useRef } from "react";

export function usePrintReport() {
  const printRef = useRef();

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    // Abrimos la ventana de impresión con una URL temporal
    const printWindow = window.open("", "_blank", "height=800,width=1000");

    if (!printWindow) {
        // Bloqueador de pop-ups puede impedir abrir la ventana.
        alert("El navegador bloqueó la ventana de impresión. Por favor, desactiva el bloqueador de pop-ups.");
        return; 
    }

    // 1. Escribir el contenido en la nueva ventana
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte Financiero de Proyecto</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            h4 { border-bottom: 2px solid #0d6efd; padding-bottom: 6px; margin-top: 30px; color: #0d6efd; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .total-row, .summary-row { font-weight: bold; background-color: #f1f1f1; }
            .utilidad { color: #198754; font-size: 1.1em; } 
            /* Ocultar elementos innecesarios al imprimir */
            @media print {
                .btn-primary { display: none; }
            }
          </style>
        </head>
        <body>
          <h2 style="text-align: center;">REPORTE FINANCIERO DEL PROYECTO</h2>
          ${printContents}
        </body>
      </html>
    `);

    // 2. Cerrar el documento (permite que el navegador comience a renderizar)
    printWindow.document.close();

    // 3. Esperar a que el contenido esté completamente cargado antes de imprimir.
    // Usamos el evento onload de la ventana para garantizar que el DOM esté listo.
    printWindow.onload = function () {
        printWindow.print();
    };
  };

  return [printRef, handlePrint];
}