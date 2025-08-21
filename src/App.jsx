import './App.css'
import { Container, Row, Col, Button } from "react-bootstrap"

function App() {
  return (
    <Container className="mt-5">
      <Row>
        <Col className="text-center">
          <h1>🚀 Bootstrap funcionando</h1>
          <p>Si ves el estilo bonito, ¡todo está ok!</p>
          <Button variant="primary" onClick={()=>alert("hola mundo")}>Probar Botón</Button>
        </Col>
      </Row>
    </Container>
  )
}

export default App
