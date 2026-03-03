import {Col, Container, Form, InputGroup, ListGroup, Row, Spinner, Table } from "react-bootstrap";

import { z } from 'zod';
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { getItemAndPriceDB } from "../../querysDB/prices/getPrices";

// Expresión regular que permite: Letras (incluyendo tildes/ñ), números y espacios.
const safeCharsRegex = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s%]+$/;

// Lista de palabras "negras" que suelen usarse en ataques (opcional pero recomendado)
const forbiddenPatterns = [
  "DROP ", "SELECT ", "DELETE ", "UPDATE ", "INSERT ", "--", "OR 1=1", "CAST(", "EXEC("
];

const searchSchema = z.object({
  itemName: z.string()
    .min(2, { message: "Mínimo 2 caracteres" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(safeCharsRegex, { 
      message: "No se permiten caracteres especiales ni símbolos de puntuación" 
    })
    .refine((val) => {
      // Verificamos si el input contiene alguna de las palabras prohibidas (case insensitive)
      return !forbiddenPatterns.some(pattern => 
        val.toUpperCase().includes(pattern)
      );
    }, {
      message: "Entrada no válida detectada (caracteres o comandos restringidos)"
    }),
});

export function DashPricesPage(){
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { register, control, formState: { errors } } = useForm({
    resolver: zodResolver(searchSchema),
    mode: "onChange" // Validar mientras escribe
  });

  // Observamos el valor del input en tiempo real
  const searchTerm = useWatch({
    control,
    name: "itemName",
    defaultValue: ""
  });

  useEffect(() => {
    // 1. Validar el término con el esquema antes de disparar el fetch
    const validation = searchSchema.safeParse({ itemName: searchTerm });

    if (!validation.success) {
      // Si la validación falla (ej: puso un ';'), limpiamos resultados y no llamamos a la DB
      setResults([]);
      return;
    }

    // 2. Si es válido, disparamos el debounce
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const items = await getItemAndPriceDB(searchTerm)
      setResults(items)
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return<Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Form.Group>
            <InputGroup hasValidation>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                {...register('itemName')}
                placeholder="Escribe para buscar..."
                isInvalid={!!errors.itemName}
              />
              {isSearching && (
                <InputGroup.Text>
                  <Spinner animation="border" size="sm" />
                </InputGroup.Text>
              )}
            </InputGroup>
          </Form.Group>

          {/* Lista de resultados en tiempo real */}
          {results.length > 0 && (
            <ListGroup className="mt-2 shadow-sm">
              {results.length > 0 && (
                <div className="mt-4 shadow-sm border rounded overflow-hidden">
                  <Table hover responsive striped className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3 px-4 text-secondary text-uppercase font-monospace" style={{ fontSize: '0.8rem' }}>
                          Descripción del Item
                        </th>
                        <th className="py-3 px-4 text-end text-secondary text-uppercase font-monospace" style={{ fontSize: '0.8rem' }}>
                          Precio Unitario
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((item, index) => (
                        <tr key={item.id || index} style={{ cursor: 'pointer' }}>
                          <td className="py-3 px-4 align-middle">
                            <span className="fw-medium text-dark">{item.descripcion}</span>
                          </td>
                          <td className="py-3 px-4 text-end align-middle">
                            <span className="badge bg-success-subtle text-success border border-success-subtle fs-6 p-2">
                              S/. {Number(item.precio_unitario).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
}