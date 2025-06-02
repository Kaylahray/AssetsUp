import { Injectable } from "@nestjs/common"
import type { Repository, SelectQueryBuilder } from "typeorm"
import type { Branch } from "../entities/branch.entity"
import type { BranchQueryDto } from "../dto/branch-query.dto"

@Injectable()
export class BranchRepository {
  constructor(private readonly repository: Repository<Branch>) {}

  async findWithFilters(query: BranchQueryDto) {
    const queryBuilder = this.createFilteredQuery(query)

    const { page, limit } = query
    queryBuilder.skip((page - 1) * limit).take(limit)

    return await queryBuilder.getManyAndCount()
  }

  async findNearby(latitude: number, longitude: number, radiusKm = 50): Promise<Branch[]> {
    return await this.repository
      .createQueryBuilder("branch")
      .where("branch.latitude IS NOT NULL AND branch.longitude IS NOT NULL")
      .andWhere("branch.isActive = true")
      .andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(branch.latitude)) * cos(radians(branch.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(branch.latitude)))) <= :radius`,
        { lat: latitude, lng: longitude, radius: radiusKm },
      )
      .orderBy(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(branch.latitude)) * cos(radians(branch.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(branch.latitude))))`,
        "ASC",
      )
      .setParameters({ lat: latitude, lng: longitude })
      .getMany()
  }

  async findByManager(managerId: string): Promise<Branch[]> {
    return await this.repository.find({
      where: { managerId, isActive: true },
      relations: ["assets", "inventories"],
    })
  }

  async findActiveByRegion(country: string, state?: string): Promise<Branch[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("branch")
      .where("branch.country = :country", { country })
      .andWhere("branch.isActive = true")

    if (state) {
      queryBuilder.andWhere("branch.state = :state", { state })
    }

    return await queryBuilder.orderBy("branch.name", "ASC").getMany()
  }

  private createFilteredQuery(query: BranchQueryDto): SelectQueryBuilder<Branch> {
    const { search, city, state, country, isActive, sortBy, sortOrder } = query

    const queryBuilder = this.repository.createQueryBuilder("branch")

    if (search) {
      queryBuilder.andWhere("(branch.name ILIKE :search OR branch.branchCode ILIKE :search)", { search: `%${search}%` })
    }

    if (city) {
      queryBuilder.andWhere("branch.city ILIKE :city", { city: `%${city}%` })
    }

    if (state) {
      queryBuilder.andWhere("branch.state ILIKE :state", { state: `%${state}%` })
    }

    if (country) {
      queryBuilder.andWhere("branch.country ILIKE :country", { country: `%${country}%` })
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere("branch.isActive = :isActive", { isActive })
    }

    queryBuilder.orderBy(`branch.${sortBy}`, sortOrder)

    return queryBuilder
  }
}
