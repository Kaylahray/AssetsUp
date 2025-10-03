import { Injectable } from '@nestjs/common';
import { CalculateRiskDto } from './dto/calculate-risk.dto';

export interface RiskScoreResponse {
  finalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    cargo: number;
    geopolitical: number;
    carrier: number;
  };
}

@Injectable()
export class RiskService {
  private highRiskCountries = ['Somalia', 'Yemen', 'Syria'];
  private unreliableCarriers = ['carrier-xyz', 'carrier-abc'];

  calculateRiskScore(details: CalculateRiskDto): RiskScoreResponse {
    const weights = { cargo: 0.4, geopolitical: 0.4, carrier: 0.2 };

    const cargoScore = this.scoreCargo(details.cargoType);
    const geopoliticalScore = this.scoreGeopolitical(
      details.destinationCountry,
    );
    const carrierScore = this.scoreCarrier(details.carrierId);

    const finalScore =
      cargoScore * weights.cargo +
      geopoliticalScore * weights.geopolitical +
      carrierScore * weights.carrier;

    return {
      finalScore: Math.round(finalScore),
      riskLevel: this.getRiskLevel(finalScore),
      breakdown: {
        cargo: cargoScore,
        geopolitical: geopoliticalScore,
        carrier: carrierScore,
      },
    };
  }

  private scoreCargo(cargoType: CalculateRiskDto['cargoType']): number {
    switch (cargoType) {
      case 'HAZARDOUS':
        return 90;
      case 'PERISHABLE':
        return 60;
      case 'GENERAL':
        return 10;
      default:
        return 0;
    }
  }

  private scoreGeopolitical(country: string): number {
    return this.highRiskCountries.includes(country) ? 100 : 10;
  }

  private scoreCarrier(carrierId: string): number {
    return this.unreliableCarriers.includes(carrierId) ? 80 : 20;
  }

  private getRiskLevel(score: number): RiskScoreResponse['riskLevel'] {
    if (score > 80) return 'CRITICAL';
    if (score > 60) return 'HIGH';
    if (score > 30) return 'MEDIUM';
    return 'LOW';
  }
}
