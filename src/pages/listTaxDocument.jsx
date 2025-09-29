import { Button, Col, Container, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { TableComponent } from "../components/tableComponent";
import { useEffect } from "react";
import { getListTaxDocumentsDB } from "../querysDB/taxDocument/getListTaxDoc";
import { useState } from "react";

export function ListTaxDocumetPage() {
  const headTable = ["fecha emision", "fecha vencimiento", "serie", "numero", "ruc", "razon social", "tipo cambio", "monto dolares", "montol soles"]
  const [listTaxDocument, setListTaxDocument] =  useState([]) 
  const [loading, setLoading] = useState(true);
  const [filtrosDocs, setFiltrosDocs] = useState(filtrosIniciales)
  useEffect(()=>{
    getListTaxDocuments()
  },[])

  const getListTaxDocuments = async ()=>{
    const res = await getListTaxDocumentsDB(filtrosDocs.desde, filtrosDocs.hasta, filtrosDocs.tipo_doc, filtrosDocs.mes_declarado, filtrosDocs.estado)
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
      tipo_doc: "factura recibida",
      mes_declarado: `${year}-${month}`,
      estado: "pendiente"
    }
  }

  const addFilterDocs = async (e)=>{
    const {name, value} = e.target
    setFiltrosDocs({...filtrosDocs, [name]: value})  
  }
  const sendFilters = ()=>{
    getListTaxDocuments()
  }
  
  return(
    <Container>
      <Row className="mb-2">
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
        <Col md="4">
          <InputGroup className="mb-3">
            <InputGroup.Text>Tipo Documento</InputGroup.Text>
            <Form.Select name="tipo_doc" onChange={addFilterDocs} defaultValue={filtrosDocs.tipo_doc}>
              <option value="factura recibida">Factura Recibida</option>
              <option value="factura emitida">Factura Emitida</option>
              <option value="nc emitido">NC Emitida</option>
              <option value="nc recibido">NC Recibida</option>
              <option value="retencion recibido">Retencion Recibida</option>
              <option value="r.h. recibido">Recibo por Honorario recibido</option>
            </Form.Select>
          </InputGroup>
        </Col>
        <Col md="4">
          <InputGroup className="mb-3">
            <InputGroup.Text>Mes declarado</InputGroup.Text>
            <Form.Control
              name="year" 
              type="month"
              onChange={addFilterDocs}
              defaultValue={filtrosDocs.mes_declarado} 
            />
          </InputGroup>
        </Col>
        <Col md="4">
          <InputGroup className="mb-3">
            <InputGroup.Text>Estado de la Factura</InputGroup.Text>
            <Form.Select name="estado" onChange={addFilterDocs} defaultValue={filtrosDocs.estado}>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="atrasado">Atrasado</option>
              <option value="anulado">Anulado</option>
              <option value="archivado">Archivado</option>
            </Form.Select>
          </InputGroup>
        </Col>
        <Col md="4">
          <Button className="w-100" variant="primary" onClick={sendFilters}>Aplicar Filtros</Button>
        </Col>
      </Row>
      <TableComponent>
        <thead>
          <tr>
            {
              headTable.map((e)=>{
                return<th key={e}>{e}</th>
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
              return<tr key={e.id}>
                <td>{e.fecha_emision}</td>
                <td>{e.fecha_vencimiento}</td>
                <td className="text-uppercase" >{e.serie_comprobante}</td>
                <td>{e.nro_comprobante}</td>
                <td>{e.ruc}</td>
                <td className="text-uppercase">{e.razon_social}</td>
                <td>{e.moneda==="PEN"?"":e.tipo_cambio}</td>
                <td>{e.moneda==="PEN"?"":"$ "+e.monto.toFixed(2)}</td>
                <td>{e.moneda==="PEN"?"S/. "+e.monto.toFixed(2):""}</td>
              </tr>
            })
          }
        </tbody>
      </TableComponent>
    </Container>
  )
}