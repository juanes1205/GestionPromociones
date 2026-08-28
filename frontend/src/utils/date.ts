/**
 * Formatea una fecha ISO a un formato legible dd/mm/yyyy en la zona horaria de América/Bogotá (UTC-5).
 */
export const formatDate = (dateInput: string | Date): string => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Retorna true si la fecha actual está dentro del rango de vigencia de la promoción.
 * Al usar timestamps que incluyen el offset de Colombia (UTC-5), una comparación directa de tiempo es exacta.
 */
export const isPromotionActiveToday = (startDate: string | Date, endDate: string | Date): boolean => {
  if (!startDate || !endDate) return false;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  const now = new Date();
  return now >= start && now <= end;
};
