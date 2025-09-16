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

  updateForm(id: number, name?: string): CustomForm | undefined {
    const form = this.getForm(id);
    if (form && name) {
      form.name = name;
    }
    return form;
  }

  deleteForm(id: number): boolean {
    const idx = this.forms.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.forms.splice(idx, 1);
      return true;
    }
    return false;
  }

  addField(formId: number, field: { name: string; type: CustomFieldType; options?: string[] }): CustomField | undefined {
    const form = this.getForm(formId);
    if (!form) return undefined;
    const newField = new CustomField(this.nextFieldId++, field.name, field.type, field.options);
    form.fields.push(newField);
    return newField;
  }

  updateField(formId: number, fieldId: number, data: { name?: string; type?: CustomFieldType; options?: string[] }): CustomField | undefined {
    const form = this.getForm(formId);
    if (!form) return undefined;
    const field = form.fields.find(f => f.id === fieldId);
    if (!field) return undefined;
    if (data.name) field.name = data.name;
    if (data.type) field.type = data.type;
    if (data.options) field.options = data.options;
    return field;
  }

  deleteField(formId: number, fieldId: number): boolean {
    const form = this.getForm(formId);
    if (!form) return false;
    const idx = form.fields.findIndex(f => f.id === fieldId);
    if (idx !== -1) {
      form.fields.splice(idx, 1);
      return true;
    }
    return false;
  }
}
