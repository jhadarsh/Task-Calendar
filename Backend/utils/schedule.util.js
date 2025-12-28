const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const generateRepeatedDates = (baseDate, intervalDays) => {
  const dates = [];
  let step = 1;

  let current = new Date(baseDate);
  const limitDate = addMonths(baseDate, 15);

  while (true) {
    current = new Date(current);
    current.setDate(current.getDate() + intervalDays);

    if (current > limitDate) break;

    dates.push({
      date: current,
      step
    });

    step++;
  }

  return dates;
};

module.exports = { generateRepeatedDates };
