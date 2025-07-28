import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from "supertest";
import { VendorModule } from "../vendor.module";
import { Vendor } from "../vendor.entity";
import { VendorType, VendorStatus } from "../vendor.enums";

describe("Vendor (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [Vendor],
          synchronize: true,
        }),
        VendorModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const validVendor = {
    name: "Test Vendor",
    type: VendorType.COMPANY,
    phoneNumber: "+1234567890",
    email: "test@vendor.com",
    taxId: "TX123456789",
    address: "123 Main St",
  };

  describe("/vendors (POST)", () => {
    it("should create a vendor with valid data", () => {
      return request(app.getHttpServer())
        .post("/vendors")
        .send(validVendor)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toEqual(validVendor.name);
          expect(res.body.type).toEqual(validVendor.type);
          expect(res.body.status).toEqual(VendorStatus.ACTIVE);
        });
    });

    it("should return 400 for invalid email", () => {
      return request(app.getHttpServer())
        .post("/vendors")
        .send({ ...validVendor, email: "invalid-email" })
        .expect(400);
    });

    it("should return 409 for duplicate tax ID", async () => {
      await request(app.getHttpServer())
        .post("/vendors")
        .send({ ...validVendor, taxId: "DUPLICATE123" });

      return request(app.getHttpServer())
        .post("/vendors")
        .send({ ...validVendor, name: "Another Vendor", taxId: "DUPLICATE123" })
        .expect(409);
    });
  });

  describe("/vendors (GET)", () => {
    it("should return vendors with pagination", () => {
      return request(app.getHttpServer())
        .get("/vendors")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("vendors");
          expect(res.body).toHaveProperty("total");
          expect(res.body).toHaveProperty("page");
          expect(res.body).toHaveProperty("limit");
        });
    });

    it("should filter by type", () => {
      return request(app.getHttpServer())
        .get("/vendors?type=company")
        .expect(200);
    });

    it("should filter by status", () => {
      return request(app.getHttpServer())
        .get("/vendors?status=active")
        .expect(200);
    });
  });
});
