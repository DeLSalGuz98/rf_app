import { useEffect } from "react";
import { Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import { getListTaxDocumentsDB } from "../querysDB/taxDocument/getListTaxDoc";
import { useState } from "react";
export function ReportTaxDocument() {
  const [periodo, setPeriodo] = useState("")
  const [listFacturasRecibidas, setListFacturasRecibidas] = useState([])
  const [listFacturasEmitidas, setListFacturasEmitidas] = useState([])
  const [listRetencionRecibida, setListRetencionRecibida] = useState([])
  const [listNcEmitido, setListNcEmitido] = useState([])
  const [listNcRecibido, setListNcRecibido] = useState([])
  const [listRhRecibido, setListRhRecibido] = useState([])

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
      <h4>1. Facturas recibidas - Periodo {periodo}</h4>
      {
        listFacturasRecibidas.length!==0?<div className="p-3">
          <p><strong> Total Monto Base:</strong> {listFacturasRecibidas[0].montoBase.toFixed(2)}</p>
          <p><strong> Total monto I.G.V.:</strong> {listFacturasRecibidas[0].montoIgv.toFixed(2)}</p>
          <p><strong> Total Monto:</strong> {listFacturasRecibidas[0].montoTotal.toFixed(2)}</p>
        </div>:<></>
      }
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
            listFacturasRecibidas.length!==0?
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
      <h4>2. Facturas emitidas - Periodo {periodo}</h4>
      {
        listFacturasEmitidas.length!==0?<div className="p-3">
          <p><strong> Total Monto Base:</strong> {listFacturasEmitidas[0].montoBase.toFixed(2)}</p>
          <p><strong> Total monto I.G.V.:</strong> {listFacturasEmitidas[0].montoIgv.toFixed(2)}</p>
          <p><strong> Total Monto:</strong> {listFacturasEmitidas[0].montoTotal.toFixed(2)}</p>
        </div>:<></>
      }
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
            listFacturasEmitidas.length!==0?
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
      <h4>3. Comprobante de Retencion Recibido - Periodo {periodo}</h4>
      {
        listRetencionRecibida.length!==0?<div className="p-3">
          <p><strong> Total Monto Base:</strong> {listRetencionRecibida[0].montoBase.toFixed(2)}</p>
          <p><strong> Total monto I.G.V.:</strong> {listRetencionRecibida[0].montoIgv.toFixed(2)}</p>
          <p><strong> Total Monto:</strong> {listRetencionRecibida[0].montoTotal.toFixed(2)}</p>
        </div>:<></>
      }
      <Table bordered responsive className="text-right align-middle">
        <thead>
          <tr>
            <th>Fecha Emision</th>
            <th>Serie Factura</th>
            <th>Nro. Factura</th>
            <th>Ruc Empresa Retenedora</th>
            <th>Razon Social</th>
            <th>Tipo de Moneda</th>
            <th>Monto Base (S/.)</th>
            <th>Monto I.G.V. (S/.)</th>
            <th>Monto Total (S/.)</th>
          </tr>
        </thead>
        <tbody>
          {
            listRetencionRecibida.length!==0?
            listRetencionRecibida[1].length===0?<tr><td colSpan={9} className="text-center">No hay documenos para mostrar</td></tr>:
            listRetencionRecibida[1].map(e=>{
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
      {/* notas de credito emitidas */}
      <h4>4. Notas de Credito Emitidas - Periodo {periodo}</h4>
      {
        listNcEmitido.length!==0?<div className="p-3">
          <p><strong> Total Monto Base:</strong> {listNcEmitido[0].montoBase.toFixed(2)}</p>
          <p><strong> Total monto I.G.V.:</strong> {listNcEmitido[0].montoIgv.toFixed(2)}</p>
          <p><strong> Total Monto:</strong> {listNcEmitido[0].montoTotal.toFixed(2)}</p>
        </div>:<></>
      }
      <Table bordered responsive className="text-right align-middle">
        <thead>
          <tr>
            <th>Fecha Emision</th>
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
            listNcEmitido.length!==0?
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
      <h4>5. Notas de Credito Recibidas - Periodo {periodo}</h4>
      {
        listNcRecibido.length!==0?<div className="p-3">
          <p><strong> Total Monto Base:</strong> {listNcRecibido[0].montoBase.toFixed(2)}</p>
          <p><strong> Total monto I.G.V.:</strong> {listNcRecibido[0].montoIgv.toFixed(2)}</p>
          <p><strong> Total Monto:</strong> {listNcRecibido[0].montoTotal.toFixed(2)}</p>
        </div>:<></>
      }
      <Table bordered responsive className="text-right align-middle">
        <thead>
          <tr>
            <th>Fecha Emision</th>
            <th>Serie Factura</th>
            <th>Nro. Factura</th>
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
            listNcRecibido.length!==0?
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
    </div>
  )
}