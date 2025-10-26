import { useEffect } from "react";
import { Button, Card, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import { getListTaxDocumentsDB } from "../querysDB/taxDocument/getListTaxDoc";
import { useState } from "react";
import { SpinnerLoadTable } from "../components/spinnerLoadTable";
import { usePrintReport } from "../hooks/printReportHook";
import { useNavigate } from "react-router-dom";

export function ReportTaxDocument() {
  const [periodo, setPeriodo] = useState("")
  const [listFacturasRecibidas, setListFacturasRecibidas] = useState([])
  const [listFacturasEmitidas, setListFacturasEmitidas] = useState([])
  const [listRetencionRecibida, setListRetencionRecibida] = useState([])
  const [listNcEmitido, setListNcEmitido] = useState([])
  const [listNcRecibido, setListNcRecibido] = useState([])
  const [listRhRecibido, setListRhRecibido] = useState([])
  const [dataListReady, setDataListReady] = useState(false)
  const navigation = useNavigate()

  const [printRef, handlePrint] = usePrintReport();

  useEffect(()=>{
    setPeriodo(returnPeriodoActual())
    getTaxtDocs(returnPeriodoActual())
  },[])
  const getTaxtDocs = async (per)=>{
    const res = await getListTaxDocumentsDB(per)
    setListFacturasRecibidas(ResumenDocs(res, "factura recibida"))
    setListFacturasEmitidas(ResumenDocs(res, "factura emitida"))
    setListRetencionRecibida(ResumenDocs(res, "retencion recibido"))
    setListNcEmitido(ResumenDocs(res, "nc emitido"))
    setListNcRecibido(ResumenDocs(res, "nc recibido"))
    setListRhRecibido(ResumenDocs(res, "r.h. recibido"))    
    setDataListReady(true)    
  }
  const ResumenDocs = (res=[], tipoDoc = "")=>{
    const documentos = []
    let sumTotal = 0
    res.map(e=>{
      if(e.tipo_doc === tipoDoc){
        const montoSoles = e.moneda==="PEN"?e.monto:e.monto*e.tipo_cambio
        sumTotal = sumTotal + montoSoles
        documentos.push(e)
      }
    })
    let list = documentos
    let resumen = {
      montoBase: sumTotal - (sumTotal * 0.18),
      montoIgv: sumTotal * 0.18,
      montoTotal: sumTotal
    }
    return [resumen, list]
  }
  const getPeriodo = (e)=>{
    const {value} = e.target
    setPeriodo(value)
    getTaxtDocs(value)
  }
  const returnPeriodoActual = ()=>{
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}` 
  }

  const backPage=()=>{
    navigation(-1)
  }
  return(    
    <div className="mx-auto" style={{width:"85%"}}>
      <Row>
        <Col md="4">
          <InputGroup className="mb-3">
            <InputGroup.Text>Seleccionar Periodo</InputGroup.Text>
            <Form.Control
              name="mes_declarado"
              type="month"
              onChange={getPeriodo}
              defaultValue={periodo}
            />
          </InputGroup>
        </Col>
      </Row>
      <div className="border p-4" ref={printRef}>
        <h4>1. Resumen - Periodo {periodo}</h4>
        <Table bordered responsive className="text-right align-middle">
          <thead>
            <tr>
              <th className="text-center">Descripcion </th>
              <th className="text-center">Monto Base (S/.)</th>
              <th className="text-center">Monto I.G.V. (S/.)</th>
              <th className="text-center">Monto Total (S/.)</th>
            </tr>
          </thead>
          {
            dataListReady?
            <tbody>
              <tr>
                <th className="w-50">Facturas Emitidas</th>
                <td className="text-center">{listFacturasEmitidas[0].montoBase.toFixed(2)}</td>
                <td className="text-center">{listFacturasEmitidas[0].montoIgv.toFixed(2)}</td>
                <td className="text-center">{listFacturasEmitidas[0].montoTotal.toFixed(2)}</td>
                
              </tr>
              <tr>
                <th className="w-50">Facturas Recibidas</th>
                <td className="text-center">{listFacturasRecibidas[0].montoBase.toFixed(2)}</td>
                <td className="text-center">{listFacturasRecibidas[0].montoIgv.toFixed(2)}</td>
                <td className="text-center">{listFacturasRecibidas[0].montoTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <th className="w-50">Notas de Credito Emitidas</th>
                <td className="text-center">{listNcEmitido[0].montoBase.toFixed(2)}</td>
                <td className="text-center">{listNcEmitido[0].montoIgv.toFixed(2)}</td>
                <td className="text-center">{listNcEmitido[0].montoTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <th className="w-50">Notas de Credito Recibidas</th>
                <td className="text-center">{listNcRecibido[0].montoBase.toFixed(2)}</td>
                <td className="text-center">{listNcRecibido[0].montoIgv.toFixed(2)}</td>
                <td className="text-center">{listNcRecibido[0].montoTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <th className="w-50">Comprobantes de Retencion</th>
                <td className="text-center"> - </td>
                <td className="text-center"> - </td>
                <td className="text-center">{listRetencionRecibida[0].montoTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <th className="w-50">Recibos por Honorarios Recibidos</th>
                <td className="text-center"> - </td>
                <td className="text-center"> - </td>
                <td className="text-center">{listRhRecibido[0].montoTotal.toFixed(2)}</td>
              </tr>
            </tbody>:
            <SpinnerLoadTable colSpan={4}/>
          }
        </Table>
        <h4>2. Facturas recibidas - Periodo {periodo}</h4>
        <Table bordered responsive className="text-right align-middle">
          <thead>
            <tr>
              <th>Fecha Emision</th>
              <th>Fecha Vencimiento</th>
              <th>Serie Factura</th>
              <th>Nro. Factura</th>
              <th>Ruc Proveedor</th>
              <th>Razon Social</th>
              <th>Tipo de Moneda</th>
              <th>Tipo de Cambio</th>
              <th>Monto Factura</th>
              <th>Monto Base (S/.)</th>
              <th>Monto I.G.V. (S/.)</th>
              <th>Monto Total (S/.)</th>
            </tr>
          </thead>
          <tbody>
            {
              dataListReady?
              listFacturasRecibidas[1].length===0?<tr><td colSpan={12} className="text-center">No hay documenos para mostrar</td></tr>:
              listFacturasRecibidas[1].map(e=>{
                const igv = 0.18
                const montoSoles = e.moneda==="PEN"?e.monto:e.monto*e.tipo_cambio
                return(
                  <tr key={e.id}>
                    <td>{e.fecha_emision}</td>
                    <td>{e.fecha_vencimiento}</td>
                    <td className="text-uppercase">{e.serie_comprobante}</td>
                    <td>{e.nro_comprobante}</td>
                    <td>{e.ruc}</td>
                    <td>{e.razon_social}</td>
                    <td className="text-center">{e.moneda}</td>
                    <td className="text-center">{e.tipo_cambio===null?"0.000":Number(e.tipo_cambio).toFixed(3)}</td>
                    <td className="text-center">{e.monto.toFixed(2)}</td>
                    <td className="text-center">{Number(montoSoles-(montoSoles*igv)).toFixed(2)}</td>
                    <td className="text-center">{Number(montoSoles*igv).toFixed(2)}</td>
                    <td className="text-center">{Number(montoSoles).toFixed(2)}</td>
                  </tr>

                )
              }):null
            }
          </tbody>
        </Table>
        <h4>3. Facturas emitidas - Periodo {periodo}</h4>
        <Table bordered responsive className="text-right align-middle">
          <thead>
            <tr>
              <th>Fecha Emision</th>
              <th>Fecha Vencimiento</th>
              <th>Serie Factura</th>
              <th>Nro. Factura</th>
              <th>Ruc Cliente</th>
              <th>Razon Social</th>
              <th>Tipo de Moneda</th>
              <th>Monto Base (S/.)</th>
              <th>Monto I.G.V. (S/.)</th>
              <th>Monto Total (S/.)</th>
            </tr>
          </thead>
          <tbody>
            {
              dataListReady?
              listFacturasEmitidas[1].length===0?<tr><td colSpan={10} className="text-center">No hay documenos para mostrar</td></tr>:
              listFacturasEmitidas[1].map(e=>{
                const igv = 0.18
                const montoSoles = e.moneda==="PEN"?e.monto:e.monto*e.tipo_cambio
                return(
                  <tr key={e.id}>
                    <td>{e.fecha_emision}</td>
                    <td>{e.fecha_vencimiento}</td>
                    <td className="text-uppercase">{e.serie_comprobante}</td>
                    <td>{e.nro_comprobante}</td>
                    <td>{e.ruc}</td>
                    <td>{e.razon_social}</td>
                    <td className="text-center">{e.moneda}</td>
                    <td className="text-center">{Number(montoSoles-(montoSoles*igv)).toFixed(2)}</td>
                    <td className="text-center">{Number(montoSoles*igv).toFixed(2)}</td>
                    <td className="text-center">{e.monto.toFixed(2)}</td>
                  </tr>

                )
              }):<></>
            }
          </tbody>
        </Table>
        {/* retenciones recibidas */}
        <h4>4. Comprobante de Retencion Recibido - Periodo {periodo}</h4>
        <Table bordered responsive className="text-right align-middle">
          <thead>
            <tr>
              <th>Fecha Emision</th>
              <th>Serie</th>
              <th>Numero</th>
              <th>Ruc Agente Retenedor</th>
              <th>Razon Social</th>
              <th>Tipo de Moneda</th>
              <th>Monto Total (S/.)</th>
            </tr>
          </thead>
          <tbody>
            {
              dataListReady?
              listRetencionRecibida[1].length===0?<tr><td colSpan={9} className="text-center">No hay documenos para mostrar</td></tr>:
              listRetencionRecibida[1].map(e=>{
                return(
                  <tr key={e.id}>
                    <td>{e.fecha_emision}</td>
                    <td className="text-uppercase">{e.serie_comprobante}</td>
                    <td>{e.nro_comprobante}</td>
                    <td>{e.ruc}</td>
                    <td className="text-uppercase">{e.razon_social}</td>
                    <td className="text-center">{e.moneda}</td>
                    <td className="text-center">{e.monto.toFixed(2)}</td>
                  </tr>

                )
              }):<></>
            }
          </tbody>
        </Table>
        {/* notas de credito emitidas */}
        <h4>5. Notas de Credito Emitidas - Periodo {periodo}</h4>
        <Table bordered responsive className="text-right align-middle">
          <thead>
            <tr>
              <th>Fecha Emision</th>
              <th>Serie</th>
              <th>Numero</th>
              <th>Ruc Cliente</th>
              <th>Razon Social</th>
              <th>Tipo de Moneda</th>
              <th>Monto Base (S/.)</th>
              <th>Monto I.G.V. (S/.)</th>
              <th>Monto Total (S/.)</th>
            </tr>
          </thead>
          <tbody>
            {
              dataListReady?
              listNcEmitido[1].length===0?<tr><td colSpan={9} className="text-center">No hay documenos para mostrar</td></tr>:
              listNcEmitido[1].map(e=>{
                const igv = 0.18
                const montoSoles = e.moneda==="PEN"?e.monto:e.monto*e.tipo_cambio
                return(
                  <tr key={e.id}>
                    <td>{e.fecha_emision}</td>
                    <td className="text-uppercase">{e.serie_comprobante}</td>
                    <td>{e.nro_comprobante}</td>
                    <td>{e.ruc}</td>
                    <td className="text-uppercase">{e.razon_social}</td>
                    <td className="text-center">{e.moneda}</td>
                    <td className="text-center">{Number(montoSoles-(montoSoles*igv)).toFixed(2)}</td>
                    <td className="text-center">{Number(montoSoles*igv).toFixed(2)}</td>
                    <td className="text-center">{e.monto.toFixed(2)}</td>
                  </tr>

                )
              }):<></>
            }
          </tbody>
        </Table>
        {/* notas de credito recibidas */}
        <h4>6. Notas de Credito Recibidas - Periodo {periodo}</h4>
        <Table bordered responsive className="text-right align-middle">
          <thead>
            <tr>
              <th>Fecha Emision</th>
              <th>Serie</th>
              <th>Numero</th>
              <th>Ruc Proveedor</th>
              <th>Razon Social</th>
              <th>Tipo de Moneda</th>
              <th>Monto Base (S/.)</th>
              <th>Monto I.G.V. (S/.)</th>
              <th>Monto Total (S/.)</th>
            </tr>
          </thead>
          <tbody>
            {
              dataListReady?
              listNcRecibido[1].length===0?<tr><td colSpan={9} className="text-center">No hay documenos para mostrar</td></tr>:
              listNcRecibido[1].map(e=>{
                const igv = 0.18
                const montoSoles = e.moneda==="PEN"?e.monto:e.monto*e.tipo_cambio
                return(
                  <tr key={e.id}>
                    <td>{e.fecha_emision}</td>
                    <td className="text-uppercase">{e.serie_comprobante}</td>
                    <td>{e.nro_comprobante}</td>
                    <td>{e.ruc}</td>
                    <td className="text-uppercase">{e.razon_social}</td>
                    <td className="text-center">{e.moneda}</td>
                    <td className="text-center">{Number(montoSoles-(montoSoles*igv)).toFixed(2)}</td>
                    <td className="text-center">{Number(montoSoles*igv).toFixed(2)}</td>
                    <td className="text-center">{e.monto.toFixed(2)}</td>
                  </tr>

                )
              }):<></>
            }
          </tbody>
        </Table>
        {/* rh recibidos */}
        <h4>7. Recibos por Honorarios Recibidos - Periodo {periodo}</h4>
        <Table bordered responsive className="text-right align-middle">
          <thead>
            <tr>
              <th>Fecha Emision</th>
              <th>Serie</th>
              <th>Numero</th>
              <th>Ruc</th>
              <th>Nombre</th>
              <th>Tipo de Moneda</th>
              <th>Monto Total (S/.)</th>
            </tr>
          </thead>
          <tbody>
            {
              dataListReady?
              listRhRecibido[1].length===0?<tr><td colSpan={9} className="text-center">No hay documenos para mostrar</td></tr>:
              listRhRecibido[1].map(e=>{
                return(
                  <tr key={e.id}>
                    <td>{e.fecha_emision}</td>
                    <td className="text-uppercase">{e.serie_comprobante}</td>
                    <td>{e.nro_comprobante}</td>
                    <td>{e.ruc}</td>
                    <td className="text-uppercase">{e.razon_social}</td>
                    <td className="text-center">{e.moneda}</td>
                    <td className="text-center">{e.monto.toFixed(2)}</td>
                  </tr>

                )
              }):<></>
            }
          </tbody>
        </Table>
      </div>
      {/* Botón de impresión */}
      <Card.Footer className="d-flex gap-2 justify-content-center m-2">
        <Button className="" variant="primary" onClick={handlePrint}>
          Imprimir 
        </Button>
        <Button className="" variant="outline-secondary" onClick={backPage}>
          Regresar
        </Button>
      </Card.Footer>
    </div>
  )
}