// Simple test for Custom Field Builder Module (no dependencies)
import { createFormHandler, listFormsHandler, getFormHandler } from './custom-field-builder.controller';

// Create a mock form
const form = createFormHandler({
  name: 'Asset Registration',
  fields: [
    { name: 'Serial Number', type: 'text' },
    { name: 'Category', type: 'dropdown', options: ['Laptop', 'Printer', 'Monitor'] },
    { name: 'Purchase Date', type: 'date' },
  ],
});
console.log('Created form:', form);

// List all forms
console.log('All forms:', listFormsHandler());

// Get form by ID
console.log('Get form by ID:', getFormHandler(form.id));
