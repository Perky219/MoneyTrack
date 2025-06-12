import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KPIcard from "../../components/KPIcard";
import PieChart from "../../components/PieChart";
import TableList from "../../components/TableList";

const API_URL = import.meta.env.VITE_API_URL;

const Overview = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState(null);
  const [expensesData, setExpensesData] = useState([]);
  const [savingsData, setSavingsData] = useState([]);
  const [investmentsData, setInvestmentsData] = useState([]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1–12

    // 1) Monthly summary
    fetch(`${API_URL}/monthly-summary/${year}/${month}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar resumen mensual");
        return res.json();
      })
      .then((data) => {
        setFinancialData({
          monthlyIncome: data.total_income,
          monthlyExpenses: data.total_expenses,
          monthlySavings: data.total_savings,
          monthlyInvestments: data.total_investments,
          goals: {
            spending: data.expense_goal_percentage || 0,
            saving: data.saving_goal_percentage || 0,
            investment: data.investment_goal_percentage || 0,
          },
          expensesByCategory: data.expense_by_category,
          savingsByCategory: data.saving_by_category,
          investmentsByCategory: data.investment_by_category,
        });
      })
      .catch(console.error);

    // 2) Últimos 5 de cada tipo
    const fetchRecent = (type, setter) => {
      // obtenemos desde el 1 del mes hasta hoy
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const end = today.toISOString().slice(0, 10);
      fetch(`${API_URL}/records/${type}?start_date=${start}&end_date=${end}`, {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Error al cargar ${type}`);
          return res.json();
        })
        .then((records) => {
          // quedarnos con los 5 más recientes
          const latest = records
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((r) => ({
              date: r.date.slice(0, 10),
              amount: `$${Number(r.amount).toFixed(2)}`,
              category: r.category,
              type, // guardamos el tipo para el click
            }));
          setter(latest);
        })
        .catch(console.error);
    };

    fetchRecent("expenses", setExpensesData);
    fetchRecent("savings", setSavingsData);
    fetchRecent("investments", setInvestmentsData);
  }, []);

  if (!financialData) {
    return <div>Cargando...</div>;
  }

  // Pie data dinámico
  const makePieData = (obj) => ({
    labels: Object.keys(obj),
    datasets: [{ data: Object.values(obj) }],
  });

  // Porcentajes actuales
  const {
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    monthlyInvestments,
    goals,
  } = financialData;
  const currentSpendingPercentage = (monthlyExpenses / monthlyIncome) * 100;
  const currentSavingPercentage = (monthlySavings / monthlyIncome) * 100;
  const currentInvestmentPercentage =
    (monthlyInvestments / monthlyIncome) * 100;

  const handleIncomeClick = () =>
    navigate("/add-income", {
      state: {
        data: {
          type: "income",
          amount: monthlyIncome,
          date: new Date().toISOString().slice(0, 10),
        },
      },
    });

  const handleRowClick = (row) =>
    navigate("/edit-entry", { state: { data: row } });

  const tableColumns = [
    { Header: "Fecha", accessor: "date" },
    { Header: "Monto", accessor: "amount" },
    { Header: "Categoría", accessor: "category" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
            Vista General
          </button>
          <button
            onClick={() => navigate("/dashboard/history")}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
          >
            Histórico
          </button>
        </nav>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={handleIncomeClick} className="cursor-pointer">
          <KPIcard
            title="Ingreso Mensual Total"
            value={`$${monthlyIncome.toLocaleString()}`}
            description="Haz clic para editar"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            }
          />
        </div>

        <KPIcard
          title="Gasto Mensual Total"
          value={`$${monthlyExpenses.toLocaleString()}`}
          description="Suma de todos los gastos"
          goalPercentage={goals.spending}
          currentPercentage={currentSpendingPercentage}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        <KPIcard
          title="Ahorro Mensual Total"
          value={`$${monthlySavings.toLocaleString()}`}
          description="Suma de todos los ahorros"
          goalPercentage={goals.saving}
          currentPercentage={currentSavingPercentage}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        <KPIcard
          title="Inversión Mensual Total"
          value={`$${monthlyInvestments.toLocaleString()}`}
          description="Suma de todas las inversiones"
          goalPercentage={goals.investment}
          currentPercentage={currentInvestmentPercentage}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/add-entry")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Agregar Registro
        </button>

        <button
          onClick={() => navigate("/import")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Importar Datos
        </button>
      </div>

      {/* Distribuciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PieChart
          title="Distribución de Gastos"
          data={makePieData(financialData.expensesByCategory)}
        />
        <PieChart
          title="Distribución de Ahorros"
          data={makePieData(financialData.savingsByCategory)}
        />
        <PieChart
          title="Distribución de Inversiones"
          data={makePieData(financialData.investmentsByCategory)}
        />
      </div>

      {/* Tablas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TableList
          title="Gastos Recientes"
          columns={tableColumns}
          data={expensesData}
          onRowClick={handleRowClick}
        />
        <TableList
          title="Ahorros Recientes"
          columns={tableColumns}
          data={savingsData}
          onRowClick={handleRowClick}
        />
        <TableList
          title="Inversiones Recientes"
          columns={tableColumns}
          data={investmentsData}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default Overview;
