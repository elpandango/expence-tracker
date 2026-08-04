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

export const getDateRangeLengthInDays = (dateRange: {startDate: string; endDate: string}) => {
  const [startYear, startMonth, startDay] = dateRange.startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = dateRange.endDate.split('-').map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.floor((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) + 1;
};
