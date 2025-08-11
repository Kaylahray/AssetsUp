import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { CommunityVoteService } from "./providers/community-vote.service";
import { CreateVoteDto } from "./dto/create-vote.dto";
import { UpdateVoteDto } from "./dto/update-vote.dto";

@Controller("community-votes")
export class CommunityVoteController {
  constructor(private readonly voteService: CommunityVoteService) {}

  @Post()
  create(@Body() createVoteDto: CreateVoteDto) {
    return this.voteService.create(createVoteDto);
  }

  @Get()
  findAll() {
    return this.voteService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.voteService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateVoteDto: UpdateVoteDto) {
    return this.voteService.update(id, updateVoteDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.voteService.remove(id);
  }

  @Post(":id/vote")
  incrementVote(@Param("id") id: string) {
    return this.voteService.incrementVote(id);
  }
}
