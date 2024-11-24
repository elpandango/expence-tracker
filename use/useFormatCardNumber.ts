export function useFormatCardNumber(number: string) {
  const rawValue = number.replace(/\D/g, '');
  let formattedNumber;

  if (rawValue.length > 16) {
    formattedNumber = rawValue.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  } else {
    formattedNumber = rawValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  return {rawValue, formattedNumber};
};