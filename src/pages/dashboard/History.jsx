import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LineChart from "../../components/LineChart";

const API_URL = import.meta.env.VITE_API_URL;

const periods = [
  { value: "1month", label: "1 Mes", days: 30 },
  { value: "6months", label: "6 Meses", months: 6 },
  { value: "1year", label: "1 Año", years: 1 },
  { value: "3years", label: "3 Años", years: 3 },
  { value: "5years", label: "5 Años", years: 5 },
];

const chartTypes = [
  { value: "income", label: "Ingresos", api: "income" },
  { value: "expenses", label: "Gastos", api: "expenses" },
  { value: "savings", label: "Ahorros", api: "savings" },
  { value: "investments", label: "Inversiones", api: "investments" },
  { value: "spendingGoals", label: "Metas de Gasto", api: "expense_goals" },
  { value: "savingGoals", label: "Metas de Ahorro", api: "saving_goals" },
  {
    value: "investmentGoals",
    label: "Metas de Inversión",
    api: "investment_goals",
  },
];

export default function History() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedChart, setSelectedChart] = useState("income");
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);

  // Calcula ISO strings para start/end
  const computeRange = () => {
    const now = new Date();
    let start = new Date();
    const p = periods.find((p) => p.value === selectedPeriod);
    if (p.days) {
      start.setDate(now.getDate() - p.days);
    } else if (p.months) {
      start.setMonth(now.getMonth() - p.months);
    } else if (p.years) {
      start.setFullYear(now.getFullYear() - p.years);
    }
    return {
      start_date: start.toISOString().slice(0, 10),
      end_date: now.toISOString().slice(0, 10),
    };
  };

  useEffect(() => {
    const fetchHistorical = async () => {
      setLoading(true);
      const period = computeRange();
      const type = chartTypes.find((c) => c.value === selectedChart).api;
      try {
        const res = await fetch(`${API_URL}/historical-data`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data_type: type,
            start_date: period.start_date,
            end_date: period.end_date,
          }),
        });
        if (!res.ok) throw new Error("Error al obtener histórico");
        const { data_points } = await res.json();
        // data_points: [{ date: "2024-01-01T...", value: 123, goal_met: true }, ...]
        const labels = data_points.map((d) =>
          new Date(d.date).toLocaleDateString("es-ES", {
            month: "short",
            year: "numeric",
          })
        );
        const datasets = [];
        if (type.endsWith("_goals")) {
          // dos líneas: meta vs real
          datasets.push({
            label: "Meta (%)",
            data: data_points.map((d) => d.value),
            tension: 0.4,
          });
          datasets.push({
            label: "Real (%)",
            data: data_points.map((d) => (d.goal_met ? d.value : d.value)),
            tension: 0.4,
          });
        } else {
          datasets.push({
            label: chartTypes.find((c) => c.value === selectedChart).label,
            data: data_points.map((d) => d.value),
            tension: 0.4,
          });
        }
        setChartData({ labels, datasets });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorical();
  }, [selectedPeriod, selectedChart]);

  const getChartTitle = () =>
    chartTypes.find((c) => c.value === selectedChart).label + " (Histórico)";

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => navigate("/dashboard/overview")}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
          >
            Vista General
          </button>
          <button className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
            Histórico
          </button>
        </nav>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="period"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Período de Tiempo
          </label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label
            htmlFor="chartType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tipo de Gráfico
          </label>
          <select
            id="chartType"
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {chartTypes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <LineChart
            title={getChartTitle()}
            data={{
              labels: chartData.labels,
              datasets: chartData.datasets.map((ds, i) => ({
                ...ds,
                borderColor: i === 0 ? "#36A2EB" : "#FF6384",
                backgroundColor: "rgba(54, 162, 235, 0.1)",
              })),
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (v) =>
                      selectedChart.endsWith("Goals")
                        ? v + "%"
                        : "$" + v.toLocaleString(),
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const val = ctx.parsed.y;
                      return selectedChart.endsWith("Goals")
                        ? `${ctx.dataset.label}: ${val}%`
                        : `${ctx.dataset.label}: $${val.toLocaleString()}`;
                    },
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
