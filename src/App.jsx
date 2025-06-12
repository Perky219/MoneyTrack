import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./routes/AppRouter";
import "./styles/index.css";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
