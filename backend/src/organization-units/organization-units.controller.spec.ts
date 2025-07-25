import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationUnitsController } from './organization-units.controller';
import { OrganizationUnitsService } from './organization-units.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getTree: jest.fn(),
});

describe('OrganizationUnitsController', () => {
  let controller: OrganizationUnitsController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationUnitsController],
      providers: [
        { provide: OrganizationUnitsService, useFactory: mockService },
      ],
    }).compile();
    controller = module.get<OrganizationUnitsController>(OrganizationUnitsController);
    service = module.get(OrganizationUnitsService);
  });

  it('should create a unit', async () => {
    service.create.mockResolvedValue({ id: '1' });
    expect(await controller.create({ name: 'A', type: 'branch' } as any)).toEqual({ id: '1' });
  });

  it('should return all units', async () => {
    service.findAll.mockResolvedValue([{ id: '1' }]);
    expect(await controller.findAll()).toEqual([{ id: '1' }]);
  });

  it('should return a unit by id', async () => {
    service.findOne.mockResolvedValue({ id: '1' });
    expect(await controller.findOne('1')).toEqual({ id: '1' });
  });

  it('should update a unit', async () => {
    service.update.mockResolvedValue({ id: '1', name: 'B' });
    expect(await controller.update('1', { name: 'B' })).toEqual({ id: '1', name: 'B' });
  });

  it('should remove a unit', async () => {
    service.remove.mockResolvedValue(undefined);
    expect(await controller.remove('1')).toBeUndefined();
  });

  it('should return tree', async () => {
    service.getTree.mockResolvedValue([{ id: '1', children: [] }]);
    expect(await controller.getTree()).toEqual([{ id: '1', children: [] }]);
  });
}); 