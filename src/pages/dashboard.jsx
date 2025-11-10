import { Button, Card, Col, Container, Row, Table } from "react-bootstrap"
import { GraphYearIncomeAndExpenses } from "../components/graphMainDash"
import { useState } from "react"
import { useEffect } from "react"
import { getListPendingInvoice } from "../querysDB/taxDocument/getListPendingInvoice"
import { Link } from "react-router-dom"
import { SetCapitalLetter } from "../utils/setCapitalLetterString"

export function DasboardPage() {
  const [invoices, setInvoices] = useState([])
  useEffect(()=>{
    getPedingInvoices()
  },[])
  const getPedingInvoices = async()=>{
    const res = await getListPendingInvoice(["pendiente", "devengado", "girado", "con retencion"])
    setInvoices(res)
  }
  return<>
    <Container>
      <p className="h3">Vista General</p>
      <Row>
        <Col className="p-2 d-flex gap-2" md="4">
          <Card>
            <Card.Header className="fw-bold">Proyectos Pendientes</Card.Header>
            <Card.Body>
              <Card.Text>
                Orden compra: <strong>3</strong> <br />
                Orden de servicio: <strong>1</strong> <br />
                Proyectos: <strong>2</strong>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="fw-bold">Proyectos Finalizados</Card.Header>
            <Card.Body>
              <Card.Text>
                Orden compra: <strong>3</strong> <br />
                Orden de servicio: <strong>1</strong> <br />
                Proyectos: <strong>2</strong>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="p-2" md="8">
          <div className="border rounded" style={{height: "200px"}}>
            <GraphYearIncomeAndExpenses></GraphYearIncomeAndExpenses>
          </div>
        </Col>
        <Col className="p-2" md="8">
        <p className="fw-bold">Facturas Pendientes de pago</p>
          <Table  hover className="align-middle text-center border ">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Descripcion</th>
                <th className="text-nowrap">U. Ejecutora</th>
                <th className="text-nowrap">Exp. SIAF</th>
                <th>Fecha Emision</th>
                <th>Fecha Venciento</th>
                <th>Monto Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {
                invoices.map(e=>{
                  const hoy = new Date();
                  const fin = new Date(e.fecha_vencimiento);

                  // Diferencia en milisegundos
                  const diferencia = fin - hoy;

                  // Convertir a días
                  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

                  const estaVencido = dias >= 3 ? false : true

                  return (<tr key={e.id}>
                    <td className="text-nowrap">{e.proyectos.nombre_proyecto}</td>
                    <td>{e.proyectos.descripcion_proyecto}</td>
                    <td>{e.proyectos.unidad_ejecutora}</td>
                    <td>{e.proyectos.exp_siaf}</td>
                    <td className="text-nowrap">{e.fecha_emision}</td>
                    <td className={`text-nowrap ${estaVencido?"bg-danger-subtle":""}`}>{e.fecha_vencimiento}</td>
                    <td className="text-nowrap">S/. {Number(e.monto).toFixed(2)}</td>
                    <td className="text-nowrap">{SetCapitalLetter(e.estado_comprobante)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <a className="btn btn-primary" href={`https://apps2.mef.gob.pe/consulta-vfp-webapp/consultaExpediente.jspx`} target="_blank"><i className="bi bi-eye-fill"></i></a>
                        <Link className="btn btn-secondary" to={`/rf/editar-documento/${e.id}`} ><i className="bi bi-pen-fill"></i></Link>
                      </div>
                    </td>
                  </tr>)
                })
              }
            </tbody>
          </Table>
        </Col>        
        <Col className="border" md="4">
          personal activo
        </Col>
      </Row>
    </Container>
  </>
}