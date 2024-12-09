export function useFormatDate(date) {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInMs = now - dateObj;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInMinutes < 1) {
    return 'Только что';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} минут назад`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'час' : 'часов'} назад`;
  }

  return dateObj.toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
