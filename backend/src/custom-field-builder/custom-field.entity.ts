// Entity: CustomField
export type CustomFieldType = 'text' | 'dropdown' | 'number' | 'date';

export class CustomField {
  id: number;
  name: string;
  type: CustomFieldType;
  options?: string[];

  constructor(id: number, name: string, type: CustomFieldType, options?: string[]) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.options = options;
  }
}
