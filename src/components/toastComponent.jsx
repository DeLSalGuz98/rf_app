import { ToastContainer } from "react-toastify";

export function ToastComponent() {
  return(
    <ToastContainer
      position="top-right"
      autoClose={3000} // se cierra en 3s
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
    />
  )
}