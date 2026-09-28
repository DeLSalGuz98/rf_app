import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Table, Spinner, Badge } from "react-bootstrap";
import * as XLSX from "xlsx";

// Funciones e Imports de BD
import { SetCapitalLetter } from "../../utils/setCapitalLetterString";
import { getListWorkersDB } from "../../querysDB/workers/getListWorkers";
import { toast } from "react-toastify";

export function PersonalActivo() {
  const [listWorkers, setListWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPersonalActivo();
  }, []);

  const getPersonalActivo = async () => {
    try {
      setLoading(true);
      const res = await getListWorkersDB();
      // Filtrar únicamente los trabajadores que estén activos
      const activos = (res || []).filter((worker) => worker.activo === true);
      setListWorkers(activos);
    } catch (error) {
      console.error("Error al cargar personal activo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar la lista de personal activo a Excel (SCTR)
  const exportlistaSctrExcel = () => {
    if (listWorkers.length === 0) {
      toast.error("No hay personal activo para exportar.");
      return;
    }

    // Mapeo de campos estructurados para el formato requerido de SCTR
    const dataToExport = listWorkers.map((w) => {
      if(w.activo){
        return ({
        Nombre: SetCapitalLetter(w.nombre || ""),
        "Apellido Paterno": SetCapitalLetter(w.apellido_paterno || ""),
        "Apellido Materno": SetCapitalLetter(w.apellido_materno || ""),
        "Tipo Trabajo": SetCapitalLetter(w.tipo_trabajo || ""),
        "Tipo Doc": String(w.tipo_doc || "").toUpperCase(),
        "Nro Doc": w.nro_doc || "",
        Sexo: SetCapitalLetter(w.sexo || ""),
        "Fecha Nacimiento": w.fecha_nacimiento || "",
      })}
    });

    // Crear hoja y libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Ajustar ancho automático de columnas para mejor presentación
    const columnWidths = [
      { wch: 20 }, // Nombre
      { wch: 20 }, // Apellido Paterno
      { wch: 20 }, // Apellido Materno
      { wch: 20 }, // Tipo Trabajo
      { wch: 12 }, // Tipo Doc
      { wch: 15 }, // Nro Doc
      { wch: 12 }, // Sexo
      { wch: 18 }, // Fecha Nacimiento
    ];
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personal Activo SCTR");

    // Generar archivo con la fecha actual en el nombre
    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `SCTR_Personal_Activo_${dateStr}.xlsx`);
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border">
      <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Personal Activo</h5>
          <Badge bg="success" pill>
            {listWorkers.length}
          </Badge>
      </div>

      <div className="table-responsive">
        <Table hover align="middle" className="text-center mb-0 border-top">
          <thead className="table-light text-uppercase small text-muted">
            <tr>
              <th style={{ width: "80px" }}>Estado</th>
              <th className="text-start">Nombre Completo</th>
              <th style={{ width: "100px" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-4 text-muted">
                  <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                  Cargando personal...
                </td>
              </tr>
            ) : listWorkers.length > 0 ? (
              listWorkers.map((e) => {
                const firstName = e.nombre?.trim().split(" ")[0] || "";
                const nameWorker = `${SetCapitalLetter(firstName)} ${SetCapitalLetter(
                  e.apellido_paterno || ""
                )}`;

                return (
                  <tr key={e.id}>
                    <td>
                      <i className="bi bi-person-check-fill fs-5 text-success"></i>
                    </td>
                    <td className="text-start fw-medium text-dark">{nameWorker}</td>
                    <td>
                      <Link
                        className="btn btn-sm btn-outline-primary"
                        to={`/rf/vista-trabajador/${e.id}`}
                        title="Ver detalle del trabajador"
                      >
                        <i className="bi bi-box-arrow-in-up-right"></i>
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-muted">
                  <i className="bi bi-people d-block fs-3 opacity-50 mb-1"></i>
                  No hay personal activo registrado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <Button 
        className="w-100 mt-2" 
        variant="outline-secondary" 
        onClick={exportlistaSctrExcel}
        disabled={loading || listWorkers.length === 0}
      >
          <i className="bi bi-download"></i> Descargar lista (SCTR)
      </Button>
    </div>
  );
}