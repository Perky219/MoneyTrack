import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = import.meta.env.VITE_API_URL;

const categories = {
  expense: [
    { value: "vivienda", label: "Vivienda" },
    { value: "alimentacion", label: "Alimentación" },
    { value: "transporte", label: "Transporte" },
    { value: "salud", label: "Salud" },
    { value: "educacion", label: "Educación" },
    { value: "entretenimiento", label: "Entretenimiento" },
    { value: "ropa", label: "Ropa" },
    { value: "otros", label: "Otros" },
  ],
  saving: [
    { value: "fondo_emergencia", label: "Fondo de Emergencia" },
    { value: "jubilacion", label: "Jubilación" },
    { value: "vacaciones", label: "Vacaciones" },
    { value: "mantenimiento", label: "Mantenimiento" },
    { value: "otros", label: "Otros" },
  ],
  investment: [
    { value: "fondo_inversion", label: "Fondo de Inversión" },
    { value: "acciones", label: "Acciones" },
    { value: "bienes_raices", label: "Bienes Raíces" },
    { value: "cripto", label: "Criptomonedas" },
    { value: "negocio", label: "Negocio" },
    { value: "otros", label: "Otros" },
  ],
};

export default function DataForm({ initialData, onSave, onDelete }) {
  const navigate = useNavigate();
  const [dateObj, setDateObj] = useState(
    initialData ? new Date(initialData.date) : new Date()
  );
  const [formData, setFormData] = useState({
    date: dateObj.toISOString().slice(0, 10),
    amount: initialData?.amount || "",
    type: initialData?.type || "",
    category: initialData?.category || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (initialData) {
      const d = new Date(initialData.date);
      setDateObj(d);
      setFormData({
        date: d.toISOString().slice(0, 10),
        amount: initialData.amount,
        type: initialData.type,
        category: initialData.category,
      });
    }
  }, [initialData]);

  useEffect(() => {
    setFormData((f) => ({
      ...f,
      date: dateObj.toISOString().slice(0, 10),
    }));
  }, [dateObj]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((f) => ({
      ...f,
      [name]: name === "type" ? value : value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const validateForm = () => {
    if (!formData.date) {
      setError("La fecha es requerida");
      return false;
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      setError("El monto debe ser mayor que cero");
      return false;
    }

    if (!formData.type) {
      setError("El tipo de transacción es requerido");
      return false;
    }

    if (!formData.category) {
      setError("La categoría es requerida");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await onSave(formData);
      setSuccess("Guardado exitoso");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      setError(error.message || "Error al guardar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsLoading(true);
    try {
      await onDelete();
    } catch (error) {
      setError(error.message || "Error al eliminar los datos");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {initialData ? "Editar Datos" : "Registrar Datos"}
        </h1>
        <p className="text-gray-500">
          {initialData
            ? "Modifica los datos financieros"
            : "Ingresa nuevos datos financieros"}
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="date"
            className="block w-full text-sm font-medium text-gray-700"
          >
            Fecha *
          </label>
          <DatePicker
            selected={dateObj}
            onChange={(date) => setDateObj(date)}
            dateFormat="yyyy-MM-dd"
            onChangeRaw={(e) => e.preventDefault()}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Formato: YYYY-MM-DD</p>
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Monto *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            disabled={!!initialData}
            placeholder="Selecciona un tipo"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione una opción</option>
            <option value="expense">Gasto</option>
            <option value="saving">Ahorro</option>
            <option value="investment">Inversión</option>
          </select>
        </div>

        {formData.type && (
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Selecciona una categoría"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione una opción</option>
              {categories[formData.type]?.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isLoading}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>

        {initialData && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            Eliminar
          </button>
        )}
      </form>
    </div>
  );
}
