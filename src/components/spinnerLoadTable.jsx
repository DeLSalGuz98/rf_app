import { Spinner } from "react-bootstrap";

export function SpinnerLoadTable({colSpan}) {
  return (
    <tfoot>
      <tr>
        <td colSpan={colSpan}>
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        </td>
      </tr>
    </tfoot>
  )
}