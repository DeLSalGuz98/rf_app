import { Form, Button } from "react-bootstrap";
import { useFormContext } from "react-hook-form";

export function InputField({ name, label, type = "text", placeholder }){
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        isInvalid={!!errors[name]}
        {...register(name)}
      />
      {errors[name] && (
        <Form.Control.Feedback type="invalid">
          {errors[name].message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
}

export function BtnSubmitForm() {
  return <div className="d-grid mt-3">
    <Button type="submit" variant="primary">
      Enviar
    </Button>
  </div>
}