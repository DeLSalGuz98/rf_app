import { Button, Table } from "react-bootstrap"
import { Link } from "react-router-dom"

// Funciones
import { SetCapitalLetter } from "../../utils/setCapitalLetterString"

export function PersonalActivo() {
  return<>
    <p className="fs-5 fw-bold">Personal Activo</p>
    <div className="border p-2">
      <Table  hover className="align-middle text-center ">
        <thead>
          <tr>
            <th>Activo</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-nowrap fs-4 text-success fw-bold"><i className="bi bi-person-check"></i></td>
            <td>{SetCapitalLetter("Daniel Chipa")}</td>
            <td>
              <div className="d-flex justify-content-center">
                <Link className="btn btn-primary fs-6" to={`/rf/proyecto/${123}`} ><i className="bi bi-box-arrow-in-up-right"></i></Link>
              </div>
            </td>
          </tr>
          <tr>
            <td className="text-nowrap fs-4 text-success fw-bold"><i className="bi bi-person-check"></i></td>
            <td>{SetCapitalLetter("Cesar Cahuascancco")}</td>
            <td>
              <div className="d-flex justify-content-center">
                <Link className="btn btn-primary fs-6" to={`/rf/proyecto/${123}`} ><i className="bi bi-box-arrow-in-up-right"></i></Link>
              </div>
            </td>
          </tr>
          <tr>
            <td className="text-nowrap fs-4 text-danger fw-bold"><i className="bi bi-person-fill-x"></i></td>
            <td>{SetCapitalLetter("Alan Wilson")}</td>
            <td>
              <div className="d-flex justify-content-center">
                <Link className="btn btn-primary fs-6" to={`/rf/proyecto/${123}`} ><i className="bi bi-box-arrow-in-up-right"></i></Link>
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
      <Button className="w-100" variant="secondary" onClick={()=>{alert("Esta opcion aun no esta disponible")}}><i className="bi bi-download"></i> Descargar lista (SCTR)</Button>
    </div>
  </>
}