import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommunityVote } from "./entities/community-vote.entity";
import { CommunityVoteService } from "./providers/community-vote.service";
import { CommunityVoteController } from "./community-vote.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CommunityVote])],
  controllers: [CommunityVoteController],
  providers: [CommunityVoteService],
})
export class CommunityVoteModule {}
