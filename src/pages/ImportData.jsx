import ImportForm from "../components/ImportForm";

const ImportData = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Importar Datos Financieros
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Importa tus datos financieros desde archivos CSV para agilizar el
          proceso de registro
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Formato de archivos CSV
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Ingresos:</strong> fecha, monto
                </li>
                <li>
                  <strong>Gastos:</strong> fecha, monto, categoría
                </li>
                <li>
                  <strong>Ahorros:</strong> fecha, monto, categoría
                </li>
                <li>
                  <strong>Inversiones:</strong> fecha, monto, categoría
                </li>
                <li>
                  <strong>Metas:</strong> fecha, monto
                </li>
              </ul>
              <p className="mt-2">
                <strong>Formato de fecha:</strong> YYYY-MM-DD (ejemplo:
                2024-01-15)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <ImportForm />
      </div>
    </div>
  );
};

export default ImportData;
