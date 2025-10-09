// ProjectReport.jsx
import { Container, Row, Col, Table, Card, Button } from "react-bootstrap";
import { usePrintReport } from "../hooks/printReportHook";

// --- Simulación de datos (Recomendación: Obtener esto de tu base de datos) ---
const projectData = {
  nombre: "Orden de Compra: 2255",
  descripcion: "Pinza amperimétrica (Suministro y Entrega)",
  montoContratado: 920.00,
  cliente: "Municipalidad Provincial del Cusco",
  rucCliente: "20177217043",
  gastos: [
    { fecha: "17/09/25", desc: "Pinza amperimétrica", tipo: "Materiales", facturado: true, monto: 540.00 },
    { fecha: "18/09/25", desc: "Transporte Segetuc", tipo: "Transporte", facturado: true, monto: 55.00 },
    { fecha: "19/09/25", desc: "Transporte entrega (Viático)", tipo: "Viático", facturado: false, monto: 2.00 },
  ],
  facturasEmitidas: [
    { fechaEmision: "19/09/25", serie: "E001-278", monto: 920.00, fechaVencimiento: "19/10/25" },
  ],
  pagos: [
    { fecha: "07/10/25", serieRetencion: "E001-16444", montoRetenido: 27.60, importePagado: 892.40 },
  ],
};

export function ProjectReport({ data = projectData }) {
  const [printRef, handlePrint] = usePrintReport();

  // --- LÓGICA FINANCIERA CLAVE ---
  const totalGastos = data.gastos.reduce((sum, g) => sum + g.monto, 0);
  const ingresoFacturado = data.facturasEmitidas.reduce((sum, i) => sum + i.monto, 0);
  const totalRetenido = data.pagos.reduce((sum, p) => sum + p.montoRetenido, 0);
  const ingresoNetoRecibido = data.pagos.reduce((sum, p) => sum + p.importePagado, 0);
  
  const utilidadNeta = ingresoNetoRecibido - totalGastos;
  const margenBrutoPorc = (ingresoFacturado > 0) ? ((ingresoFacturado - totalGastos) / ingresoFacturado) * 100 : 0;
  // ----------------------------------

  return (
    <Container className="my-5">
      <Card>
        <Card.Body>
          <div ref={printRef}>
            <h3 className="text-primary mb-4">{data.nombre}</h3>
            
            <h4>1. Información General</h4>
            <Row>
                <Col md={6}>
                    <p><strong>Descripción:</strong> {data.descripcion}</p>
                    <p><strong>Cliente:</strong> {data.cliente} (RUC: {data.rucCliente})</p>
                </Col>
                <Col md={6}>
                    <p><strong>Monto Contratado:</strong> S/ {data.montoContratado.toFixed(2)}</p>
                    <p><strong>Estado:</strong> Finalizado / Cobrado</p>
                </Col>
            </Row>

            <h4>2. Balance de Rentabilidad (Gerencial) 📈</h4>
            <Table bordered responsive className="text-right">
              <tbody>
                <tr className="summary-row">
                    <td className="text-left">A. Ingresos Totales Facturados</td>
                    <td>S/ {ingresoFacturado.toFixed(2)}</td>
                </tr>
                <tr className="summary-row">
                    <td className="text-left">B. Costo Real Total (CRT)</td>
                    <td>S/ {totalGastos.toFixed(2)}</td>
                </tr>
                <tr className="summary-row">
                    <td className="text-left">C. Utilidad Bruta (A - B)</td>
                    <td>S/ {(ingresoFacturado - totalGastos).toFixed(2)}</td>
                </tr>
                <tr>
                    <td className="text-left">Margen Bruto (%)</td>
                    <td className={`font-weight-bold ${margenBrutoPorc >= 0 ? 'utilidad' : 'text-danger'}`}>{margenBrutoPorc.toFixed(2)} %</td>
                </tr>
              </tbody>
            </Table>

            <h4>3. Control de Gastos por Tipo (CRT)</h4>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Facturado (Respaldo)</th>
                  <th>Monto (S/.)</th>
                </tr>
              </thead>
              <tbody>
                {data.gastos.map((gasto, index) => (
                  <tr key={index}>
                    <td>{gasto.fecha}</td>
                    <td>{gasto.desc}</td>
                    <td>{gasto.tipo}</td>
                    <td>{gasto.facturado ? 'Sí' : 'No (Viático/Rendición)'}</td>
                    <td>{gasto.monto.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="4">Total Costo Real del Proyecto (CRT)</td>
                  <td>{totalGastos.toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>

            <h4>4. Flujo de Caja (Liquidez) 💧</h4>
            <Table bordered responsive className="text-right">
                <tbody>
                    <tr><td className="text-left">Monto Facturado al Cliente</td><td>S/ {ingresoFacturado.toFixed(2)}</td></tr>
                    <tr><td className="text-left">(-) Total Gastos Pagados (CRT)</td><td>S/ {totalGastos.toFixed(2)}</td></tr>
                    <tr><td className="text-left">(-) Retención SUNAT aplicada</td><td>S/ {totalRetenido.toFixed(2)}</td></tr>
                    <tr><td className="text-left"><strong>Ingreso Neto en Banco (Efectivo)</strong></td><td><strong>S/ {ingresoNetoRecibido.toFixed(2)}</strong></td></tr>
                    <tr className="total-row">
                        <td className="text-left"><strong>Utilidad Neta en Efectivo (Liquidez)</strong></td>
                        <td className={`font-weight-bold ${utilidadNeta >= 0 ? 'utilidad' : 'text-danger'}`}>S/ {utilidadNeta.toFixed(2)}</td>
                    </tr>
                </tbody>
            </Table>
            
            {/* Ocultamos las tablas de comprobantes en el reporte final para enfocarnos en el resumen, pero se mantienen en el código si las necesitas */}

          </div>
        </Card.Body>
        <Card.Footer className="text-center">
          <Button variant="primary" onClick={handlePrint}>🖨️ Imprimir Reporte Oficial</Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}
// import { Container, Row, Col, Table, Card, Button } from "react-bootstrap";
// import { useRef } from "react";

// export function ProjectReport() {
//   const printRef = useRef();
//   const handlePrint = () => {
//     const printContents = printRef.current.innerHTML;
//     const printWindow = window.open("", "", "height=800,width=1000");
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Reporte Financiero</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               margin: 40px;
//               color: #333;
//             }
//             h4 {
//               border-bottom: 2px solid #0d6efd;
//               padding-bottom: 6px;
//               margin-top: 30px;
//               color: #0d6efd;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               margin-bottom: 20px;
//             }
//             th, td {
//               border: 1px solid #ddd;
//               padding: 8px;
//               text-align: left;
//             }
//             th {
//               background-color: #f8f9fa;
//             }
//             .total-row {
//               font-weight: bold;
//               background-color: #f1f1f1;
//             }
//           </style>
//         </head>
//         <body>${printContents}</body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   return (
//     <Container className="my-5">
//       <div
//         ref={printRef}
//         className="p-4 rounded"
//         style={{
//           backgroundColor: "#fdfdfd",
//           border: "1px solid #dee2e6",
//           boxShadow: "0 0 10px rgba(0,0,0,0.05)",
//         }}
//       >
//         <h4>1. Información general</h4>
//         <p><strong>Descripción:</strong> Pinza amperimétrica</p>
//         <p><strong>Monto contratado:</strong> S/ 920.00</p>
//         <p><strong>Cliente:</strong> Municipalidad Provincial del Cusco</p>
//         <p><strong>Periodo de ejecución:</strong> Septiembre - Octubre 2025</p>

//         <h4>2. Gastos realizados</h4>
//         <Table bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Fecha</th>
//               <th>Descripción</th>
//               <th>Tipo</th>
//               <th>Facturado</th>
//               <th>Monto (S/.)</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr><td>17/09/25</td><td>Pinza amperimétrica</td><td>Directo</td><td>Sí</td><td>540.00</td></tr>
//             <tr><td>18/09/25</td><td>Transporte Segetuc</td><td>Indirecto</td><td>Sí</td><td>55.00</td></tr>
//             <tr><td>19/09/25</td><td>Transporte entrega</td><td>Indirecto</td><td>No</td><td>2.00</td></tr>
//             <tr className="total-row"><td colSpan="4">Total Gastos</td><td>597.00</td></tr>
//           </tbody>
//         </Table>

//         <h4>3. Facturas Recibidas (Proveedores)</h4>
//         <Table bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Fecha</th>
//               <th>Serie</th>
//               <th>Proveedor</th>
//               <th>RUC</th>
//               <th>Monto (S/.)</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr><td>17/09/25</td><td>FF30-102734</td><td>Sonepar Perú SAC</td><td>20111740438</td><td>540.00</td></tr>
//             <tr><td>18/09/25</td><td>FF01-37236</td><td>Segetuc SCRL</td><td>20227342456</td><td>55.00</td></tr>
//           </tbody>
//         </Table>

//         <h4>4. Facturas Emitidas (Cliente)</h4>
//         <Table bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Fecha Emisión</th>
//               <th>Serie</th>
//               <th>Cliente</th>
//               <th>Monto (S/.)</th>
//               <th>Fecha Vencimiento</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr><td>19/09/25</td><td>E001-278</td><td>Municipalidad Provincial del Cusco</td><td>920.00</td><td>19/10/25</td></tr>
//           </tbody>
//         </Table>

//         <h4>5. Retenciones / Pagos Recibidos</h4>
//         <Table bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Fecha</th>
//               <th>Serie Retención</th>
//               <th>Monto Retenido (S/.)</th>
//               <th>Importe Pagado (S/.)</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr><td>07/10/25</td><td>E001-16444</td><td>27.60</td><td>892.40</td></tr>
//           </tbody>
//         </Table>

//         <h4>6. Balance General del Proyecto</h4>
//         <Table bordered hover responsive>
//           <tbody>
//             <tr><td>Ingresos (facturado al cliente)</td><td>920.00</td></tr>
//             <tr><td>(-) Retención SUNAT (3%)</td><td>27.60</td></tr>
//             <tr><td><strong>= Ingreso Neto Recibido</strong></td><td><strong>892.40</strong></td></tr>
//             <tr><td>(-) Total Gastos (directos + indirectos)</td><td>597.00</td></tr>
//             <tr className="total-row">
//               <td><strong>= Resultado del Proyecto (Utilidad)</strong></td>
//               <td><strong>295.40</strong></td>
//             </tr>
//           </tbody>
//         </Table>
//       </div>

//       <div className="text-center mt-4">
//         <Button variant="primary" onClick={handlePrint}>Imprimir reporte</Button>
//       </div>
//     </Container>
// );
// }