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
            /* Estilos de la vista en pantalla */
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            h4 { border-bottom: 2px solid #0d6efd; padding-bottom: 6px; margin-top: 30px; color: #0d6efd; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .total-row, .summary-row { font-weight: bold; background-color: #f1f1f1; }
            .utilidad { color: #198754; font-size: 1.1em; } 
            
            /* ================================================= */
            /* ======== OPTIMIZACIÓN DE IMPRESIÓN (PDF) ======== */
            /* ================================================= */

            @media print {
                @page {
                    margin: 1cm; /* Márgenes ajustados para ahorrar espacio */
                }
                body {
                    margin: 0.5cm;
                    font-size: 10pt; 
                }
                
                h3, h4 {
                    margin-top: 10px;
                    margin-bottom: 5px;
                    font-size: 1.1em;
                }

                /* Ajuste de Tablas */
                table {
                    width: 100% !important; 
                }
                
                th, td {
                    padding: 4px !important; /* Reducción de espaciado */
                    font-size: 9pt; 
                    white-space: normal !important; /* CORRECCIÓN: Permitir que el texto salte de línea */
                }
                
                /* Corrección de Layout de Bootstrap para las columnas */
                .row {
                    display: flex !important; 
                    flex-wrap: nowrap !important;
                    width: 100% !important;
                }
                
                .col-md-6, .col {
                    flex: 0 0 50% !important; 
                    max-width: 50% !important;
                    padding-left: 5px !important;
                    padding-right: 5px !important;
                }

                /* Ocultar y limpiar */
                .btn-primary { display: none; }
                .card, .p-4 { border: none !important; box-shadow: none !important; padding: 0 !important; }
            }
        </style>
        </head>
        <body>
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