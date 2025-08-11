import { Test, TestingModule } from "@nestjs/testing";
import { CommunityVoteService } from "./community-vote.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CommunityVote } from "../entities/community-vote.entity";
import { Repository } from "typeorm";

describe("CommunityVoteService", () => {
  let service: CommunityVoteService;
  let repo: Repository<CommunityVote>;

  const mockVote: CommunityVote = {
    id: "test-id",
    title: "Test Feature",
    description: "A test description",
    votes: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockVote),
    save: jest.fn().mockResolvedValue(mockVote),
    find: jest.fn().mockResolvedValue([mockVote]),
    findOne: jest.fn().mockResolvedValue(mockVote),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityVoteService,
        {
          provide: getRepositoryToken(CommunityVote),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CommunityVoteService>(CommunityVoteService);
    repo = module.get<Repository<CommunityVote>>(
      getRepositoryToken(CommunityVote)
    );
  });

  it("should create a new vote", async () => {
    const dto = { title: "Test", description: "Desc" };
    const result = await service.create(dto);
    expect(result).toEqual(mockVote);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalled();
  });

  it("should return all votes", async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockVote]);
  });

  it("should find one vote", async () => {
    const result = await service.findOne("test-id");
    expect(result).toEqual(mockVote);
  });

  it("should increment votes", async () => {
    mockVote.votes = 1;
    const result = await service.incrementVote("test-id");
    expect(result.votes).toBe(1);
  });

  it("should delete a vote", async () => {
    await expect(service.remove("test-id")).resolves.not.toThrow();
  });
});
