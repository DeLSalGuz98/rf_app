// TableIngresos.jsx

import { useEffect, useState } from "react";
import { Table, Spinner, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { getListIngresosProyectoDB } from "../../../querysDB/ingresos/getListIngresosProyecto";
import { SetCapitalLetter } from "../../../utils/setCapitalLetterString";
import { convertirMoneda } from "../../../utils/convertirMoneda";
import { formatMoneda } from "../../../utils/formatoMoneda";
import { deleteIncomeProjectDB } from "../../../querysDB/ingresos/deleteIncome";
// const formatCurrency = (value) => {
//   return new Intl.NumberFormat("es-PE", {
//     style: "currency",
//     currency: "PEN",
//   }).format(value || 0);
// };

export function TableIngresos({ idProject }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [idProject]);

  // ==============================
  // FETCH
  // ==============================
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getListIngresosProyectoDB(idProject);

      // 🔒 Protección contra datos inválidos
      const cleanData = convertirMoneda(res || []);

      setList(cleanData);
    } catch (error) {
      console.error(error);
      setList([]);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (idIncome) => {
      const confirmDelete = window.confirm("¿Eliminar este Item?");
      if (!confirmDelete) return;
  
      try {
        await deleteIncomeProjectDB(idIncome);
        await fetchData();
      } catch (error) {
        console.error(error);
        alert("Error al eliminar");
      }
    };

  // ==============================
  // UI
  // ==============================
  return (
    <div className="table-responsive">
      <Table striped bordered hover size="sm">
        <thead className="table-light">
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Monto Recibido</th>
            <th>Estado</th>
            <th>Comprobante</th>
            <th>Monto Comprobante</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="text-center py-3">
                <Spinner size="sm" />
              </td>
            </tr>
          ) : list.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-muted py-3">
                No hay resultados
              </td>
            </tr>
          ) : (
            list.map((e) => {
              const hasComprobante = e.id_comprobante;

              return (
                <tr key={e.id}>
                  <td>{e.fecha}</td>

                  <td>
                    <Badge bg="success">
                      {SetCapitalLetter(e.tipo_ingreso)}
                    </Badge>
                  </td>

                  <td>
                    {SetCapitalLetter(e.descripcion)}
                  </td>

                  <td className="text-success fw-bold">
                    {formatMoneda(e.monto_total)}
                  </td>

                  <td>
                    <Badge
                      bg={
                        e.estado === "confirmado"
                          ? "success"
                          : e.estado === "anulado"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {SetCapitalLetter(e.estado)}
                    </Badge>
                  </td>

                  <td>
                    <Badge
                      bg={hasComprobante ? "secondary" : ""}
                    >
                      {SetCapitalLetter(e.documentos_tributarios.serie_comprobante +"-"+ e.documentos_tributarios.nro_comprobante)}
                    </Badge>
                  </td>

                  <td className="text-success fw-bold">
                    {formatMoneda(e.documentos_tributarios.monto)}
                  </td>

                  <td className="d-flex gap-1 justify-content-center">
                    <Link
                      className="btn btn-primary btn-sm"
                      to={`/rf/proyecto/${idProject}/ingreso/${e.id}`}
                    >
                      <i className="bi bi-eye-fill"></i>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(e.id)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}