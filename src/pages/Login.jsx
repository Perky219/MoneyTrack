import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Si ya está autenticado, redirigir al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (email, password) => {
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard"); // garante la redirección
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* ... logo y título ... */}
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            MoneyTrack
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona tus finanzas personales
          </p>
        </div>

        {/* Formulario */}
        <AuthForm onSubmit={handleLogin} error={error} isLoading={isLoading} />

        {/* Link a registro */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
