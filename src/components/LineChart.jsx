import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const LineChart = ({ title, data, options = {}, className = "" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

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
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, {
      type: "line",
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

export default LineChart;
