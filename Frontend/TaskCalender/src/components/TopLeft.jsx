import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiRequest } from "../service/api";

export default function TopLeft() {
  const [emptyDates, setEmptyDates] = useState([]);
  const [lightDates, setLightDates] = useState([]);

useEffect(() => {
  const loadAvailableDates = async () => {
    try {
      const res = await apiRequest("/tasks/available-dates");

      console.log("RAW API RESPONSE:", res);
      console.log("FREE DAYS FROM BACKEND:", res.freeDays);
      console.log("LIGHT DAYS FROM BACKEND:", res.lightDays);

      const mapDate = (d) => {
        const dateObj = new Date(d.key + "T00:00:00");

        return {
          dateKey: d.key,
          day: dateObj.getDate(),
          month: dateObj.toLocaleDateString("en-US", { month: "short" }),
          fullDate: dateObj.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          count: d.count,
        };
      };

      setEmptyDates((res.freeDays || []).map(mapDate));
      setLightDates((res.lightDays || []).map(mapDate));
    } catch (err) {
      console.error("Failed to load available dates:", err.message);
    }
  };

  loadAvailableDates();
}, []);


  return (
    <div className="h-full w-full bg-background border-2 border-primary rounded-lg p-2 sm:p-3 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-2">
        <h2 className="font-kodchasan text-primary text-xs sm:text-sm md:text-base font-bold">
          Available Dates
        </h2>
        <p className="font-kodchasan text-primary/60 text-[9px] sm:text-[10px]">
          Best days to schedule your tasks
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 overflow-hidden min-h-0">
        {/* Free Days */}
        <div className="bg-background border-2 border-green-500 rounded-lg p-1.5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-kodchasan text-primary font-bold text-[10px]">
              Free Days
            </h3>
            <span className="text-green-600 text-[8px] font-semibold">
              0 Tasks
            </span>
          </div>

          <div className="flex items-center gap-2">
            {emptyDates.length === 0 ? (
              <span className="text-[9px] text-primary/50">
                No free days nearby
              </span>
            ) : (
              emptyDates.map((date) => (
                <motion.div
                  key={date.dateKey}
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 sm:w-6 sm:h-6 rounded-full bg-green-100 border border-green-400 flex flex-col items-center justify-center cursor-pointer"
                  title={date.fullDate}
                >
                  <span className="font-kodchasan text-green-700 font-bold text-xs leading-none">
                    {date.day}
                  </span>
                  <span className="font-kodchasan text-green-700/70 text-[8px] leading-none">
                    {date.month}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Light Load Days */}
        <div className="bg-background border-2 border-accent2 rounded-lg p-1.5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-kodchasan text-primary font-bold text-[10px]">
              Light Load
            </h3>
            <span className="text-accent2 text-[8px] font-semibold">
              &lt; 3 Tasks
            </span>
          </div>

          <div className="flex items-center gap-2">
            {lightDates.length === 0 ? (
              <span className="text-[9px] text-primary/50">
                No light-load days
              </span>
            ) : (
              lightDates.map((date) => (
                <motion.div
                  key={date.dateKey}
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 sm:w-6 sm:h-6 rounded-full bg-accent2/20 border border-accent2 flex flex-col items-center justify-center cursor-pointer"
                  title={date.fullDate}
                >
                  <span className="font-kodchasan text-accent2 font-bold text-xs leading-none">
                    {date.day}
                  </span>
                  <span className="font-kodchasan text-accent2/70 text-[8px] leading-none">
                    {date.month}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
