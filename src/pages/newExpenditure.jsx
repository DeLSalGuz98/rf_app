import { Col } from "react-bootstrap";
import { SelectField } from "../components/inputComponent";
import { ExpenditureForm } from "../forms/expenditureForm";
import { useEffect } from "react";
import { GetAllListProjects } from "../querysDB/projects/getAllProjects";
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function NewExpenditure() {
  const [listProjects, setListProjects] = useState([])
  const navigate = useNavigate()
  useEffect(()=>{
    GetListProjects()
  },[])
  const GetListProjects = async ()=>{
    const resOne = await GetUserNameAndNameCompany()
    const list = [{value:"",label:"Sin proyecto"}]
    const resTwo = await GetAllListProjects("pendiente", resOne.idEmpresa)
    resTwo.map((p)=>{
      let newItem = {
        value:p.id,
        label:p.nombre_proyecto
      }
      list.push(newItem)
    })
    setListProjects(list)
  }
  const backPage = ()=>{
    navigate(-1)
  }
  return(
    <ExpenditureForm title={"Registrar Gastos"} backPage={backPage}>
      <Col md={3}>
        <SelectField
          name="id_proyecto"
          label="Enlazar a un Proyecto"
          options={listProjects}
        />
      </Col>
    </ExpenditureForm>
  )
}