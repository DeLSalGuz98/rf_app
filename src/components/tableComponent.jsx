import { Table } from "react-bootstrap";

export function TableComponent({ children }) {
  return(
    <Table striped bordered hover className="align-middle text-center">
      {children}
    </Table>
  )
}