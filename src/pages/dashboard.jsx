import { Button, Card, Col, Container, Row } from "react-bootstrap"
import { GraphYearIncomeAndExpenses } from "../components/graphMainDash"
import { TableComponent } from "../components/tableComponent"
import { useState } from "react"
import { useEffect } from "react"
import { getListPendingInvoice } from "../querysDB/taxDocument/getListPendingInvoice"
import { Link } from "react-router-dom"

export function DasboardPage() {
  const [invoices, setInvoices] = useState([])
  useEffect(()=>{
    getPedingInvoices()
  },[])
  const getPedingInvoices = async()=>{
    const res = await getListPendingInvoice()
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
          <TableComponent>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Descripcion</th>
                <th className="text-nowrap">U. Ejecutora</th>
                <th className="text-nowrap">Exp. SIAF</th>
                <th>Fecha Emision</th>
                <th>Fecha Venciento</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {
                invoices.map(e=><tr key={e.id}>
                  <td className="text-nowrap">{e.proyectos.nombre_proyecto}</td>
                  <td>{e.proyectos.descripcion_proyecto}</td>
                  <td>{e.proyectos.unidad_ejecutora}</td>
                  <td>{e.proyectos.exp_siaf}</td>
                  <td className="text-nowrap">{e.fecha_emision}</td>
                  <td className="text-nowrap">{e.fecha_vencimiento}</td>
                  <td className="text-nowrap">S/. {Number(e.monto).toFixed(2)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <a className="btn btn-primary" href={`https://apps2.mef.gob.pe/consulta-vfp-webapp/consultaExpediente.jspx`} target="_blank"><i className="bi bi-eye-fill"></i></a>
                      <Link className="btn btn-secondary" to={`/rf/editar-documento/${e.id}`} ><i className="bi bi-pen-fill"></i></Link>
                    </div>
                  </td>
                </tr>)
              }
            </tbody>
          </TableComponent>
        </Col>        
        <Col className="border" md="4">
          personal activo
        </Col>
      </Row>
    </Container>
  </>
}