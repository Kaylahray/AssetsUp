
// Add comments
const c1 = addCommentHandler(r1.id, 'admin', 'Please provide more details.');
const c2 = addCommentHandler(r1.id, 'user1', 'Uploaded a clearer photo.');
console.log('Comments for r1:', listCommentsHandler(r1.id));

// Search by description
console.log('Search "damaged":', listIncidentsHandler({ search: 'damaged' }));
console.log('Search "unauthorized":', listIncidentsHandler({ search: 'unauthorized' }));
console.log('Search "notfound":', listIncidentsHandler({ search: 'notfound' }));

// Reopen a resolved incident
const reopened = reopenIncidentHandler(r2.id);
console.log('Reopened incident:', reopened);
console.log('All incidents after reopen:', listIncidentsHandler());
console.log('Open incidents after reopen:', listIncidentsHandler({ status: 'OPEN' }));
console.log('Resolved incidents after reopen:', listIncidentsHandler({ status: 'RESOLVED' }));
// Test for Incident Reporting Module (no dependencies)

import {
  createIncidentHandler,
  updateIncidentHandler,
  deleteIncidentHandler,
  listIncidentsHandler,
  resolveIncidentHandler,
  listReporterIdsHandler,
  listAssetRefsHandler,
  addCommentHandler,
  listCommentsHandler,
  reopenIncidentHandler
} from './incident-reporting.controller';







// Create incidents
const r1 = createIncidentHandler({
  reporterId: 'user1',
  assetRef: 'ASSET-001',
  description: 'Laptop was found damaged.',
  evidenceFile: 'photo1.jpg'
});
const r2 = createIncidentHandler({
  reporterId: 'user2',
  assetRef: 'ASSET-002',
  description: 'Asset lost during transfer.'
});
const r3 = createIncidentHandler({
  reporterId: 'user3',
  assetRef: 'ASSET-003',
  description: 'Unauthorized use detected.',
  evidenceFile: 'log.txt'
});
const r4 = createIncidentHandler({
  reporterId: 'user1',
  assetRef: 'ASSET-002',
  description: 'Asset 002 was found in the wrong location.'
});

// List all incidents
console.log('All incidents:', listIncidentsHandler());

// Update an incident
const updated = updateIncidentHandler(r1.id, { description: 'Laptop was found severely damaged.', evidenceFile: 'photo2.jpg' });
console.log('Updated incident:', updated);

// Delete an incident
const deleted = deleteIncidentHandler(r3.id);
console.log('Deleted incident result (should be true):', deleted);
console.log('All incidents after delete:', listIncidentsHandler());

// Filtering
console.log('Open incidents:', listIncidentsHandler({ status: 'OPEN' }));
console.log('Incidents for user1:', listIncidentsHandler({ reporterId: 'user1' }));
console.log('Incidents for ASSET-002:', listIncidentsHandler({ assetRef: 'ASSET-002' }));

// Date range filter
const now = new Date();
const future = new Date(now.getTime() + 1000 * 60 * 60 * 24); // +1 day
console.log('Incidents from now (should be empty):', listIncidentsHandler({ from: now }));
console.log('Incidents to now (should include all):', listIncidentsHandler({ to: now }));

// Resolve one incident
const resolved = resolveIncidentHandler(r2.id);
console.log('Resolved incident:', resolved);
console.log('All incidents after resolve:', listIncidentsHandler());
console.log('Resolved incidents:', listIncidentsHandler({ status: 'RESOLVED' }));

// Try to resolve already resolved
const resolveAgain = resolveIncidentHandler(r2.id);
console.log('Resolve already resolved (should be unchanged):', resolveAgain);

// Edge cases
console.log('Update non-existent incident:', updateIncidentHandler(9999, { description: 'Nope' }));
console.log('Delete non-existent incident:', deleteIncidentHandler(9999));

// List unique reporterIds and assetRefs
console.log('Unique reporterIds:', listReporterIdsHandler());
console.log('Unique assetRefs:', listAssetRefsHandler());
