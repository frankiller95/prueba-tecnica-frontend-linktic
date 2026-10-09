export type FilterValue = string | number;

export interface FilterOption {
  label: string;
  value: FilterValue;
}

interface BaseFilterField {
  /** Nombre de la propiedad con la que se emite el valor del campo. */
  key: string;
  label: string;
  required?: boolean;
  /** Valor al que vuelve el campo al limpiar; si se omite, queda vacío. */
  defaultValue?: FilterValue;
}

export interface TextFilterField extends BaseFilterField {
  type: 'text';
}

export interface DateFilterField extends BaseFilterField {
  /** El valor se emite con el formato YYYY-MM-DD. */
  type: 'date';
}

export interface SelectFilterField extends BaseFilterField {
  type: 'select';
  options: FilterOption[];
}

export type FilterField = TextFilterField | DateFilterField | SelectFilterField;

/** Valores emitidos al buscar: solo incluye los campos con información. */
export type FilterValues = Record<string, FilterValue>;
