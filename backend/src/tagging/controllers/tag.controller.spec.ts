import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from '../services/tag.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { AssignTagDto } from '../dto/assign-tag.dto';
import { BulkAssignTagsDto } from '../dto/bulk-assign-tags.dto';
import { QueryTagsDto } from '../dto/query-tags.dto';

describe('TagController', () => {
  let controller: TagController;
  let service: TagService;

  const mockTagService = {
    createTag: jest.fn(),
    findAllByUser: jest.fn(),
    findTagsByResource: jest.fn(),
    findOne: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn(),
    assignTag: jest.fn(),
    unassignTag: jest.fn(),
    bulkAssignTags: jest.fn(),
    getResourcesByTag: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user-1' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: mockTagService,
        },
      ],
    }).compile();

    controller = module.get<TagController>(TagController);
    service = module.get<TagService>(TagService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a tag', async () => {
      const createTagDto: CreateTagDto = {
        name: 'Important',
        description: 'High priority items',
        colorHex: '#FF0000',
      };
      const expectedTag = { id: 'tag-1', ...createTagDto, createdBy: 'user-1' };

      mockTagService.createTag.mockResolvedValue(expectedTag);

      const result = await controller.create(createTagDto, mockRequest);

      expect(mockTagService.createTag).toHaveBeenCalledWith(createTagDto, 'user-1');
      expect(result).toEqual(expectedTag);
    });
  });

  describe('findAll', () => {
    it('should return all tags for user', async () => {
      const queryDto: QueryTagsDto = { search: 'important' };
      const expectedTags = [{ id: 'tag-1', name: 'Important', createdBy: 'user-1' }];

      mockTagService.findAllByUser.mockResolvedValue(expectedTags);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(mockTagService.findAllByUser).toHaveBeenCalledWith('user-1', queryDto);
      expect(result).toEqual(expectedTags);
    });
  });

  describe('findByResource', () => {
    it('should return tags for a resource', async () => {
      const resourceId = 'resource-1';
      const resourceType = 'document';
      const expectedTags = [{ id: 'tag-1', name: 'Important' }];

      mockTagService.findTagsByResource.mockResolvedValue(expectedTags);

      const result = await controller.findByResource(
        resourceId,
        resourceType,
        mockRequest,
      );

      expect(mockTagService.findTagsByResource).toHaveBeenCalledWith(
        resourceId,
        resourceType,
        'user-1',
      );
      expect(result).toEqual(expectedTags);
    });
  });

  describe('findOne', () => {
    it('should return a specific tag', async () => {
      const tagId = 'tag-1';
      const expectedTag = { id: tagId, name: 'Important', createdBy: 'user-1' };

      mockTagService.findOne.mockResolvedValue(expectedTag);

      const result = await controller.findOne(tagId, mockRequest);

      expect(mockTagService.findOne).toHaveBeenCalledWith(tagId, 'user-1');
      expect(result).toEqual(expectedTag);
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const tagId = 'tag-1';
      const updateTagDto: UpdateTagDto = { name: 'Updated Important' };
      const expectedTag = { id: tagId, name: 'Updated Important', createdBy: 'user-1' };

      mockTagService.updateTag.mockResolvedValue(expectedTag);

      const result = await controller.update(tagId, updateTagDto, mockRequest);

      expect(mockTagService.updateTag).toHaveBeenCalledWith(
        tagId,
        updateTagDto,
        'user-1',
      );
      expect(result).toEqual(expectedTag);
    });
  });

  describe('remove', () => {
    it('should delete a tag', async () => {
      const tagId = 'tag-1';

      mockTagService.deleteTag.mockResolvedValue(undefined);

      await controller.remove(tagId, mockRequest);

      expect(mockTagService.deleteTag).toHaveBeenCalledWith(tagId, 'user-1');
    });
  });

  describe('assignTag', () => {
    it('should assign a tag to a resource', async () => {
      const tagId = 'tag-1';
      const assignTagDto: AssignTagDto = {
        resourceId: 'resource-1',
        resourceType: 'document',
      };
      const expectedTaggedResource = { id: 'tr-1', tagId, ...assignTagDto };

      mockTagService.assignTag.mockResolvedValue(expectedTaggedResource);

      const result = await controller.assignTag(tagId, assignTagDto, mockRequest);

      expect(mockTagService.assignTag).toHaveBeenCalledWith(
        tagId,
        assignTagDto,
        'user-1',
      );
      expect(result).toEqual(expectedTaggedResource);
    });
  });

  describe('unassignTag', () => {
    it('should unassign a tag from a resource', async () => {
      const tagId = 'tag-1';
      const resourceId = 'resource-1';
      const resourceType = 'document';

      mockTagService.unassignTag.mockResolvedValue(undefined);

      await controller.unassignTag(tagId, resourceId, resourceType, mockRequest);

      expect(mockTagService.unassignTag).toHaveBeenCalledWith(
        tagId,
        resourceId,
        resourceType,
        'user-1',
      );
    });
  });

  describe('bulkAssignTags', () => {
    it('should bulk assign tags to resources', async () => {
      const bulkAssignDto: BulkAssignTagsDto = {
        resourceIds: ['resource-1', 'resource-2'],
        resourceType: 'document',
        tagIds: ['tag-1', 'tag-2'],
      };
      const expectedTaggedResources = [
        { id: 'tr-1', tagId: 'tag-1', resourceId: 'resource-1', resourceType: 'document' },
        { id: 'tr-2', tagId: 'tag-2', resourceId: 'resource-1', resourceType: 'document' },
      ];

      mockTagService.bulkAssignTags.mockResolvedValue(expectedTaggedResources);

      const result = await controller.bulkAssignTags(bulkAssignDto, mockRequest);

      expect(mockTagService.bulkAssignTags).toHaveBeenCalledWith(
        bulkAssignDto,
        'user-1',
      );
      expect(result).toEqual(expectedTaggedResources);
    });
  });

  describe('getResourcesByTag', () => {
    it('should return resources tagged with a specific tag', async () => {
      const tagId = 'tag-1';
      const expectedResources = [
        { id: 'tr-1', tagId, resourceId: 'resource-1', resourceType: 'document' },
      ];

      mockTagService.getResourcesByTag.mockResolvedValue(expectedResources);

      const result = await controller.getResourcesByTag(tagId, mockRequest);

      expect(mockTagService.getResourcesByTag).toHaveBeenCalledWith(tagId, 'user-1');
      expect(result).toEqual(expectedResources);
    });
  });
});
