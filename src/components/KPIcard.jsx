const KPIcard = ({
  title,
  value,
  description,
  icon,
  percentageChange,
  trend,
  goalPercentage,
  currentPercentage,
  className = "",
}) => {
  // Determinar automáticamente la tendencia si no se proporciona
  const determineTrend = () => {
    if (trend) return trend;
    if (!percentageChange) return "neutral";
    return percentageChange > 0
      ? "positive"
      : percentageChange < 0
      ? "negative"
      : "neutral";
  };

  const actualTrend = determineTrend();

  // Determinar el estado de la meta si se proporcionan los porcentajes
  const determineGoalStatus = () => {
    if (goalPercentage === undefined || currentPercentage === undefined)
      return null;

    if (title.toLowerCase().includes("gasto")) {
      // Para gastos, estar por debajo del objetivo es positivo
      return currentPercentage <= goalPercentage ? "positive" : "negative";
    } else {
      // Para ahorros e inversiones, estar por encima del objetivo es positivo
      return currentPercentage >= goalPercentage ? "positive" : "negative";
    }
  };

  const goalStatus = determineGoalStatus();

  // Clases para las tendencias
  const trendClasses = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500",
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          {icon && <div className="h-4 w-4 text-gray-400">{icon}</div>}
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}

        {percentageChange !== undefined && (
          <div
            className={`flex items-center text-xs mt-2 ${trendClasses[actualTrend]}`}
          >
            {actualTrend === "positive" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            ) : actualTrend === "negative" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            ) : null}
            <span>{Math.abs(percentageChange)}%</span>
          </div>
        )}

        {goalPercentage !== undefined && currentPercentage !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progreso</span>
              <span
                className={
                  goalStatus === "positive"
                    ? "text-green-500"
                    : goalStatus === "negative"
                    ? "text-red-500"
                    : ""
                }
              >
                {currentPercentage}% / {goalPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={
                  goalStatus === "positive"
                    ? "bg-green-500 h-2 rounded-full"
                    : goalStatus === "negative"
                    ? "bg-red-500 h-2 rounded-full"
                    : "bg-blue-500 h-2 rounded-full"
                }
                style={{
                  width: `${Math.min(
                    100,
                    (currentPercentage / goalPercentage) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPIcard;
