import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = import.meta.env.VITE_API_URL;

const AddIncome = () => {
  const navigate = useNavigate();
  const [dateObj, setDateObj] = useState(new Date());
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!dateObj || !amount || parseFloat(amount) <= 0) {
      setError("Fecha y monto válidos son requeridos");
      return;
    }
    setIsLoading(true);

    try {
      const payload = {
        date: dateObj.toISOString().slice(0, 10),
        amount: parseFloat(amount),
      };
      const res = await fetch(`${API_URL}/incomes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error guardando ingreso");
      }
      setSuccess("Ingreso agregado correctamente");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Nuevo Ingreso</h1>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="p-3 mb-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Fecha *</label>
          <DatePicker
            selected={dateObj}
            onChange={setDateObj}
            dateFormat="yyyy-MM-dd"
            onChangeRaw={(e) => e.preventDefault()}
            className="mt-1 w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Monto *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded"
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isLoading}
            className="flex-1 py-2 border rounded bg-gray-100 hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isLoading ? "Guardando..." : "Guardar Ingreso"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddIncome;
