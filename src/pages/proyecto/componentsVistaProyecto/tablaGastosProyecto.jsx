import { useEffect, useState, useMemo } from "react";
import { Table, Button, Spinner, Form, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

// Funciones
import { getListExpenditureProject } from "../../../querysDB/gastos/listExpenditureProject";
import { deleteExpenditureProjectDB } from "../../../querysDB/gastos/deleteExpenditure";
import { SetCapitalLetter } from "../../../utils/setCapitalLetterString";

export function TableExpenditure({ idProject }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 💰 Formato moneda
  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value);

  useEffect(() => {
    fetchExpenditures();
  }, [idProject]);

  const fetchExpenditures = async () => {
    try {
      setLoading(true);

      const res = await getListExpenditureProject(idProject);

      const transformed = res.map((g) => {
        if (g.moneda !== "PEN") {
          const precio = g.precio_unitario * g.tipo_cambio;
          return {
            ...g,
            precio_unitario: precio,
            monto_total: precio * g.cantidad,
          };
        }
        return g;
      });

      setList(transformed);
    } catch (error) {
      console.error(error);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (idExpenditure) => {
    const confirmDelete = window.confirm("¿Eliminar este gasto?");
    if (!confirmDelete) return;

    try {
      await deleteExpenditureProjectDB(idExpenditure);
      await fetchExpenditures();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el gasto");
    }
  };

  // 🔎 FILTRO
  const filteredList = useMemo(() => {
    return list.filter((e) => {
      const text = `${e.descripcion} ${e.serie_comprobante}${e.nro_comprobante}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [list, search]);

  // 📊 TOTAL
  const total = useMemo(() => {
    return filteredList.reduce((acc, e) => acc + e.monto_total, 0);
  }, [filteredList]);

  return (
    <div>

      {/* 🔎 BUSCADOR + TOTAL */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Form.Control
          size="sm"
          placeholder="Buscar descripción o comprobante..."
          style={{ maxWidth: "300px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="fw-bold">
          Total: {formatCurrency(total)}
        </div>
      </div>

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
                <td colSpan={8}>
                  <div className="d-flex justify-content-center py-3">
                    <Spinner size="sm" />
                  </div>
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted py-3">
                  No hay resultados
                </td>
              </tr>
            ) : (
              filteredList.map((e) => {
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

                    <td className="text-start">
                      {SetCapitalLetter(e.descripcion)}
                    </td>

                    <td className="text-nowrap">
                      {formatCurrency(e.precio_unitario)}
                    </td>

                    {/* ⚠️ resaltado de montos altos */}
                    <td
                      className={`text-nowrap ${
                        e.monto_total > 1000 ? "text-danger fw-bold" : ""
                      }`}
                    >
                      {formatCurrency(e.monto_total)}
                    </td>

                    {/* ⚠️ comprobante visual */}
                    <td className="text-nowrap text-center">
                      <Badge bg={hasComprobante ? "secondary" : "warning"}>
                        {SetCapitalLetter(comprobante)}
                      </Badge>
                    </td>

                    <td>
                      <div className="d-flex gap-1 justify-content-center">
                        <Link
                          className="btn btn-primary btn-sm"
                          to={`/rf/proyecto/${idProject}/gasto/${e.id}`}
                          title="Ver detalle"
                        >
                          <i className="bi bi-eye-fill"></i>
                        </Link>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(e.id)}
                          title="Eliminar gasto"
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
    </div>
  );
}