import { Button, Col, Container, Form, InputGroup, Row, Spinner, Accordion } from "react-bootstrap";
import { TableComponent } from "../components/tableComponent";
import { useEffect } from "react";
import { getListTaxDocumentsByDateDB, getListTaxDocumentsDB } from "../querysDB/taxDocument/getListTaxDoc";
import { useState } from "react";
import { SetCapitalLetter } from "../utils/setCapitalLetterString";
import { Link } from "react-router-dom";
import { frmtFecha } from "../utils/formatDate";
import { deleteTaxDocumentDB } from "../querysDB/taxDocument/deleteTaxDocument";
import { exportToExcel } from "../utils/exportToExcel";

export function ListTaxDocumetPage() {
  const headTable = ["fecha emision", "fecha vencimiento", "serie", "numero", "ruc", "razon social", "tipo cambio", "monto dolares", "montol soles", "tipo documento", "estado", "accion"]
  const [listTaxDocument, setListTaxDocument] =  useState([]) 
  const [loading, setLoading] = useState(true);
  const [filtrosDocs, setFiltrosDocs] = useState(filtrosIniciales)
  const [dateFilter, setDateFilter] = useState(false)
  //const [dataToExport, setDataToExport] = useState([])
  const dataToExport = []
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

    //const primerDia = `${year}-${month}-01`;

    //const dia = String(hoy.getDate()).padStart(2, "0");
    //const fechaActual = `${year}-${month}-${dia}`;

    return {
      desde: "",
      hasta: "",
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
  const delteTaxDocument = async(e)=>{
    const deleteDoc = confirm("Esta a punto de eliminar un documento, esta seguro de continuar")
    if(deleteDoc){
      await deleteTaxDocumentDB(e)
    }
    getListTaxDocuments()
  }
  const getTotalFacturas = ()=>{
    let total = 0
    listTaxDocument.map((e)=>{
      if(e.tipo_doc === filtrosDocs.tipo_doc){
        if(e.moneda==="USD"){
          total = total + (e.monto*e.tipo_cambio)
        }else{
          total = total + e.monto
        }
      }
    })
    return total
  }
  const handleExport = ()=>{
    //console.log(dataToExport)
    const fileName = filtrosDocs.tipo_doc+"-"+filtrosDocs.mes_declarado
    exportToExcel(dataToExport, fileName)
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
                  <i className="bi bi-calendar-check-fill"></i> Aplicar rango de fechas
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
      <div className="d-flex p-2 justify-content-between">
        <div className="h4 m0"><span className="">Total:</span> {getTotalFacturas().toFixed(2)}</div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleExport}>
            <i className="bi bi-file-earmark-excel-fill"></i> Exportar a Excel
          </Button>
          <Link className="btn btn-secondary" to={`/rf/reporte-mensual`}>
            <i className="bi bi-file-earmark-spreadsheet"></i> Generar Reporte
          </Link>
          <Link className="btn btn-primary" to={`/rf/registrar-documentos-tributarios`}>
            <i className="bi bi-plus-circle"></i> Agregar Nuevo Documento
          </Link>
        </div>
      </div>
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
              let objFactura = {
                  fecha_emision:e.fecha_emision,
                  fecha_vencimiento:e.fecha_vencimiento,
                  serie_comprobante:e.serie_comprobante,
                  nro_comprobante:e.nro_comprobante,
                  ruc:e.ruc,
                  razon_social:e.razon_social,
                  tipo_cambio:e.tipo_cambio,
                  monto:e.monto,
                  tipo_doc:e.tipo_doc
                }
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
                dataToExport.push(objFactura)
                return rowList
              }
              if (
                (filtrosDocs.tipo_doc === "todos" && e.estado_comprobante === filtrosDocs.estado) ||
                (filtrosDocs.estado === "todos" && e.tipo_doc === filtrosDocs.tipo_doc) ||
                (e.tipo_doc === filtrosDocs.tipo_doc && e.estado_comprobante === filtrosDocs.estado)
              ) {
                dataToExport.push(objFactura)
                return rowList;
              }
              
            })
          }
        </tbody>
      </TableComponent>
    </div>
  )
}