import { FormProvider } from "react-hook-form";
import { Card } from "react-bootstrap";

const FormComponent = ({ methods, onSubmit, title, children, moreClasses="rounded-4"}) => {
  return (
    <Card className={`shadow-sm ${moreClasses} p-4 w-100`}>
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