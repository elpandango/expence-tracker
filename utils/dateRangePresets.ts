const toIsoDate = (date: Date) => date.toISOString().substring(0, 10);

const getToday = () => new Date();

const getStartOfCurrentWeek = (today: Date) => {
  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  const diffFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  startOfWeek.setDate(startOfWeek.getDate() - diffFromMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
};

const getStartOfCurrentMonth = (today: Date) => {
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

const getStartOfMonthsRange = (today: Date, monthsCount: number) => {
  return new Date(today.getFullYear(), today.getMonth() - (monthsCount - 1), 1);
};

export const DATE_RANGE_PRESETS = {
  currentWeek: 'currentWeek',
  currentMonth: 'currentMonth',
  last3Months: 'last3Months',
  last6Months: 'last6Months',
  last12Months: 'last12Months',
  custom: 'custom',
} as const;

export const getDateRangeForPreset = (preset: string) => {
  const today = getToday();
  const endDate = toIsoDate(today);
  let startDate = endDate;

  switch (preset) {
    case DATE_RANGE_PRESETS.currentWeek:
      startDate = toIsoDate(getStartOfCurrentWeek(today));
      break;
    case DATE_RANGE_PRESETS.currentMonth:
      startDate = toIsoDate(getStartOfCurrentMonth(today));
      break;
    case DATE_RANGE_PRESETS.last3Months:
      startDate = toIsoDate(getStartOfMonthsRange(today, 3));
      break;
    case DATE_RANGE_PRESETS.last6Months:
      startDate = toIsoDate(getStartOfMonthsRange(today, 6));
      break;
    case DATE_RANGE_PRESETS.last12Months:
      startDate = toIsoDate(getStartOfMonthsRange(today, 12));
      break;
    default:
      break;
  }

  return {
    startDate,
    endDate,
  };
};
