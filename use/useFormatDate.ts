export function useFormatDate(date) {
  const dateObj = new Date(date);

  return dateObj.toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}