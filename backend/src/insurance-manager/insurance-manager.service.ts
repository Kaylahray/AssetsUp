import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insurance } from './entities/insurance.entity';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';

@Injectable()
export class InsuranceManagerService {
  constructor(
    @InjectRepository(Insurance)
    private readonly insuranceRepository: Repository<Insurance>,
  ) {}

  async create(createInsuranceDto: CreateInsuranceDto): Promise<Insurance> {
    const insurance = this.insuranceRepository.create(createInsuranceDto);
    const saved = await this.insuranceRepository.save(insurance);
    this.mockCoverageExpiryAlert(saved);
    return saved;
  }

  async findAll(): Promise<Insurance[]> {
    return this.insuranceRepository.find();
  }

  async findOne(id: number): Promise<Insurance> {
    const insurance = await this.insuranceRepository.findOneBy({ id });
    if (!insurance) throw new NotFoundException('Insurance entry not found');
    return insurance;
  }

  async update(id: number, updateInsuranceDto: UpdateInsuranceDto): Promise<Insurance> {
    const insurance = await this.findOne(id);
    Object.assign(insurance, updateInsuranceDto);
    const saved = await this.insuranceRepository.save(insurance);
    this.mockCoverageExpiryAlert(saved);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.insuranceRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Insurance entry not found');
  }

  private mockCoverageExpiryAlert(insurance: Insurance) {
    // For demo: alert 10 seconds before endDate (if in the future)
    const end = new Date(insurance.endDate).getTime();
    const now = Date.now();
    const msUntilAlert = end - now - 10000;
    if (msUntilAlert > 0) {
      setTimeout(() => {
        // Replace with real notification logic as needed
        console.log(`ALERT: Insurance for asset '${insurance.assetName}' (policy ${insurance.policyNumber}) is about to expire!`);
      }, msUntilAlert);
    }
  }
} 