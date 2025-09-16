// Test for Remote Deactivation Module (no dependencies)

import {
  createDeactivationRequestHandler,
  listDeactivationRequestsHandler,
  getAuditLogsHandler,
  getAllAuditLogsHandler,
  failDeactivationRequestHandler,
  cancelDeactivationRequestHandler
} from './remote-deactivation.controller';

// 1. Create a successful deactivation request
const req1 = createDeactivationRequestHandler({
  deviceId: 'LAPTOP-123',
  reason: 'Stolen',
  requesterId: 'admin1'
});
console.log('Created deactivation request (should be SUCCESS):', req1);
console.log('Audit logs for req1:', getAuditLogsHandler(req1.id));

// 2. Create a request and force failure
const req2 = createDeactivationRequestHandler({
  deviceId: 'PRINTER-456',
  reason: 'Retired',
  requesterId: 'admin2'
});
// Simulate failure (should not work since status is already SUCCESS)
const failResult = failDeactivationRequestHandler(req2.id);
console.log('Attempt to fail already-successful request (should be false):', failResult);

// 3. Create a pending request and cancel it
// To simulate a pending request, we need to temporarily patch the service logic (simulate a pending state)
const req3 = createDeactivationRequestHandler({
  deviceId: 'TABLET-789',
  reason: 'Lost',
  requesterId: 'admin3'
});
// Manually set to PENDING for test
req3.status = 'PENDING';
const cancelResult = cancelDeactivationRequestHandler(req3.id, 'admin4');
console.log('Cancel pending request (should be true):', cancelResult);
console.log('Audit logs for req3:', getAuditLogsHandler(req3.id));

// 4. Try to cancel a non-pending request
const cancelAgain = cancelDeactivationRequestHandler(req3.id, 'admin4');
console.log('Cancel already-cancelled request (should be false):', cancelAgain);

// 5. List requests by status
console.log('All requests:', listDeactivationRequestsHandler());
console.log('Only SUCCESS requests:', listDeactivationRequestsHandler('SUCCESS'));
console.log('Only FAILED requests:', listDeactivationRequestsHandler('FAILED'));

// 6. Edge case: fail/cancel with invalid ID
console.log('Fail non-existent request (should be false):', failDeactivationRequestHandler(9999));
console.log('Cancel non-existent request (should be false):', cancelDeactivationRequestHandler(9999, 'admin'));

// 7. All audit logs
console.log('All audit logs:', getAllAuditLogsHandler());
