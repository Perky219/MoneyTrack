import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = ({ title, data, options = {}, className = "" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const values = data.datasets?.[0]?.data || [];
  const hasData = values.some((value) => value > 0);

  if (!hasData) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500">No hay datos disponibles.</p>
      </div>
    );
  }

  useEffect(() => {
    if (!chartRef.current) return;

    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Crear el nuevo gráfico
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.raw;
              const total = context.chart.data.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              );
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${percentage}%`;
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: data,
      options: { ...defaultOptions, ...options },
    });

    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options]);

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default PieChart;
