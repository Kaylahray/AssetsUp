import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from '../entities/tag.entity';
import { TaggedResource } from '../entities/tagged-resource.entity';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { AssignTagDto } from '../dto/assign-tag.dto';
import { BulkAssignTagsDto } from '../dto/bulk-assign-tags.dto';

describe('TagService', () => {
  let service: TagService;
  let tagRepository: Repository<Tag>;
  let taggedResourceRepository: Repository<TaggedResource>;

  const mockTagRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTaggedResourceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockTagRepository,
        },
        {
          provide: getRepositoryToken(TaggedResource),
          useValue: mockTaggedResourceRepository,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    tagRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag));
    taggedResourceRepository = module.get<Repository<TaggedResource>>(
      getRepositoryToken(TaggedResource),
    );

    // Reset mocks
    jest.clearAllMocks();
    mockTagRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  describe('createTag', () => {
    it('should create a tag successfully', async () => {
      const createTagDto: CreateTagDto = {
        name: 'Important',
        description: 'High priority items',
        colorHex: '#FF0000',
      };
      const userId = 'user-1';
      const expectedTag = { id: 'tag-1', ...createTagDto, createdBy: userId };

      mockTagRepository.findOne.mockResolvedValue(null);
      mockTagRepository.create.mockReturnValue(expectedTag);
      mockTagRepository.save.mockResolvedValue(expectedTag);

      const result = await service.createTag(createTagDto, userId);

      expect(mockTagRepository.findOne).toHaveBeenCalledWith({
        where: { name: createTagDto.name, createdBy: userId },
      });
      expect(mockTagRepository.create).toHaveBeenCalledWith({
        ...createTagDto,
        createdBy: userId,
      });
      expect(result).toEqual(expectedTag);
    });

    it('should throw ConflictException for duplicate tag name', async () => {
      const createTagDto: CreateTagDto = { name: 'Important' };
      const userId = 'user-1';
      const existingTag = { id: 'tag-1', name: 'Important', createdBy: userId };

      mockTagRepository.findOne.mockResolvedValue(existingTag);

      await expect(service.createTag(createTagDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllByUser', () => {
    it('should return tags for user', async () => {
      const userId = 'user-1';
      const tags = [{ id: 'tag-1', name: 'Important', createdBy: userId }];

      mockQueryBuilder.getMany.mockResolvedValue(tags);

      const result = await service.findAllByUser(userId);

      expect(mockTagRepository.createQueryBuilder).toHaveBeenCalledWith('tag');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tag.createdBy = :userId',
        { userId },
      );
      expect(result).toEqual(tags);
    });

    it('should filter by resource when provided', async () => {
      const userId = 'user-1';
      const queryDto = { resourceId: 'resource-1', resourceType: 'document' };
      const tags = [{ id: 'tag-1', name: 'Important', createdBy: userId }];

      mockQueryBuilder.getMany.mockResolvedValue(tags);

      await service.findAllByUser(userId, queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'taggedResource.resourceId = :resourceId',
        { resourceId: queryDto.resourceId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'taggedResource.resourceType = :resourceType',
        { resourceType: queryDto.resourceType },
      );
    });
  });

  describe('assignTag', () => {
    it('should assign tag to resource successfully', async () => {
      const tagId = 'tag-1';
      const assignTagDto: AssignTagDto = {
        resourceId: 'resource-1',
        resourceType: 'document',
      };
      const userId = 'user-1';
      const tag = { id: tagId, name: 'Important', createdBy: userId };
      const taggedResource = { id: 'tr-1', tagId, ...assignTagDto };

      mockTagRepository.findOne.mockResolvedValue(tag);
      mockTaggedResourceRepository.findOne.mockResolvedValue(null);
      mockTaggedResourceRepository.create.mockReturnValue(taggedResource);
      mockTaggedResourceRepository.save.mockResolvedValue(taggedResource);

      const result = await service.assignTag(tagId, assignTagDto, userId);

      expect(mockTaggedResourceRepository.findOne).toHaveBeenCalledWith({
        where: {
          tagId,
          resourceId: assignTagDto.resourceId,
          resourceType: assignTagDto.resourceType,
        },
      });
      expect(result).toEqual(taggedResource);
    });

    it('should throw ConflictException if already tagged', async () => {
      const tagId = 'tag-1';
      const assignTagDto: AssignTagDto = {
        resourceId: 'resource-1',
        resourceType: 'document',
      };
      const userId = 'user-1';
      const tag = { id: tagId, name: 'Important', createdBy: userId };
      const existingTaggedResource = { id: 'tr-1', tagId, ...assignTagDto };

      mockTagRepository.findOne.mockResolvedValue(tag);
      mockTaggedResourceRepository.findOne.mockResolvedValue(existingTaggedResource);

      await expect(service.assignTag(tagId, assignTagDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('bulkAssignTags', () => {
    it('should bulk assign tags successfully', async () => {
      const bulkAssignDto: BulkAssignTagsDto = {
        resourceIds: ['resource-1', 'resource-2'],
        resourceType: 'document',
        tagIds: ['tag-1', 'tag-2'],
      };
      const userId = 'user-1';
      const tags = [
        { id: 'tag-1', name: 'Important', createdBy: userId },
        { id: 'tag-2', name: 'Urgent', createdBy: userId },
      ];

      mockTagRepository.find.mockResolvedValue(tags);
      mockTaggedResourceRepository.find.mockResolvedValue([]);
      mockTaggedResourceRepository.create.mockReturnValue([]);
      mockTaggedResourceRepository.save.mockResolvedValue([]);

      const result = await service.bulkAssignTags(bulkAssignDto, userId);

      expect(mockTagRepository.find).toHaveBeenCalledWith({
        where: { id: expect.any(Object), createdBy: userId },
      });
    });

    it('should throw BadRequestException if tags not found', async () => {
      const bulkAssignDto: BulkAssignTagsDto = {
        resourceIds: ['resource-1'],
        resourceType: 'document',
        tagIds: ['tag-1', 'tag-2'],
      };
      const userId = 'user-1';

      mockTagRepository.find.mockResolvedValue([{ id: 'tag-1' }]); // Only one tag found

      await expect(service.bulkAssignTags(bulkAssignDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('unassignTag', () => {
    it('should unassign tag successfully', async () => {
      const tagId = 'tag-1';
      const resourceId = 'resource-1';
      const resourceType = 'document';
      const userId = 'user-1';
      const tag = { id: tagId, name: 'Important', createdBy: userId };
      const taggedResource = { id: 'tr-1', tagId, resourceId, resourceType };

      mockTagRepository.findOne.mockResolvedValue(tag);
      mockTaggedResourceRepository.findOne.mockResolvedValue(taggedResource);
      mockTaggedResourceRepository.remove.mockResolvedValue(taggedResource);

      await service.unassignTag(tagId, resourceId, resourceType, userId);

      expect(mockTaggedResourceRepository.remove).toHaveBeenCalledWith(taggedResource);
    });

    it('should throw NotFoundException if tag assignment not found', async () => {
      const tagId = 'tag-1';
      const resourceId = 'resource-1';
      const resourceType = 'document';
      const userId = 'user-1';
      const tag = { id: tagId, name: 'Important', createdBy: userId };

      mockTagRepository.findOne.mockResolvedValue(tag);
      mockTaggedResourceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.unassignTag(tagId, resourceId, resourceType, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  
