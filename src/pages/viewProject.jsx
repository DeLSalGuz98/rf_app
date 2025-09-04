import { useParams } from "react-router-dom"
import ProyectoDetalle from "../components/panelInfoProject"

export function ProjectPage() {
  let {idProyecto}= useParams()
  return <div className="container">
    <ProyectoDetalle idProyecto={idProyecto}></ProyectoDetalle>
  </div>
}




