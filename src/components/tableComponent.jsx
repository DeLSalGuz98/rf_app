import { Table } from "react-bootstrap";

export function TableComponent({ children }) {
  return(
    <div className="table-responsive">
      <Table striped bordered hover className="align-middle text-center">
        {children}
      </Table>
    </div>
  )
}