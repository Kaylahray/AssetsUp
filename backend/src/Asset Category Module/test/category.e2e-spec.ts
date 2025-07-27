import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from "supertest";
import { CategoryModule } from "../src/category/category.module";
import { Category } from "../src/category/entities/category.entity";

describe("CategoryController (e2e)", () => {
  let app: INestApplication;
  let createdCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [Category],
          synchronize: true,
        }),
        CategoryModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/categories (POST)", () => {
    it("should create a category", () => {
      return request(app.getHttpServer())
        .post("/categories")
        .send({
          name: "Electronics",
          description: "Electronic devices and gadgets",
          iconUrl: "https://example.com/icons/electronics.png",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.name).toBe("Electronics");
          expect(res.body.description).toBe("Electronic devices and gadgets");
          expect(res.body.iconUrl).toBe(
            "https://example.com/icons/electronics.png"
          );
          createdCategoryId = res.body.id;
        });
    });

    it("should return 409 for duplicate category name", () => {
      return request(app.getHttpServer())
        .post("/categories")
        .send({
          name: "Electronics",
          description: "Duplicate category",
        })
        .expect(409);
    });

    it("should return 400 for invalid data", () => {
      return request(app.getHttpServer())
        .post("/categories")
        .send({
          name: "", // Empty name should fail validation
        })
        .expect(400);
    });
  });

  describe("/categories (GET)", () => {
    it("should return all categories", () => {
      return request(app.getHttpServer())
        .get("/categories")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe("/categories/:id (GET)", () => {
    it("should return a category by id", () => {
      return request(app.getHttpServer())
        .get(`/categories/${createdCategoryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdCategoryId);
          expect(res.body.name).toBe("Electronics");
        });
    });

    it("should return 404 for non-existent category", () => {
      return request(app.getHttpServer())
        .get("/categories/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });

  describe("/categories/:id (PATCH)", () => {
    it("should update a category", () => {
      return request(app.getHttpServer())
        .patch(`/categories/${createdCategoryId}`)
        .send({
          description: "Updated description for electronic devices",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdCategoryId);
          expect(res.body.description).toBe(
            "Updated description for electronic devices"
          );
        });
    });

    it("should return 404 for non-existent category", () => {
      return request(app.getHttpServer())
        .patch("/categories/00000000-0000-0000-0000-000000000000")
        .send({
          description: "Updated description",
        })
        .expect(404);
    });
  });

  describe("Parent-child relationships", () => {
    let parentId: string;
    let childId: string;

    it("should create a parent category", () => {
      return request(app.getHttpServer())
        .post("/categories")
        .send({
          name: "Vehicles",
          description: "All types of vehicles",
        })
        .expect(201)
        .expect((res) => {
          parentId = res.body.id;
        });
    });

    it("should create a child category", () => {
      return request(app.getHttpServer())
        .post("/categories")
        .send({
          name: "Cars",
          description: "Passenger cars",
          parentId: parentId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.parent).toBeDefined();
          expect(res.body.parent.id).toBe(parentId);
          childId = res.body.id;
        });
    });

    it("should get category tree", () => {
      return request(app.getHttpServer())
        .get("/categories/tree")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const vehicleCategory = res.body.find(
            (cat) => cat.name === "Vehicles"
          );
          expect(vehicleCategory).toBeDefined();
          expect(vehicleCategory.children).toBeDefined();
          expect(vehicleCategory.children.length).toBeGreaterThan(0);
        });
    });

    it("should get root categories", () => {
      return request(app.getHttpServer())
        .get("/categories/root")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const rootCategories = res.body;
          expect(rootCategories.every((cat) => !cat.parent)).toBe(true);
        });
    });

    it("should prevent deletion of category with children", () => {
      return request(app.getHttpServer())
        .delete(`/categories/${parentId}`)
        .expect(400);
    });

    it("should allow deletion of child category", () => {
      return request(app.getHttpServer())
        .delete(`/categories/${childId}`)
        .expect(204);
    });
  });

  describe("/categories/:id (DELETE)", () => {
    it("should delete a category", () => {
      return request(app.getHttpServer())
        .delete(`/categories/${createdCategoryId}`)
        .expect(204);
    });

    it("should return 404 for non-existent category", () => {
      return request(app.getHttpServer())
        .delete("/categories/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });
});
