import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiRequest } from "../service/api";

export default function TopRight() {
  const [selectedPeriod, setSelectedPeriod] = useState("this");
  const [data, setData] = useState(null);

  const COLORS = ["#10b981", "#e5e7eb"];

  useEffect(() => {
    const loadPerformance = async () => {
      const res = await apiRequest("/tasks/performance");
      setData(res.stats);
    };
    loadPerformance();
  }, []);

  if (!data) return null;

  const thisMonth = data.thisMonth;
  const lastMonth = data.lastMonth;

  const makeChartData = (m) => [
    { name: "Completed", value: m.completed },
    { name: "Pending", value: m.total - m.completed },
  ];

  const CustomTooltip = ({ active, payload, total }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    const percent = Math.round((value / total) * 100);

    return (
      <div className="bg-white border-2 border-emerald-200 rounded-lg px-3 py-2 shadow-lg text-xs">
        <strong className="text-gray-800">{name}</strong>
        <div className="text-gray-600 mt-1">
          {value} tasks · {percent}%
        </div>
      </div>
    );
  };

  const StatCard = ({ label, data, period }) => {
    const percent = data.total
      ? Math.round((data.completed / data.total) * 100)
      : 0;

    return (
      <button
        onClick={() => setSelectedPeriod(period)}
        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
          selectedPeriod === period
            ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md"
            : "border-purple-200 hover:border-emerald-300 hover:shadow-sm"
        }`}
      >
        <div className="text-[11px] font-semibold text-gray-600">{label}</div>
        <div className="text-xl font-bold text-gray-800">{percent}%</div>
        <div className="text-[10px] text-gray-500">
          {data.completed}/{data.total} done
        </div>
      </button>
    );
  };

  return (
    <div className="h-[20vh] min-h-[200px] bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20 border-2 border-purple-300 rounded-2xl p-3 flex flex-col overflow-hidden shadow-sm">
      <div className="mb-2 flex-shrink-0">
        <h2 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-600 rounded-full"></span>
          Task Accuracy
        </h2>
        <p className="text-[10px] text-gray-500 ml-3">
          This Month vs Last Month
        </p>
      </div>

      {/* Mobile */}
      <div className="sm:hidden grid grid-cols-2 gap-2 flex-1">
        <StatCard label="This Month" data={thisMonth} period="this" />
        <StatCard label="Last Month" data={lastMonth} period="last" />
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex flex-1 gap-3 min-h-0">
        {[["This Month", thisMonth], ["Last Month", lastMonth]].map(
          ([label, m], idx) => (
            <div 
              key={idx} 
              className="flex-1 flex flex-col items-center bg-white rounded-xl p-2 border-2 border-indigo-200 hover:border-purple-400 transition-all duration-200 min-h-0"
            >
              <div className="text-xs font-semibold text-gray-700 mb-1">{label}</div>
              <div className="w-full flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={makeChartData(m)}
                      dataKey="value"
                      innerRadius="50%"
                      outerRadius="100%"
                      paddingAngle={2}
                    >
                      {makeChartData(m).map((_, i) => (
                        <Cell 
                          key={i} 
                          fill={COLORS[i]} 
                          stroke={i === 0 ? "#059669" : "#d1d5db"}
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip total={m.total} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center flex-shrink-0 mt-1">
                <div className="text-lg font-bold text-gray-800">
                  {m.total
                    ? Math.round((m.completed / m.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-[10px] text-gray-500">
                  {m.completed}/{m.total} tasks
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}