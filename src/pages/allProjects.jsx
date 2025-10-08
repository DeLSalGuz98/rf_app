import { Button, Col, Container, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { TableComponent } from "../components/tableComponent";
import { useEffect } from "react";
import { GetAllListProjects } from "../querysDB/projects/getAllProjects";
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SetCapitalLetter } from "../utils/setCapitalLetterString";
import { toast } from "react-toastify";

export function AllProjects() {
  const [headTable] = useState(["Proyecto","Tipo","Descripción","Fecha Final","Dias Restantes","Monto Ofertado","Acciones"]) 
  const [listProjects, setListProjects] =  useState([]) 
  const [loading, setLoading] = useState(true);
  const [stateProjectValue, setStateProjectValue] = useState("pendiente")
  useEffect(()=>{
    GetAllProjects()
  },[])
  const GetAllProjects = async ()=>{
    setLoading(true)
    const resOne = await GetUserNameAndNameCompany()
    const resTwo = await GetAllListProjects(stateProjectValue, resOne.idEmpresa)
    setListProjects(resTwo)
    setLoading(false);
  }
  const updateStateProject = async (e)=>{
    setLoading(true)
    const {value} = e.target
    setStateProjectValue(value)
    const resOne = await GetUserNameAndNameCompany()
    const resTwo = await GetAllListProjects(value, resOne.idEmpresa)
    if(resTwo.length === 0){
      toast.warning("La lista esta vacia no existen elementos para mostrar")
    }
    setListProjects(resTwo)
    setLoading(false);

  }
  const deleteProject = (e)=>{
    alert("Se eliminara el projecto: "+e)
  }
  return <Container>
    <Row className="mb-2">
      <Col md="3">
        <InputGroup className="mb-3">
          <InputGroup.Text>Estado</InputGroup.Text>
          <Form.Select onChange={updateStateProject} defaultValue={stateProjectValue}>
            <option value="pendiente">Pendiente</option>
            <option value="paralizado">Paralizado</option>
            <option value="finalizado">Finalizado</option>
          </Form.Select>
        </InputGroup>
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
              <td colSpan={7}>
                <div className="d-flex justify-content-center align-items-center">
                  <Spinner animation="border" variant="primary" />
                </div>
              </td>
            </tr>
          ) : 
          listProjects.map(e=>{
            function diasRestantes(fechaFin) {
              const hoy = new Date();
              const fin = new Date(fechaFin);

              // Diferencia en milisegundos
              const diferencia = fin - hoy;

              // Convertir a días
              const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

              return dias > 0 ? dias : 0; // Si ya venció, devuelve 0
            }            
            return<tr key={e.id}>
              <td>{e.nombre_proyecto}</td>
              <td>{SetCapitalLetter(e.tipo)}</td>
              <td className="text-start">{SetCapitalLetter(e.descripcion_proyecto)}</td>
              <td className="text-nowrap">{e.fecha_fin}</td>
              <td className={diasRestantes(e.fecha_fin)<=3&&e.estado==="pendiente"?"bg-danger text-white":""}>{diasRestantes(e.fecha_fin)}</td>
              <td> S/. {e.monto_ofertado.toFixed(2)}</td>
              <td>
                <div className="d-flex gap-1">
                  <Link className="btn btn-primary" to={`/rf/proyecto/${e.id}`} ><i className="bi bi-eye-fill"></i></Link>
                  <Button variant="danger" onClick={()=>deleteProject(e.id)}><i className="bi bi-trash-fill"></i></Button>
                </div>
              </td>
            </tr>
          })
        }
      </tbody>
    </TableComponent>
  </Container>
}