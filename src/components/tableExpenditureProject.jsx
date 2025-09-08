import { useEffect } from "react";
import { getListExpenditureProject } from "../querysDB/gastos/listExpenditureProject";
import { TableComponent } from "./tableComponent";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { SetCapitalLetter } from "../utils/setCapitalLetterString";

export function TableExpenditure({idProject}) {
  const [list, setList] = useState([])
  useEffect(()=>{
    getListExpenditure()
  },[])
  const getListExpenditure = async ()=>{
    const res = await getListExpenditureProject(idProject)
    setList(res)
  }
  return(
    <TableComponent>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Cantidad</th>
          <th>Unidad <br/> medida</th>
          <th>Descripcion</th>
          <th>Precio unitario</th>
          <th>Monto total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {
          list.map(e=>{
            return(
              <tr key={e.id}>
                <td className="text-nowrap">{e.fecha}</td>
                <td>{e.cantidad}</td>
                <td>{e.unidad_medida}</td>
                <td className="text-nowrap text-start">{SetCapitalLetter(e.descripcion)}</td>
                <td className="text-nowrap">S/. {e.precio_unitario.toFixed(2)}</td>
                <td className="text-nowrap">S/. {e.monto_total.toFixed(2)}</td>
                <td>
                  <div className="d-flex gap-1">
                    <Link className="btn btn-primary" to={`/rf/proyecto/${e.id}`} ><i className="bi bi-eye-fill"></i></Link>
                    <Button variant="danger"><i className="bi bi-trash-fill"></i></Button>
                  </div>
                </td>
              </tr>
            )
          })
        }
      </tbody>
    </TableComponent>
  )
}