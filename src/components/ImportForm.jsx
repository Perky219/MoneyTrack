import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ImportForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    dataType: "",
    file: null,
  });
  const [fileName, setFileName] = useState("");

  const handleTypeChange = (e) => {
    setFormData({
      ...formData,
      dataType: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setError("El archivo debe ser de tipo CSV.");
        setFormData({
          ...formData,
          file: null,
        });
        setFileName("");
        return;
      }

      setFormData({
        ...formData,
        file: file,
      });
      setFileName(file.name);
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.dataType) {
      setError("El tipo de datos es requerido");
      return false;
    }

    if (!formData.file) {
      setError("El archivo CSV es requerido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", formData.file);

      const typeMap = {
        income: "income",
        expense: "expenses",
        saving: "savings",
        investment: "investments",
        spendingGoal: "expense_goals",
        savingGoal: "saving_goals",
        investmentGoal: "investment_goals",
      };
      const apiType = typeMap[formData.dataType];

      const res = await fetch(
        `${API_URL}/import-csv?data_type=${apiType}`,
        {
          method: "POST",
          credentials: "include",
          body: fd,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al importar CSV");
      }

      const result = await res.json();
      setSuccess(
        `Importado: ${result.imported_records}, Fallidos: ${result.failed_records}`
      );
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      setError(
        "No se pudieron importar los datos. " +
        (error.message || "Verifica el formato e intenta nuevamente.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Importar Datos</h1>
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
            htmlFor="dataType"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo de Datos *
          </label>
          <select
            id="dataType"
            value={formData.dataType}
            onChange={handleTypeChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona un tipo de datos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
            <option value="saving">Ahorros</option>
            <option value="investment">Inversiones</option>
            <option value="spendingGoal">Metas de Gasto</option>
            <option value="savingGoal">Metas de Ahorro</option>
            <option value="investmentGoal">Metas de Inversión</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Selecciona el tipo de datos que deseas importar
          </p>
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Archivo CSV *
          </label>
          <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Selecciona un archivo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">o arrastra y suelta</p>
              </div>
              <p className="text-xs text-gray-500">Solo archivos CSV</p>
              {fileName && (
                <p className="text-sm text-blue-600 font-medium mt-2">
                  Archivo seleccionado: {fileName}
                </p>
              )}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            El archivo debe estar en formato CSV con las columnas correctas
            según el tipo de datos
          </p>
        </div>

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
                Importando...
              </>
            ) : (
              "Importar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportForm;
