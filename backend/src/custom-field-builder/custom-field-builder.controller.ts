// Mock controller for CustomFieldBuilder (no framework, just functions)
import { CustomFieldBuilderService } from './custom-field-builder.service';
import { CustomFieldType } from './custom-field.entity';

const service = new CustomFieldBuilderService();

// Simulate POST /custom-forms
export function createFormHandler(body: { name: string; fields: { name: string; type: CustomFieldType; options?: string[] }[] }) {
  return service.createForm(body.name, body.fields);
}

// Simulate GET /custom-forms/:id
export function getFormHandler(id: number) {
  return service.getForm(id);
}

// Simulate GET /custom-forms
export function listFormsHandler() {
  return service.listForms();
}

// Simulate PATCH /custom-forms/:id
export function updateFormHandler(id: number, name: string) {
  return service.updateForm(id, name);
}

// Simulate DELETE /custom-forms/:id
export function deleteFormHandler(id: number) {
  return service.deleteForm(id);
}

// Simulate POST /custom-forms/:formId/fields
export function addFieldHandler(formId: number, field: { name: string; type: CustomFieldType; options?: string[] }) {
  return service.addField(formId, field);
}

// Simulate PATCH /custom-forms/:formId/fields/:fieldId
export function updateFieldHandler(formId: number, fieldId: number, data: { name?: string; type?: CustomFieldType; options?: string[] }) {
  return service.updateField(formId, fieldId, data);
}

// Simulate DELETE /custom-forms/:formId/fields/:fieldId
export function deleteFieldHandler(formId: number, fieldId: number) {
  return service.deleteField(formId, fieldId);
}
