import { useEffect } from "react"
import { useState } from "react"
import { Table } from "react-bootstrap"
import { Link } from "react-router-dom"

//funciones
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany"
import { GetAllListProjects } from "../../querysDB/projects/getAllProjects"
import { SetCapitalLetter } from "../../utils/setCapitalLetterString"

export function ProyectosPendientes() {
  const [listProjects, setListProjects] = useState([])
    useEffect(()=>{
      getAllProjects()
    },[])
    const getAllProjects = async ()=>{
        const resOne = await GetUserNameAndNameCompany()
        const resTwo = await GetAllListProjects("pendiente", resOne.idEmpresa)
        setListProjects(resTwo)
      }
  return<>
    <p className="fs-5 fw-bold">Proyectos Pendientes</p>
    <Table hover className="align-middle text-center border ">
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
  </>
}