import { useNavigate, useParams } from "react-router-dom";
import { ExpenditureForm } from "../forms/expenditureForm";
import { useEffect } from "react";
import { getDataExpenditureProjectDB } from "../querysDB/gastos/getDataExpenditureProject";
import { useState } from "react";

export function EditExpenditureProyect() {
  const {idProyecto, idGasto} = useParams()
  const [dataExpenditure, setDataExpenditure] = useState({})
  const navigate = useNavigate()
  const backPage = ()=>{
    navigate(-1)
  }
  useEffect(()=>{
    getDataExpenditureProject()
  },[])
  const getDataExpenditureProject = async ()=>{
    const res = await getDataExpenditureProjectDB(idGasto)
    setDataExpenditure(res)
  }
  return(
    <ExpenditureForm
      idProyecto={idProyecto}
      title={"Editar informacion del gasto"}
      backPage={backPage}
      defaultData={dataExpenditure}
      editarGasto={true}
    ></ExpenditureForm>
  )
}