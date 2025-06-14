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
      // 1) mapear singular → plural para la ruta
      const pluralMap = {
        expense: "expenses",
        saving: "savings",
        investment: "investments",
      };
      const endpoint = pluralMap[type];
      if (!endpoint) {
        setError("Tipo inválido");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/records/${endpoint}?start_date=${date}&end_date=${date}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("No pude cargar el registro.");
        const arr = await res.json();
        if (!arr.length) throw new Error("Registro no encontrado.");
        // añadimos el tipo original para que DataForm lo use
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
    }[type];
    const res = await fetch(`${API_URL}/${endpoint}/${initialData.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error guardando");
    }
    navigate("/dashboard");
  };

  // 3) Eliminar
  const handleDelete = async () => {
    const endpoint = {
      expense: "expenses",
      saving: "savings",
      investment: "investments",
    }[type];
    const res = await fetch(`${API_URL}/${endpoint}/${initialData.id}`, {
      method: "DELETE",
      credentials: "include",
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
