import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommunityVote } from "../entities/community-vote.entity";
import { CreateVoteDto } from "../dto/create-vote.dto";
import { UpdateVoteDto } from "../dto/update-vote.dto";

@Injectable()
export class CommunityVoteService {
  constructor(
    @InjectRepository(CommunityVote)
    private readonly voteRepository: Repository<CommunityVote>
  ) {}

  async create(createVoteDto: CreateVoteDto): Promise<CommunityVote> {
    const newVote = this.voteRepository.create(createVoteDto);
    return this.voteRepository.save(newVote);
  }

  async findAll(): Promise<CommunityVote[]> {
    return this.voteRepository.find();
  }

  async findOne(id: string): Promise<CommunityVote> {
    const vote = await this.voteRepository.findOne({ where: { id } });
    if (!vote) throw new NotFoundException(`Vote with ID ${id} not found`);
    return vote;
  }

  async update(
    id: string,
    updateVoteDto: UpdateVoteDto
  ): Promise<CommunityVote> {
    const vote = await this.findOne(id);
    Object.assign(vote, updateVoteDto);
    return this.voteRepository.save(vote);
  }

  async remove(id: string): Promise<void> {
    const result = await this.voteRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Vote with ID ${id} not found`);
  }

  async incrementVote(id: string): Promise<CommunityVote> {
    const vote = await this.findOne(id);
    vote.votes += 1;
    return this.voteRepository.save(vote);
  }
}
