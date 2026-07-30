export type CalendarCell = {
  key: string;
  date: Date | null;
  dayNumber: number | null;
};

export type DateRangeValue = {
  startDate: string | null;
  endDate: string | null;
};

export type DateField = 'start' | 'end';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const WEEKDAY_NAMES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export const startOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const parseIsoDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }

  if (!ISO_DATE_PATTERN.test(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const formatIsoDate = (date: Date | null): string | null => {
  if (!date) return null;

  const normalized = startOfDay(date);
  const year = normalized.getFullYear();
  const month = `${normalized.getMonth() + 1}`.padStart(2, '0');
  const day = `${normalized.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (date: Date | null): string => {
  if (!date) return '';

  const normalized = startOfDay(date);
  const day = `${normalized.getDate()}`.padStart(2, '0');
  const month = `${normalized.getMonth() + 1}`.padStart(2, '0');
  const year = normalized.getFullYear();

  return `${day}/${month}/${year}`;
};

export const compareDates = (left: Date | null, right: Date | null): number => {
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;

  const leftTime = startOfDay(left).getTime();
  const rightTime = startOfDay(right).getTime();

  if (leftTime === rightTime) return 0;
  return leftTime > rightTime ? 1 : -1;
};

export const isSameDay = (left: Date | null, right: Date | null): boolean => {
  return compareDates(left, right) === 0;
};

export const isBeforeDate = (left: Date | null, right: Date | null): boolean => {
  return compareDates(left, right) < 0;
};

export const isAfterDate = (left: Date | null, right: Date | null): boolean => {
  return compareDates(left, right) > 0;
};

export const clampDateToRange = ({
  date,
  minDate,
  maxDate,
}: {
  date: Date | null;
  minDate?: Date | null;
  maxDate?: Date | null;
}): Date | null => {
  if (!date) return null;

  const normalized = startOfDay(date);

  if (minDate && isBeforeDate(normalized, minDate)) {
    return startOfDay(minDate);
  }

  if (maxDate && isAfterDate(normalized, maxDate)) {
    return startOfDay(maxDate);
  }

  return normalized;
};

export const normalizeRange = ({
  startDate,
  endDate,
  changedField,
  minDate,
  maxDate,
}: {
  startDate: Date | null;
  endDate: Date | null;
  changedField: DateField;
  minDate?: Date | null;
  maxDate?: Date | null;
}): { startDate: Date | null; endDate: Date | null } => {
  let nextStart = clampDateToRange({ date: startDate, minDate, maxDate });
  let nextEnd = clampDateToRange({ date: endDate, minDate, maxDate });

  if (!nextStart || !nextEnd) {
    return {
      startDate: nextStart,
      endDate: nextEnd,
    };
  }

  if (isAfterDate(nextStart, nextEnd)) {
    if (changedField === 'start') {
      nextEnd = startOfDay(nextStart);
    } else {
      nextStart = startOfDay(nextEnd);
    }
  }

  return {
    startDate: nextStart,
    endDate: nextEnd,
  };
};

export const buildCalendarCells = ({
  month,
  year,
}: {
  month: number;
  year: number;
}): CalendarCell[] => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const offset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < offset; index += 1) {
    cells.push({
      key: `blank-${year}-${month}-${index}`,
      date: null,
      dayNumber: null,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({
      key: formatIsoDate(date) ?? `day-${year}-${month}-${day}`,
      date,
      dayNumber: day,
    });
  }

  return cells;
};
