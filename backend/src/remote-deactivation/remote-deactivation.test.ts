// Test for Remote Deactivation Module (no dependencies)
import {
  createDeactivationRequestHandler,
  listDeactivationRequestsHandler,
  getAuditLogsHandler,
  getAllAuditLogsHandler
} from './remote-deactivation.controller';

// Create a deactivation request
const req = createDeactivationRequestHandler({
  deviceId: 'LAPTOP-123',
  reason: 'Stolen',
  requesterId: 'admin1'
});
console.log('Created deactivation request:', req);

// List all requests
console.log('All deactivation requests:', listDeactivationRequestsHandler());

// Get audit logs for the request
console.log('Audit logs for request:', getAuditLogsHandler(req.id));

// Create another request
const req2 = createDeactivationRequestHandler({
  deviceId: 'PRINTER-456',
  reason: 'Retired',
  requesterId: 'admin2'
});

// List all audit logs
console.log('All audit logs:', getAllAuditLogsHandler());
