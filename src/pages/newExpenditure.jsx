import { ExpenditureForm } from "../forms/expenditureForm";
import { useNavigate } from "react-router-dom";

export function NewExpenditure() {
  const navigate = useNavigate()
  const backPage = ()=>{
    navigate(-1)
  }
  return(
    <ExpenditureForm title={"Registrar Gastos"} backPage={backPage}>
    </ExpenditureForm>
  )
}