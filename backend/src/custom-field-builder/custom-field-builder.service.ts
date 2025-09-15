// In-memory service for CustomField and CustomForm
import { CustomField, CustomFieldType } from './custom-field.entity';
import { CustomForm } from './custom-form.entity';

export class CustomFieldBuilderService {
  private forms: CustomForm[] = [];
  private nextFormId = 1;
  private nextFieldId = 1;

  createForm(name: string, fields: { name: string; type: CustomFieldType; options?: string[] }[]): CustomForm {
    const customFields = fields.map(f => new CustomField(this.nextFieldId++, f.name, f.type, f.options));
    const form = new CustomForm(this.nextFormId++, name, customFields);
    this.forms.push(form);
    return form;
  }

  getForm(id: number): CustomForm | undefined {
    return this.forms.find(f => f.id === id);
  }

  listForms(): CustomForm[] {
    return this.forms;
  }
}
