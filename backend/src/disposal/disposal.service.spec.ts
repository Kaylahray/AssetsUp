import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DisposalModule } from "../src/disposal/disposal.module";
import { DisposalRecord } from "../src/disposal/disposal-record.entity";
import { DisposalService } from "../src/disposal/disposal.service";
import { DisposalMethod } from "../src/disposal/disposal-method.enum";
import { getMockAcquisitionDate } from "../src/disposal/utils/acquisition-date.util";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("DisposalService (standalone)", () => {
  let service: DisposalService;
  let repo: Repository<DisposalRecord>;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          entities: [DisposalRecord],
          synchronize: true,
        }),
        DisposalModule,
      ],
    }).compile();

    service = modRef.get(DisposalService);
    repo = modRef.get<Repository<DisposalRecord>>(
      getRepositoryToken(DisposalRecord)
    );
  });

  afterAll(async () => {
    // Close DB connection
    const conn = repo.manager.connection;
    await conn.close();
  });

  it("creates a disposal record", async () => {
    const assetId = "ASSET-001";
    const acq = getMockAcquisitionDate(assetId);
    const tomorrow = new Date(new Date(acq).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const rec = await service.create({
      assetId,
      disposalMethod: DisposalMethod.SOLD,
      disposalDate: tomorrow,
      finalValue: 150000.55,
      reason: "End of life",
      notes: "Sold to secondary market",
    });

    expect(rec.id).toBeDefined();
    expect(rec.assetId).toBe(assetId);
    expect(rec.disposalMethod).toBe(DisposalMethod.SOLD);
    expect(rec.finalValue).toBe("150000.55"); // persisted as numeric string
  });

  it("rejects disposalDate before mock acquisition date", async () => {
    const assetId = "ASSET-XYZ";
    const acq = getMockAcquisitionDate(assetId);
    const yesterday = new Date(new Date(acq).getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    await expect(
      service.create({
        assetId,
        disposalMethod: DisposalMethod.SCRAPPED,
        disposalDate: yesterday,
        finalValue: 0,
        reason: "Damaged",
        notes: "Severely damaged",
      })
    ).rejects.toThrow(/cannot be before mock acquisition date/i);
  });

  it("updates and validates again", async () => {
    const assetId = "ASSET-ABC";
    const acq = getMockAcquisitionDate(assetId);
    const validDate = new Date(
      new Date(acq).getTime() + 2 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10);

    const rec = await service.create({
      assetId,
      disposalMethod: DisposalMethod.DONATED,
      disposalDate: validDate,
      finalValue: 0,
      reason: "CSR",
      notes: null as any,
    });

    // Try invalid update
    const invalidDate = new Date(new Date(acq).getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    await expect(
      service.update(rec.id, { disposalDate: invalidDate })
    ).rejects.toThrow(/cannot be before mock acquisition date/i);

    // Valid update
    const updated = await service.update(rec.id, {
      disposalMethod: DisposalMethod.LOST,
      finalValue: 10.2,
    });
    expect(updated.disposalMethod).toBe(DisposalMethod.LOST);
    expect(updated.finalValue).toBe("10.20");
  });

  it("soft-deletes and restores", async () => {
    const assetId = "ASSET-RESTORE";
    const acq = getMockAcquisitionDate(assetId);
    const validDate = new Date(new Date(acq).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const rec = await service.create({
      assetId,
      disposalMethod: DisposalMethod.SCRAPPED,
      disposalDate: validDate,
      finalValue: 0,
    });

    await service.softDelete(rec.id);
    let withDeleted = await repo.findOne({
      where: { id: rec.id },
      withDeleted: true,
    });
    expect(withDeleted?.deletedAt).toBeTruthy();

    await service.restore(rec.id);
    withDeleted = await repo.findOne({
      where: { id: rec.id },
      withDeleted: true,
    });
    expect(withDeleted?.deletedAt).toBeNull();
  });
});
