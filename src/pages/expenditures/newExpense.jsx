import { useState } from "react"
import { Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap"
import { NewInvoice } from "./newInvoice"
import { NewExpenditureItem } from "./newItemExpense"
import { useNavigate, useParams } from "react-router-dom"
import { saveTaxDocumentDB } from "../../querysDB/taxDocument/saveTaxDocument"
import { saveBolckExpenditureDB } from "../../querysDB/gastos/saveExpenditure"

export function NewExpensePage(){
  const {idProyecto} = useParams()
  const navigate = useNavigate()
  const [addInvoiceIsTrue, setAddInvoiceIsTrue] = useState(false)
  const [hideInvoice, setHideInvoice] = useState(false)
  const [dataInvoice, setDataInvoice] = useState({})
  const [dataItemInvoice, setDataItemInvoice] = useState([])

  const addInvoiceDoc = (e)=>{
    setAddInvoiceIsTrue(e.target.checked)
  }
  const hideInvoiceForm = (data)=>{
    setHideInvoice(true)
    setDataInvoice(data)
  }

  const addItemInvoice = (dataItem) => {
    setDataItemInvoice(prevItems => {
      const newItems = [...prevItems, dataItem];
      return newItems;
    })
  }
  const deleteItemInvoice = (index) => {
      setDataItemInvoice(prevItems => {
        const newItems = [...prevItems];
        newItems.splice(index, 1);
        return newItems;
      });
  };
  const backPage = ()=>{
      navigate(-1)
    }

  const saveAllItems = async ()=>{
    try{
      if(addInvoiceIsTrue){
        await saveTaxDocumentDB(dataInvoice,idProyecto)
      }
      await saveBolckExpenditureDB(dataItemInvoice)
      navigate(-1)
    }catch (error){
      console.log("Se capturó el error lanzado. Mensaje:", error.message);
    }
  }
  return(
    <Container fluid className="px-5">
      <Form className="fs-5 mb-3 d-flex mb-2 gap-3 align-items-center">
        <Button variant="secondary" onClick={backPage}><i class="bi bi-arrow-left"></i> Regresar</Button>
        <Form.Check
          type="switch"
          label="Añadir Comprobante de Pago"
          onChange={addInvoiceDoc}
        />
      </Form>
      <Row>
        <Col md={6}>
          {
            addInvoiceIsTrue?hideInvoice?
            <NewExpenditureItem 
              title={"Registrar Gastos"} 
              idProyecto={idProyecto} 
              defaultData={{serie:dataInvoice.serie_comprobante, nro:dataInvoice.nro_comprobante, fecha:dataInvoice.fecha_emision}} 
              addItemInvoice={addItemInvoice}
            />:
            <NewInvoice hideInvoiceForm={hideInvoiceForm}/>:
            <NewExpenditureItem title={"Registrar Gastos"} idProyecto={idProyecto}
              addItemInvoice={addItemInvoice}
            />
          }
        </Col>
        <Col md={6}>
          <Card className="rounded-4 shadow-sm">
            <Card.Body>
              {/* DATOS GENERALES */}
              {addInvoiceIsTrue&&Object.keys(dataInvoice).length!==0?<>
                <h6 className="text-secondary">Datos del Comprobante</h6>
                <Row className="mb-3">
                  <Col md={3}>
                    <strong>Ruc:</strong> {dataInvoice.ruc || "-"}
                  </Col>
                  <Col md={9}>
                    <strong>Proveedor:</strong> {dataInvoice.razon_social || "-"}
                  </Col>
                  <Col md={3}>
                    <strong>Serie:</strong> {(dataInvoice.serie_comprobante).toUpperCase() || "-"}
                  </Col>
                  <Col md={3}>
                    <strong>Número:</strong> {dataInvoice.nro_comprobante || "-"}
                  </Col>                  
                  <Col md={3}>
                    <strong>Fecha:</strong> {dataInvoice.fecha_emision || "-"}
                  </Col>
                  <Col md={3}>
                    <strong>Monto:</strong> {dataInvoice.monto || "-"}
                  </Col>
                </Row>

                <hr />
              </>:<></>
              }

              {/* TABLA DE ITEMS */}
              <h6 className="text-secondary mb-3">Ítems registrados</h6>
              <Table hover responsive>
                <thead className="table-light">
                  <tr>
                    <th className="text-center">Cantidad</th>
                    <th className="text-center text-nowrap">U. Med.</th>
                    <th className="text-center">Descripción</th>
                    <th className="text-center">Moneda</th>
                    <th className="text-center">Total</th>
                    <th className="text-center"></th>
                  </tr>
                </thead>

                <tbody>
                  {dataItemInvoice.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        No hay ítems agregados
                      </td>
                    </tr>
                  ) : (
                    dataItemInvoice.map((item, index) => {
                      return (
                      <tr key={index}>
                        <td className="text-center" style={{width:"10%"}}>{item.cantidad}</td>
                        <td className="text-center" style={{width:"10%"}}>{item.unidad_medida}</td>
                        <td style={{width:"50%"}}>{item.descripcion}</td>
                        <td className="text-center" style={{width:"10%"}}>{item.moneda}</td>
                        <td className="text-center" style={{width:"20%"}}>
                          {(item.monto_total).toFixed(2)}
                        </td>
                        <td><Button variant="danger" onClick={()=>deleteItemInvoice(index)}><i class="bi bi-trash3-fill"></i></Button></td>
                      </tr>
                      )
                    })
                  )}
                </tbody>
              </Table>

              {/* TOTAL */}
              <div className="text-end">
                <h5>
                  Total:{" "}
                  <strong className="text-success">
                    {" "}
                    {dataItemInvoice.length!==0?dataItemInvoice
                      .reduce((sum, it) => sum + parseFloat(it.monto_total), 0)
                      .toFixed(2):"0.00"
                    }
                  </strong>
                </h5>
              </div>
              <Button onClick={saveAllItems} variant="primary" className="w-100 mt-3"><i className="bi bi-floppy2-fill"></i> Guardar Items</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  )
}