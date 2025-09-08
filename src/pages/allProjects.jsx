import { Button, Container } from "react-bootstrap";
import { TableComponent } from "../components/tableComponent";
import { useEffect } from "react";
import { GetAllListProjects } from "../querysDB/projects/getAllProjects";
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SetCapitalLetter } from "../utils/setCapitalLetterString";

export function AllProjects() {
  const [headTable] = useState(["Proyecto","Tipo","Descripción","Fecha Final","Dias Restantes","Monto Ofertado","Acciones"]) 
  const [listProjects, setListProjects] =  useState([]) 
  useEffect(()=>{
    GetAllProjects()
  },[])
  const GetAllProjects = async ()=>{
    const resOne = await GetUserNameAndNameCompany()
    const resTwo = await GetAllListProjects("pendiente", resOne.idEmpresa)
    setListProjects(resTwo)
  }
  return <Container>
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
        {
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
              <td>{diasRestantes(e.fecha_fin)}</td>
              <td> S/. {e.monto_ofertado.toFixed(2)}</td>
              <td>
                <div className="d-flex gap-1">
                  <Link className="btn btn-primary" to={`/rf/proyecto/${e.id}`} ><i className="bi bi-eye-fill"></i></Link>
                  <Button variant="danger"><i className="bi bi-trash-fill"></i></Button>
                </div>
              </td>
            </tr>
          })
        }
      </tbody>
    </TableComponent>
  </Container>
}