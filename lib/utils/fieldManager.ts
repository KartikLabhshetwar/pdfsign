export type FieldType = "signature" | "text" | "date";

export interface Field {
  id: string;
  type: FieldType;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
}

export function createField(
  type: FieldType,
  page: number,
  x: number,
  y: number,
  width: number = 200,
  height: number = 50
): Field {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    page,
    x,
    y,
    width,
    height,
  };
}

export function updateFieldValue(field: Field, value: string): Field {
  return { ...field, value };
}

export function getFieldsForPage(fields: Field[], page: number): Field[] {
  return fields.filter((field) => field.page === page);
}

export function deleteField(fields: Field[], fieldId: string): Field[] {
  return fields.filter((field) => field.id !== fieldId);
}
