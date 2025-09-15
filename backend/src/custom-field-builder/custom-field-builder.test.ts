// Simple test for Custom Field Builder Module (no dependencies)

import {
  createFormHandler,
  listFormsHandler,
  getFormHandler,
  updateFormHandler,
  deleteFormHandler,
  addFieldHandler,
  updateFieldHandler,
  deleteFieldHandler
} from './custom-field-builder.controller';

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

// Update form name
const updatedForm = updateFormHandler(form.id, 'Updated Asset Registration');
console.log('Updated form name:', updatedForm);

// Add a new field
const newField = addFieldHandler(form.id, { name: 'Warranty', type: 'text' });
console.log('Added field:', newField);

// Update a field
const updatedField = updateFieldHandler(form.id, newField.id, { name: 'Warranty Period', type: 'number' });
console.log('Updated field:', updatedField);

// Delete a field
const deleteFieldResult = deleteFieldHandler(form.id, newField.id);
console.log('Deleted field result:', deleteFieldResult);

// Try to update a non-existent field
const updateNonExistent = updateFieldHandler(form.id, 9999, { name: 'Should Not Exist' });
console.log('Update non-existent field:', updateNonExistent);

// Delete the form
const deleteFormResult = deleteFormHandler(form.id);
console.log('Deleted form result:', deleteFormResult);

// Try to get deleted form
const getDeleted = getFormHandler(form.id);
console.log('Get deleted form:', getDeleted);
