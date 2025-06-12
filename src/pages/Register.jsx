import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    spendingGoal: "",
    savingGoal: "",
    investmentGoal: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("El correo electrónico no es válido");
      return false;
    }
    if (formData.password.length < 10) {
      setError("La contraseña debe tener al menos 10 caracteres");
      return false;
    }
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "La contraseña debe incluir letras, números y al menos 1 símbolo"
      );
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    if (formData.username && formData.username.length > 50) {
      setError("El nombre de usuario no puede exceder 50 caracteres");
      return false;
    }
    const spending = parseFloat(formData.spendingGoal) || 0;
    const saving = parseFloat(formData.savingGoal) || 0;
    const investment = parseFloat(formData.investmentGoal) || 0;
    if (spending + saving + investment > 100) {
      setError("La suma de las metas financieras no puede exceder el 100%");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        username: formData.username || undefined,
        password: formData.password,
      });

      const today = new Date().toISOString().split("T")[0];
      const goals = [
        { key: "spendingGoal", type: "expense" },
        { key: "savingGoal", type: "saving" },
        { key: "investmentGoal", type: "investment" },
      ];
      await Promise.all(
        goals
          .filter(({ key }) => parseFloat(formData[key]) > 0)
          .map(({ key, type }) =>
            fetch(`${API_URL}/goals/${type}`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                date: today,
                value: parseFloat(formData[key]),
              }),
            }).then((response) => {
              if (!response.ok)
                throw new Error(`Error al guardar la meta ${type}`);
            })
          )
      );
      toast.success("Cuenta creada exitosamente");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo Electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre de Usuario (opcional)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                maxLength="50"
                value={formData.username}
                onChange={handleChange}
                placeholder="Tu nombre de usuario"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Máximo 50 caracteres</p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 10 caracteres, debe incluir letras, números y al menos 1
                símbolo
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar Contraseña *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Metas */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Metas Financieras Iniciales (opcional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Establece tus metas como porcentaje de tu ingreso mensual. La
                suma no puede exceder 100%.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {["spending", "saving", "investment"].map((key) => (
                  <div key={key}>
                    <label
                      htmlFor={`${key}Goal`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Meta de{" "}
                      {key === "spending"
                        ? "Gasto"
                        : key === "saving"
                        ? "Ahorro"
                        : "Inversión"}{" "}
                      (%)
                    </label>
                    <input
                      id={`${key}Goal`}
                      name={`${key}Goal`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData[`${key}Goal`]}
                      onChange={handleChange}
                      placeholder="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Total:{" "}
                {["spendingGoal", "savingGoal", "investmentGoal"]
                  .reduce(
                    (sum, field) => sum + (parseFloat(formData[field]) || 0),
                    0
                  )
                  .toFixed(1)}
                %
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    className="opacity-75"
                  />
                </svg>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>
        </div>
        {/* Link de vuelta al login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
