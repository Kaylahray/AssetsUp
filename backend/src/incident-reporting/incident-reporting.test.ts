// Test for Incident Reporting Module (no dependencies)
import {
  createIncidentHandler,
  listIncidentsHandler,
  resolveIncidentHandler
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

console.log('All incidents:', listIncidentsHandler());
console.log('Open incidents:', listIncidentsHandler('OPEN'));

// Resolve one incident
const resolved = resolveIncidentHandler(r2.id);
console.log('Resolved incident:', resolved);
console.log('All incidents after resolve:', listIncidentsHandler());
console.log('Resolved incidents:', listIncidentsHandler('RESOLVED'));

// Try to resolve already resolved
const resolveAgain = resolveIncidentHandler(r2.id);
console.log('Resolve already resolved (should be unchanged):', resolveAgain);
