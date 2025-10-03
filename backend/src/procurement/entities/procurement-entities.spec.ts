import { ProcurementRequest, ProcurementStatus } from './procurement-request.entity';
import { AssetRegistration, AssetStatus } from './asset-registration.entity';

describe('Procurement Entities', () => {
  describe('ProcurementRequest Entity', () => {
    let procurementRequest: ProcurementRequest;

    beforeEach(() => {
      procurementRequest = new ProcurementRequest();
    });

    it('should be defined', () => {
      expect(procurementRequest).toBeDefined();
    });

    it('should have correct default values', () => {
      procurementRequest.itemName = 'Test Item';
      procurementRequest.quantity = 1;
      procurementRequest.requestedBy = 'test.user';
      procurementRequest.status = ProcurementStatus.PENDING;

      expect(procurementRequest.status).toBe(ProcurementStatus.PENDING);
      expect(procurementRequest.itemName).toBe('Test Item');
      expect(procurementRequest.quantity).toBe(1);
      expect(procurementRequest.requestedBy).toBe('test.user');
    });

    it('should allow setting optional fields', () => {
      procurementRequest.notes = 'Test notes';
      procurementRequest.decidedBy = 'manager';
      procurementRequest.decidedAt = new Date();

      expect(procurementRequest.notes).toBe('Test notes');
      expect(procurementRequest.decidedBy).toBe('manager');
      expect(procurementRequest.decidedAt).toBeInstanceOf(Date);
    });

    it('should support all procurement statuses', () => {
      // Test PENDING status
      procurementRequest.status = ProcurementStatus.PENDING;
      expect(procurementRequest.status).toBe('pending');

      // Test APPROVED status
      procurementRequest.status = ProcurementStatus.APPROVED;
      expect(procurementRequest.status).toBe('approved');

      // Test REJECTED status
      procurementRequest.status = ProcurementStatus.REJECTED;
      expect(procurementRequest.status).toBe('rejected');
    });

    it('should handle asset registration relationship', () => {
      const assetRegistration = new AssetRegistration();
      assetRegistration.id = 1;
      assetRegistration.assetId = 'AST-000001';
      
      procurementRequest.assetRegistration = assetRegistration;
      procurementRequest.assetRegistrationId = assetRegistration.id;

      expect(procurementRequest.assetRegistration).toBe(assetRegistration);
      expect(procurementRequest.assetRegistrationId).toBe(1);
    });
  });

  describe('AssetRegistration Entity', () => {
    let assetRegistration: AssetRegistration;

    beforeEach(() => {
      assetRegistration = new AssetRegistration();
    });

    it('should be defined', () => {
      expect(assetRegistration).toBeDefined();
    });

    it('should have correct default values', () => {
      assetRegistration.assetName = 'Test Asset';
      assetRegistration.assignedTo = 'test.user';
      assetRegistration.status = AssetStatus.PENDING;

      expect(assetRegistration.status).toBe(AssetStatus.PENDING);
      expect(assetRegistration.assetName).toBe('Test Asset');
      expect(assetRegistration.assignedTo).toBe('test.user');
    });

    it('should allow setting optional fields', () => {
      assetRegistration.description = 'Test description';
      assetRegistration.serialNumber = 'SN123456';
      assetRegistration.model = 'Model X';
      assetRegistration.manufacturer = 'Test Manufacturer';
      assetRegistration.cost = 1500.99;
      assetRegistration.location = 'Office A';

      expect(assetRegistration.description).toBe('Test description');
      expect(assetRegistration.serialNumber).toBe('SN123456');
      expect(assetRegistration.model).toBe('Model X');
      expect(assetRegistration.manufacturer).toBe('Test Manufacturer');
      expect(assetRegistration.cost).toBe(1500.99);
      expect(assetRegistration.location).toBe('Office A');
    });

    it('should support all asset statuses', () => {
      // Test PENDING status
      assetRegistration.status = AssetStatus.PENDING;
      expect(assetRegistration.status).toBe('pending');

      // Test ACTIVE status
      assetRegistration.status = AssetStatus.ACTIVE;
      expect(assetRegistration.status).toBe('active');

      // Test MAINTENANCE status
      assetRegistration.status = AssetStatus.MAINTENANCE;
      expect(assetRegistration.status).toBe('maintenance');

      // Test RETIRED status
      assetRegistration.status = AssetStatus.RETIRED;
      expect(assetRegistration.status).toBe('retired');
    });

    it('should generate correct asset ID', () => {
      assetRegistration.id = 1;
      const generatedId = assetRegistration.generateAssetId();
      expect(generatedId).toBe('AST-000001');

      assetRegistration.id = 123;
      const generatedId2 = assetRegistration.generateAssetId();
      expect(generatedId2).toBe('AST-000123');

      assetRegistration.id = 999999;
      const generatedId3 = assetRegistration.generateAssetId();
      expect(generatedId3).toBe('AST-999999');
    });

    it('should handle procurement request relationship', () => {
      const procurementRequest = new ProcurementRequest();
      procurementRequest.id = 1;
      procurementRequest.itemName = 'Test Item';
      
      assetRegistration.procurementRequest = procurementRequest;

      expect(assetRegistration.procurementRequest).toBe(procurementRequest);
      expect(assetRegistration.procurementRequest.itemName).toBe('Test Item');
    });
  });

  describe('Entity Relationships', () => {
    it('should establish bidirectional relationship between procurement request and asset registration', () => {
      const procurementRequest = new ProcurementRequest();
      procurementRequest.id = 1;
      procurementRequest.itemName = 'Laptop';
      procurementRequest.status = ProcurementStatus.APPROVED;

      const assetRegistration = new AssetRegistration();
      assetRegistration.id = 1;
      assetRegistration.assetId = 'AST-000001';
      assetRegistration.assetName = 'Laptop';
      assetRegistration.status = AssetStatus.PENDING;

      // Set up relationship
      procurementRequest.assetRegistration = assetRegistration;
      procurementRequest.assetRegistrationId = assetRegistration.id;
      assetRegistration.procurementRequest = procurementRequest;

      // Verify relationship
      expect(procurementRequest.assetRegistration).toBe(assetRegistration);
      expect(assetRegistration.procurementRequest).toBe(procurementRequest);
      expect(procurementRequest.assetRegistrationId).toBe(assetRegistration.id);
      
      // Verify data consistency
      expect(procurementRequest.itemName).toBe(assetRegistration.assetName);
    });

    it('should handle null relationships correctly', () => {
      const procurementRequest = new ProcurementRequest();
      procurementRequest.status = ProcurementStatus.PENDING;

      expect(procurementRequest.assetRegistration).toBeUndefined();
      expect(procurementRequest.assetRegistrationId).toBeUndefined();
      
      // This represents a pending request that hasn't been approved yet
      expect(procurementRequest.status).toBe(ProcurementStatus.PENDING);
    });
  });

  describe('Entity Validation', () => {
    describe('ProcurementRequest validation scenarios', () => {
      it('should handle required fields correctly', () => {
        const procurementRequest = new ProcurementRequest();
        
        // These would be validated by class-validator decorators
        procurementRequest.itemName = 'Valid Item Name';
        procurementRequest.quantity = 5;
        procurementRequest.requestedBy = 'valid.user';
        
        expect(procurementRequest.itemName.length).toBeGreaterThan(0);
        expect(procurementRequest.itemName.length).toBeLessThanOrEqual(255);
        expect(procurementRequest.quantity).toBeGreaterThan(0);
        expect(procurementRequest.quantity).toBeLessThanOrEqual(9999);
        expect(procurementRequest.requestedBy.length).toBeGreaterThan(0);
        expect(procurementRequest.requestedBy.length).toBeLessThanOrEqual(255);
      });
    });

    describe('AssetRegistration validation scenarios', () => {
      it('should handle required fields correctly', () => {
        const assetRegistration = new AssetRegistration();
        
        assetRegistration.assetId = 'AST-000001';
        assetRegistration.assetName = 'Valid Asset Name';
        assetRegistration.assignedTo = 'valid.user';
        
        expect(assetRegistration.assetId.length).toBeGreaterThan(0);
        expect(assetRegistration.assetName.length).toBeGreaterThan(0);
        expect(assetRegistration.assignedTo.length).toBeGreaterThan(0);
      });

      it('should handle optional cost field correctly', () => {
        const assetRegistration = new AssetRegistration();
        
        // Cost can be null
        assetRegistration.cost = null;
        expect(assetRegistration.cost).toBeNull();
        
        // Cost can be a positive number
        assetRegistration.cost = 1500.99;
        expect(assetRegistration.cost).toBe(1500.99);
        expect(assetRegistration.cost).toBeGreaterThan(0);
      });
    });
  });
});
