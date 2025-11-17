import { Button, ButtonGroup, Card, Col, Container, Row, Table } from "react-bootstrap"
import { GraphYearIncomeAndExpenses } from "../components/graphMainDash"
import { useState } from "react"
import { useEffect } from "react"
import { getListPendingInvoice } from "../querysDB/taxDocument/getListPendingInvoice"
import { Link } from "react-router-dom"
import { SetCapitalLetter } from "../utils/setCapitalLetterString"
import { GetAllListProjects } from "../querysDB/projects/getAllProjects"
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany"

export function DasboardPage() {
  const [invoices, setInvoices] = useState([])
  const [listProjects, setListProjects] = useState([])
  useEffect(()=>{
    getPedingInvoices()
    getAllProjects()
  },[])
  const getPedingInvoices = async()=>{
    const res = await getListPendingInvoice(["pendiente", "devengado", "girado", "con retencion"])
    setInvoices(res)
  }
  const getAllProjects = async ()=>{
      const resOne = await GetUserNameAndNameCompany()
      const resTwo = await GetAllListProjects("pendiente", resOne.idEmpresa)
      console.log(resTwo)
      setListProjects(resTwo)
    }
  return<>
    <Container>
      <div className="d-flex justify-content-between">
        <p className="h3">Vista General</p>
      </div>
      <Row>
        <Col className="p-2" md="12">
          <div className="border rounded" style={{height: "200px"}}>
            <GraphYearIncomeAndExpenses></GraphYearIncomeAndExpenses>
          </div>
        </Col>
        <Col className="p-2" md="9">
          <p className="fs-5 fw-bold">Facturas Pendientes de pago</p>
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
                        <a className="btn btn-primary" href={`https://apps2.mef.gob.pe/consulta-vfp-webapp/consultaExpediente.jspx`} target="_blank"><i class="bi bi-display"></i></a>
                        <Link className="btn btn-secondary" to={`/rf/editar-documento/${e.id}`} ><i className="bi bi-pen-fill"></i></Link>
                      </div>
                    </td>
                  </tr>)
                })
              }
            </tbody>
          </Table>
          <p className="fs-5 fw-bold">Proyectos Pendientes</p>
          <Table  hover className="align-middle text-center border ">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Descripcion</th>
                <th className="text-nowrap">Fecha Inicio</th>
                <th className="text-nowrap">Fecha Final</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {
                listProjects.map(e=>{
                  return (<tr key={e.id}>
                    <td className="text-nowrap">{e.nombre_proyecto}</td>
                    <td>{SetCapitalLetter(e.descripcion_proyecto)}</td>
                    <td>{e.fecha_inicio}</td>
                    <td>{e.fecha_fin}</td>
                    <td className="text-nowrap">{e.tipo}</td>
                    <td className="text-nowrap">S/. {Number(e.monto_ofertado).toFixed(2)}</td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <Link className="btn btn-primary fs-5" to={`/rf/proyecto/${e.id}`} ><i className="bi bi-box-arrow-in-up-right"></i></Link>
                      </div>
                    </td>
                  </tr>)
                })
              }
            </tbody>
          </Table>
        </Col>        
        <Col className="pt-2" md="3">
          <p className="fs-5 fw-bold">Personal Activo</p>
          <div className="border p-2">
            <Table  hover className="align-middle text-center ">
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-nowrap fs-4 text-success fw-bold"><i class="bi bi-person-check"></i></td>
                  <td>{SetCapitalLetter("Daniel Chipa")}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <Link className="btn btn-primary fs-6" to={`/rf/proyecto/${123}`} ><i className="bi bi-box-arrow-in-up-right"></i></Link>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="text-nowrap fs-4 text-success fw-bold"><i class="bi bi-person-check"></i></td>
                  <td>{SetCapitalLetter("Cesar Cahuascancco")}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <Link className="btn btn-primary fs-6" to={`/rf/proyecto/${123}`} ><i className="bi bi-box-arrow-in-up-right"></i></Link>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="text-nowrap fs-4 text-danger fw-bold"><i class="bi bi-person-fill-x"></i></td>
                  <td>{SetCapitalLetter("Alan Wilson")}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <Link className="btn btn-primary fs-6" to={`/rf/proyecto/${123}`} ><i className="bi bi-box-arrow-in-up-right"></i></Link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
            <Button className="w-100" variant="secondary" onClick={()=>{alert("Esta opcion aun no esta disponible")}}><i class="bi bi-download"></i> Descargar lista (SCTR)</Button>
          </div>
        </Col>
      </Row>
    </Container>
  </>
}