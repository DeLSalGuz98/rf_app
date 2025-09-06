import { Form, Button } from "react-bootstrap";
import { useFormContext } from "react-hook-form";

export function InputField({ name, label, type = "text", placeholder, readOnly=false, step="" }){
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
        readOnly={readOnly}
        {...register(name)}
        step={step}
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

export function SelectField({ label, name, options = [] }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Select {...register(name)}>
        <option value="">Select one</option>
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
      {errors[name] && (
        <Form.Text className="text-danger">{errors[name].message}</Form.Text>
      )}
    </Form.Group>
  );
}