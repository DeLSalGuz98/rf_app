import { Button, Col, Container, Form, InputGroup, Row, Spinner, Accordion } from "react-bootstrap";
import { TableComponent } from "../components/tableComponent";
import { useEffect } from "react";
import { getListTaxDocumentsByDateDB, getListTaxDocumentsDB } from "../querysDB/taxDocument/getListTaxDoc";
import { useState } from "react";
import { SetCapitalLetter } from "../utils/setCapitalLetterString";
import { Link } from "react-router-dom";
import { frmtFecha } from "../utils/formatDate";

export function ListTaxDocumetPage() {
  const headTable = ["fecha emision", "fecha vencimiento", "serie", "numero", "ruc", "razon social", "tipo cambio", "monto dolares", "montol soles", "tipo documento", "estado", "accion"]
  const [listTaxDocument, setListTaxDocument] =  useState([]) 
  const [loading, setLoading] = useState(true);
  const [filtrosDocs, setFiltrosDocs] = useState(filtrosIniciales)
  const [dateFilter, setDateFilter] = useState(false)
  useEffect(()=>{
    getListTaxDocuments()
  },[])

  const getListTaxDocuments = async ()=>{
    let res
    if(!dateFilter){
      res = await getListTaxDocumentsDB(filtrosDocs.mes_declarado)
    }else{
      res = await getListTaxDocumentsByDateDB(filtrosDocs.desde, filtrosDocs.hasta)
    }
    setLoading(false)
    setListTaxDocument(res)
  }

  function filtrosIniciales() {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");

    const primerDia = `${year}-${month}-01`;

    const dia = String(hoy.getDate()).padStart(2, "0");
    const fechaActual = `${year}-${month}-${dia}`;

    return {
      desde: primerDia,
      hasta: fechaActual,
      tipo_doc: "todos",
      mes_declarado: `${year}-${month}`,
      estado: "todos"
    }
  }

  const addFilterDocs = async (e)=>{
    const {name, value} = e.target
    setFiltrosDocs({...filtrosDocs, [name]: value})  
  }
  const sendFilters = ()=>{
    getListTaxDocuments()
  }

  const activateDateFilter = (e)=>{
    const {checked} = e.target
    setDateFilter(checked)
  }
  const delteTaxDocument = ()=>{
    alert("borrando")
  }
  const [activeKey, setActiveKey] = useState("0");
  return(
    <div className="px-5 py-3">
      <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
        {/* Grupo 1 - Fechas */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Filtros por Fecha</Accordion.Header>
          <Accordion.Body>
            <Form.Check
              type="switch"
              id="dateFilter"
              label="Filtrar por fecha"
              onChange={activateDateFilter}
              checked={dateFilter}
              className="mb-3"
            />
            <Row>
              {dateFilter ? (
                <>
                  <Col md="4">
                    <InputGroup className="mb-3">
                      <InputGroup.Text>Desde</InputGroup.Text>
                      <Form.Control
                        name="desde"
                        type="date"
                        onChange={addFilterDocs}
                        defaultValue={filtrosDocs.desde}
                      />
                    </InputGroup>
                  </Col>
                  <Col md="4">
                    <InputGroup className="mb-3">
                      <InputGroup.Text>Hasta</InputGroup.Text>
                      <Form.Control
                        name="hasta"
                        type="date"
                        onChange={addFilterDocs}
                        defaultValue={filtrosDocs.hasta}
                      />
                    </InputGroup>
                  </Col>
                </>
              ) : (
                <Col md="4">
                  <InputGroup className="mb-3">
                    <InputGroup.Text>Mes declarado</InputGroup.Text>
                    <Form.Control
                      name="mes_declarado"
                      type="month"
                      onChange={addFilterDocs}
                      defaultValue={filtrosDocs.mes_declarado}
                    />
                  </InputGroup>
                </Col>
              )}
              <Col md="4">
                <Button className="w-100" variant="primary" onClick={sendFilters}>
                  Aplicar rango de fechas
                </Button>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Grupo 2 - Tipo y Estado */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Filtros por Tipo y Estado</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md="4">
                <InputGroup className="mb-3">
                  <InputGroup.Text>Tipo Documento</InputGroup.Text>
                  <Form.Select
                    name="tipo_doc"
                    onChange={addFilterDocs}
                    defaultValue={filtrosDocs.tipo_doc}
                  >
                    <option value="todos">Todos</option>
                    <option value="factura recibida">Factura Recibida</option>
                    <option value="factura emitida">Factura Emitida</option>
                    <option value="nc emitido">NC Emitida</option>
                    <option value="nc recibido">NC Recibida</option>
                    <option value="retencion recibido">Retención Recibida</option>
                    <option value="r.h. recibido">Recibo por Honorario Recibido</option>
                  </Form.Select>
                </InputGroup>
              </Col>

              <Col md="4">
                <InputGroup className="mb-3">
                  <InputGroup.Text>Estado de la Factura</InputGroup.Text>
                  <Form.Select
                    name="estado"
                    onChange={addFilterDocs}
                    defaultValue={filtrosDocs.estado}
                  >
                    <option value="todos">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="anulado">Anulado</option>
                    <option value="archivado">Archivado</option>
                  </Form.Select>
                </InputGroup>
              </Col>              
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <br />
      <TableComponent>
        <thead>
          <tr>
            {
              headTable.map((e)=>{
                return<th className=" text-uppercase" key={e}>{e}</th>
              })
            }
          </tr>
        </thead>
        <tbody>
          {loading ? (
              <tr>
                <td colSpan={9}>
                  <div className="d-flex justify-content-center align-items-center">
                    <Spinner animation="border" variant="primary" />
                  </div>
                </td>
              </tr>
            ) : 
            listTaxDocument.map(e=>{
              let rowList = <tr key={e.id}>
                <td>{frmtFecha(e.fecha_emision)}</td>
                <td>{frmtFecha(e.fecha_vencimiento)}</td>
                <td className="text-uppercase" >{e.serie_comprobante}</td>
                <td>{e.nro_comprobante}</td>
                <td>{e.ruc}</td>
                <td className="text-uppercase text-start">{e.razon_social}</td>
                <td>{e.moneda==="PEN"?"":e.tipo_cambio}</td>
                <td>{e.moneda==="PEN"?"":"$ "+e.monto.toFixed(2)}</td>
                <td>{e.moneda==="PEN"?"S/. "+e.monto.toFixed(2):""}</td>
                <td>{SetCapitalLetter(e.tipo_doc)}</td>
                <td>{SetCapitalLetter(e.estado_comprobante)}</td>
                <td>
                  <div className="d-flex gap-1">
                    <Link className="btn btn-primary" to={`/rf/editar-documento/${e.id}`} ><i className="bi bi-pen-fill"></i></Link>
                    <Button variant="danger" onClick={()=>delteTaxDocument(e.id)}><i className="bi bi-trash-fill"></i></Button>
                  </div>
                </td>
              </tr>
              if (filtrosDocs.tipo_doc === "todos" && filtrosDocs.estado === "todos") {
                return rowList
              }
              if (
                (filtrosDocs.tipo_doc === "todos" && e.estado_comprobante === filtrosDocs.estado) ||
                (filtrosDocs.estado === "todos" && e.tipo_doc === filtrosDocs.tipo_doc) ||
                (e.tipo_doc === filtrosDocs.tipo_doc && e.estado_comprobante === filtrosDocs.estado)
              ) {
                return rowList;
              }
              
            })
          }
        </tbody>
      </TableComponent>
    </div>
  )
}