const dateFormatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });

/** Función para convertir fechas a texto legible, por ejemplo "09/10/2026". */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
