import { useNavigate, useParams } from "react-router-dom";
import { ExpenditureForm } from "../forms/expenditureForm";


export function NewExpenditureProject() {
  let {idProyecto} = useParams()
  const navigate = useNavigate()
  const backPage = ()=>{
    navigate(-1)
  }
  return (
    <ExpenditureForm idProyecto={idProyecto} title={"Registrar Gasto del Proyecto"} backPage={backPage}></ExpenditureForm>
  )
}