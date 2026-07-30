export const formatDateToLocalIso = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const shiftIsoDateByYears = (isoDate: string, years: number) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const sourceDate = new Date(year, month - 1, day);
  const shiftedDate = new Date(sourceDate);

  shiftedDate.setFullYear(shiftedDate.getFullYear() + years);

  if (shiftedDate.getMonth() !== sourceDate.getMonth()) {
    shiftedDate.setDate(0);
  }

  return formatDateToLocalIso(shiftedDate);
};

export const shiftDateRangeByYears = (
  dateRange: {startDate: string; endDate: string},
  years: number
) => {
  return {
    startDate: shiftIsoDateByYears(dateRange.startDate, years),
    endDate: shiftIsoDateByYears(dateRange.endDate, years),
  };
};
