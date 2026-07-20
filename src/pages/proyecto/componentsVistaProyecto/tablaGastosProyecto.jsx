// TableGastos.jsx

import { useEffect, useState } from "react";
import { Table, Button, Spinner, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

import { getListExpenditureProject } from "../../../querysDB/gastos/listExpenditureProject";
import { deleteExpenditureProjectDB } from "../../../querysDB/gastos/deleteExpenditure";
import { SetCapitalLetter } from "../../../utils/setCapitalLetterString";
import { convertirMoneda } from "../../../utils/convertirMoneda";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value || 0);
};

export function TableGastos({ idProject }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [idProject]);

  // ==============================
  // FETCH DATA (SIN TRANSFORMACIONES)
  // ==============================
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getListExpenditureProject(idProject);
      const cleanData = convertirMoneda(res)

      setList(cleanData || []);
    } catch (error) {
      console.error(error);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (idExpenditure) => {
    const confirmDelete = window.confirm("¿Eliminar este gasto?");
    if (!confirmDelete) return;

    try {
      await deleteExpenditureProjectDB(idExpenditure);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el gasto");
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
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Descripción</th>
            <th>Precio Unit.</th>
            <th>Total</th>
            <th>Comprobante</th>
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
              const hasComprobante =
                e.serie_comprobante && e.nro_comprobante;

              const comprobante = hasComprobante
                ? `${e.serie_comprobante}-${e.nro_comprobante}`
                : "Sin comprobante";

              return (
                <tr key={e.id}>
                  <td className="text-nowrap">{e.fecha}</td>

                  <td>{e.cantidad}</td>

                  <td>{e.unidad_medida}</td>

                  <td>{SetCapitalLetter(e.descripcion)}</td>

                  {/* Solo mostrar datos */}
                  <td className="text-nowrap">
                    {formatCurrency(e.precio_unitario)}
                  </td>

                  <td
                    className={`text-nowrap ${
                      e.monto_total > 1000
                        ? "text-danger fw-bold"
                        : ""
                    }`}
                  >
                    {formatCurrency(e.monto_total)}
                  </td>

                  <td className="text-center">
                    <Badge
                      bg={hasComprobante ? "secondary" : "warning"}
                    >
                      {SetCapitalLetter(comprobante)}
                    </Badge>
                  </td>

                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <Link
                        className="btn btn-primary btn-sm"
                        to={`/rf/proyecto/${idProject}/gasto/${e.id}`}
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
                    </div>
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