import { useNavigate } from "react-router-dom";
import DataForm from "../components/DataForm";

const API_URL = import.meta.env.VITE_API_URL;

const AddEntry = () => {
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    // formData viene con { date, amount, type, category }
    const endpoint = {
      expense: "expenses",
      saving: "savings",
      investment: "investments",
    }[formData.type];

    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
      }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Error creando");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Nuevo Registro Financiero
      </h1>
      <DataForm onSave={handleCreate} onDelete={null} />
    </div>
  );
};

export default AddEntry;
