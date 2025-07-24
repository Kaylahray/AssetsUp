import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationUnitsService } from './organization-units.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizationUnit, OrganizationUnitType } from './entities/organization-unit.entity';
import { Repository } from 'typeorm';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('OrganizationUnitsService', () => {
  let service: OrganizationUnitsService;
  let repo: jest.Mocked<Repository<OrganizationUnit>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationUnitsService,
        { provide: getRepositoryToken(OrganizationUnit), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<OrganizationUnitsService>(OrganizationUnitsService);
    repo = module.get(getRepositoryToken(OrganizationUnit));
  });

  it('should create a unit', async () => {
    const dto = { name: 'Branch', type: OrganizationUnitType.BRANCH };
    const entity = { ...dto, id: '1' } as OrganizationUnit;
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    expect(await service.create(dto as any)).toEqual(entity);
    expect(repo.create).toBeCalledWith(dto);
    expect(repo.save).toBeCalledWith(entity);
  });

  it('should find all units', async () => {
    const units = [{ id: '1' } as OrganizationUnit];
    repo.find.mockResolvedValue(units);
    expect(await service.findAll()).toEqual(units);
  });

  it('should find one unit', async () => {
    const unit = { id: '1' } as OrganizationUnit;
    repo.findOne.mockResolvedValue(unit);
    expect(await service.findOne('1')).toEqual(unit);
  });

  it('should throw if unit not found', async () => {
    repo.findOne.mockResolvedValue(undefined);
    await expect(service.findOne('x')).rejects.toThrow();
  });

  it('should update a unit', async () => {
    const unit = { id: '1', name: 'A' } as OrganizationUnit;
    repo.findOne.mockResolvedValue(unit);
    repo.save.mockResolvedValue({ ...unit, name: 'B' });
    expect(await service.update('1', { name: 'B' })).toEqual({ ...unit, name: 'B' });
  });

  it('should remove a unit', async () => {
    const unit = { id: '1' } as OrganizationUnit;
    repo.findOne.mockResolvedValue(unit);
    repo.remove.mockResolvedValue(undefined);
    await service.remove('1');
    expect(repo.remove).toBeCalledWith(unit);
  });

  it('should build a tree', async () => {
    const units = [
      { id: '1', name: 'A', parentId: null } as any,
      { id: '2', name: 'B', parentId: '1' } as any,
      { id: '3', name: 'C', parentId: '2' } as any,
    ];
    repo.find.mockResolvedValue(units);
    const tree = await service.getTree();
    expect(tree.length).toBe(1);
    expect(tree[0].children[0].children[0].name).toBe('C');
  });
}); 