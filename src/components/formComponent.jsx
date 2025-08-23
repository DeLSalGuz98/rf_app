import { FormProvider } from "react-hook-form";
import { Card } from "react-bootstrap";

const FormComponent = ({ methods, onSubmit, title, children }) => {
  return (
    <Card className="shadow-sm rounded-4 p-4 w-100">
      <h3 className="text-center mb-4">{title}</h3>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {children}
        </form>
      </FormProvider>
    </Card>
  );
};

export default FormComponent;