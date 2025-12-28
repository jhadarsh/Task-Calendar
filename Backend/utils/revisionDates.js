const getRevisionDate = (baseDate, step) => {
  const date = new Date(baseDate);

  if (step === 1) date.setDate(date.getDate() + 3);
  if (step === 2) date.setDate(date.getDate() + 6);
  if (step === 3) date.setDate(date.getDate() + 15);

  return date;
};

module.exports = { getRevisionDate };
