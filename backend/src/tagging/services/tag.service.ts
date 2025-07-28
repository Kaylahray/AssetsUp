import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { TaggedResource } from '../entities/tagged-resource.entity';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { AssignTagDto } from '../dto/assign-tag.dto';
import { BulkAssignTagsDto } from '../dto/bulk-assign-tags.dto';
import { QueryTagsDto } from '../dto/query-tags.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(TaggedResource)
    private taggedResourceRepository: Repository<TaggedResource>,
  ) {}

  async createTag(createTagDto: CreateTagDto, userId: string): Promise<Tag> {
    // Check for duplicate tag name for this user
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name, createdBy: userId },
    });

  describe('updateTag', () => {
    it('should update tag successfully', async () => {
      const tagId = 'tag-1';
      const updateTagDto: UpdateTagDto = {
        name: 'Updated Important',
        colorHex: '#00FF00',
      };
      const userId = 'user-1';
      const existingTag = {
        id: tagId,
        name: 'Important',
        colorHex: '#FF0000',
        createdBy: userId,
      };
      const updatedTag = { ...existingTag, ...updateTagDto };

      mockTagRepository.findOne
        .mockResolvedValueOnce(existingTag) // For findOne call
        .mockResolvedValueOnce(null); // For duplicate check
      mockTagRepository.save.mockResolvedValue(updatedTag);

      const result = await service.updateTag(tagId, updateTagDto, userId);

      expect(mockTagRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateTagDto),
      );
      expect(result).toEqual(updatedTag);
    });

    it('should throw ConflictException for duplicate name during update', async () => {
      const tagId = 'tag-1';
      const updateTagDto: UpdateTagDto = { name: 'Existing Tag' };
      const userId = 'user-1';
      const existingTag = { id: tagId, name: 'Important', createdBy: userId };
      const duplicateTag = { id: 'tag-2', name: 'Existing Tag', createdBy: userId };

      mockTagRepository.findOne
        .mockResolvedValueOnce(existingTag) // For findOne call
        .mockResolvedValueOnce(duplicateTag); // For duplicate check

      await expect(service.updateTag(tagId, updateTagDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('deleteTag', () => {
    it('should delete tag successfully', async () => {
      const tagId = 'tag-1';
      const userId = 'user-1';
      const tag = { id: tagId, name: 'Important', createdBy: userId };

      mockTagRepository.findOne.mockResolvedValue(tag);
      mockTagRepository.remove.mockResolvedValue(tag);

      await service.deleteTag(tagId, userId);

      expect(mockTagRepository.remove).toHaveBeenCalledWith(tag);
    });
  });

  describe('findOne', () => {
    it('should return tag if found', async () => {
      const tagId = 'tag-1';
      const userId = 'user-1';
      const tag = { id: tagId, name: 'Important', createdBy: userId };

      mockTagRepository.findOne.mockResolvedValue(tag);

      const result = await service.findOne(tagId, userId);

      expect(mockTagRepository.findOne).toHaveBeenCalledWith({
        where: { id: tagId, createdBy: userId },
        relations: ['taggedResources'],
      });
      expect(result).toEqual(tag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      const tagId = 'tag-1';
      const userId = 'user-1';

      mockTagRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(tagId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
