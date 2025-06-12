import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DataForm from "../components/DataForm";

const API_URL = import.meta.env.VITE_API_URL;

const EditEntry = () => {
  const { type, date } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1) Traer registro existente
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/records/${type}?start_date=${date}&end_date=${date}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("No pude cargar el registro.");
        const arr = await res.json();
        if (!arr.length) throw new Error("Registro no encontrado.");
        setInitialData({ ...arr[0], type });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [type, date]);

  // 2) Actualizar
  const handleUpdate = async (formData) => {
    const endpoint = {
      expense: "expenses",
      saving: "savings",
      investment: "investments",
    }[formData.type];
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
      }),
    });
    if (!res.ok)
      throw new Error((await res.json()).detail || "Error guardando");
  };

  // 3) Eliminar
  const handleDelete = async () => {
    const endpoint = {
      expense: "expenses",
      saving: "savings",
      investment: "investments",
    }[type];
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: initialData.date }),
    });
    if (!res.ok) throw new Error("Error eliminando");
    navigate("/dashboard");
  };

  if (loading) return <p className="text-center">Cargando…</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Editar Registro Financiero
      </h1>
      <DataForm
        initialData={initialData}
        onSave={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default EditEntry;
