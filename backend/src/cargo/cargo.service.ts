import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cargo } from './entities/cargo.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { Shipment } from '../shipments/entities/shipment.entity'; // Assuming path

@Injectable()
export class CargoService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
    @InjectRepository(Shipment) // Inject to verify shipment existence
    private readonly shipmentRepository: Repository<Shipment>,
  ) {}

  async create(createDto: CreateCargoDto): Promise<Cargo> {
    // Verify that the shipment exists before linking cargo to it
    const shipment = await this.shipmentRepository.findOne({
      where: { id: createDto.shipmentId },
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID "${createDto.shipmentId}" not found.`);
    }

    const cargo = this.cargoRepository.create(createDto);
    return this.cargoRepository.save(cargo);
  }

  async findOne(id: string): Promise<Cargo> {
    const cargo = await this.cargoRepository.findOne({ where: { id } });
    if (!cargo) {
      throw new NotFoundException(`Cargo item with ID "${id}" not found.`);
    }
    return cargo;
  }

  async findAllForShipment(shipmentId: string): Promise<Cargo[]> {
    return this.cargoRepository.find({
      where: { shipmentId },
      order: { createdAt: 'ASC' },
    });
  }
}