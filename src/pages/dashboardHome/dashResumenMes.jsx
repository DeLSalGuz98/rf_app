import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

export const MonthlySummary = () => {
  return (
    <div className="mb-4">
      <h4 className="mb-3">Resumen del Mes</h4>

      <Row className="g-3">
        {/* Facturas Emitidas */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Facturas Emitidas</p>
                  <h5 className="fw-bold mb-0">S/ 0.00</h5>
                </div>
                <i className="bi bi-receipt fs-3 text-primary"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Facturas Recibidas */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Facturas Recibidas</p>
                  <h5 className="fw-bold mb-0">S/ 0.00</h5>
                </div>
                <i className="bi bi-box-seam fs-3 text-warning"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* NC Emitidas */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">NC Emitidas</p>
                  <h5 className="fw-bold mb-0">S/ 0.00</h5>
                </div>
                <i className="bi bi-arrow-return-left fs-3 text-danger"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* NC Recibidas */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">NC Recibidas</p>
                  <h5 className="fw-bold mb-0">S/ 0.00</h5>
                </div>
                <i className="bi bi-arrow-return-right fs-3 text-info"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Segunda fila */}
      <Row className="g-3 mt-1">
        {/* Retenciones */}
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <p className="text-muted mb-1">Retenciones</p>
              <h5 className="fw-bold mb-0">S/ 0.00</h5>
            </Card.Body>
          </Card>
        </Col>

        {/* Resultado */}
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <p className="text-muted mb-1">Resultado Neto</p>
              <h5 className="fw-bold mb-0 text-success">S/ 0.00</h5>
            </Card.Body>
          </Card>
        </Col>

        {/* Porcentaje */}
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <p className="text-muted mb-1">% vs Ventas</p>
              <h5 className="fw-bold mb-0 text-primary">0%</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};