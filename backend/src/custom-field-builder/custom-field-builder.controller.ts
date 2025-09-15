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

// Example usage (mock test):
if (require.main === module) {
  // Create a form
  const form = createFormHandler({
    name: 'Asset Registration',
    fields: [
      { name: 'Serial Number', type: 'text' },
      { name: 'Category', type: 'dropdown', options: ['Laptop', 'Printer', 'Monitor'] },
      { name: 'Purchase Date', type: 'date' },
    ],
  });
  console.log('Created form:', form);

  // List forms
  console.log('All forms:', listFormsHandler());

  // Get form by ID
  console.log('Get form by ID:', getFormHandler(form.id));
}
