// Entity: CustomForm
import { CustomField } from './custom-field.entity';

export class CustomForm {
  id: number;
  name: string;
  fields: CustomField[];

  constructor(id: number, name: string, fields: CustomField[]) {
    this.id = id;
    this.name = name;
    this.fields = fields;
  }
}
