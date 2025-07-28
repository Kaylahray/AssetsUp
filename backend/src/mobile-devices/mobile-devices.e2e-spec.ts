import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MobileDevicesModule } from "./mobile-devices.module";
import { MobileDevice, OperatingSystem, MobileDeviceType } from "./entities/mobile-device.entity";

describe("MobileDevicesController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [MobileDevice],
          synchronize: true,
        }),
        MobileDevicesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("/mobile-devices (POST)", () => {
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012345",
      serialNumber: "SN123456789",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    return request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("iPhone 13");
        expect(res.body.imei).toBe("123456789012345");
        expect(res.body.serialNumber).toBe("SN123456789");
      });
  });

  it("/mobile-devices (GET)", () => {
    return request(app.getHttpServer())
      .get("/mobile-devices")
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.devices)).toBe(true);
        expect(res.body).toHaveProperty("total");
        expect(res.body).toHaveProperty("page");
        expect(res.body).toHaveProperty("limit");
      });
  });

  it("/mobile-devices/statistics (GET)", () => {
    return request(app.getHttpServer())
      .get("/mobile-devices/statistics")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("totalDevices");
        expect(res.body).toHaveProperty("availableDevices");
        expect(res.body).toHaveProperty("assignedDevices");
        expect(res.body).toHaveProperty("maintenanceDevices");
        expect(res.body).toHaveProperty("decommissionedDevices");
        expect(res.body).toHaveProperty("devicesNeedingOsUpdate");
        expect(res.body).toHaveProperty("devicesWithExpiringWarranty");
      });
  });

  it("/mobile-devices/expiring-warranty (GET)", () => {
    return request(app.getHttpServer())
      .get("/mobile-devices/expiring-warranty")
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it("/mobile-devices/needing-os-update (GET)", () => {
    return request(app.getHttpServer())
      .get("/mobile-devices/needing-os-update")
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it("/mobile-devices/:id (GET)", async () => {
    // First create a device
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012346",
      serialNumber: "SN123456790",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    const createResponse = await request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201);

    const deviceId = createResponse.body.id;

    // Then get the device by id
    return request(app.getHttpServer())
      .get(`/mobile-devices/${deviceId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(deviceId);
        expect(res.body.name).toBe("iPhone 13");
        expect(res.body.imei).toBe("123456789012346");
      });
  });

  it("/mobile-devices/imei/:imei (GET)", async () => {
    // First create a device
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012347",
      serialNumber: "SN123456791",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    await request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201);

    // Then get the device by IMEI
    return request(app.getHttpServer())
      .get("/mobile-devices/imei/123456789012347")
      .expect(200)
      .expect((res) => {
        expect(res.body.imei).toBe("123456789012347");
        expect(res.body.name).toBe("iPhone 13");
      });
  });

  it("/mobile-devices/serial/:serialNumber (GET)", async () => {
    // First create a device
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012348",
      serialNumber: "SN123456792",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    await request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201);

    // Then get the device by serial number
    return request(app.getHttpServer())
      .get("/mobile-devices/serial/SN123456792")
      .expect(200)
      .expect((res) => {
        expect(res.body.serialNumber).toBe("SN123456792");
        expect(res.body.name).toBe("iPhone 13");
      });
  });

  it("/mobile-devices/:id (PATCH)", async () => {
    // First create a device
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012349",
      serialNumber: "SN123456793",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    const createResponse = await request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201);

    const deviceId = createResponse.body.id;

    // Then update the device
    const updateDto = {
      name: "iPhone 13 Pro",
      notes: "Updated device information",
    };

    return request(app.getHttpServer())
      .patch(`/mobile-devices/${deviceId}`)
      .send(updateDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe("iPhone 13 Pro");
        expect(res.body.notes).toBe("Updated device information");
      });
  });

  it("/mobile-devices/:id/assign (PATCH)", async () => {
    // First create a device
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012350",
      serialNumber: "SN123456794",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    const createResponse = await request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201);

    const deviceId = createResponse.body.id;

    // Then assign the device to a user
    const assignDto = {
      userId: "user123",
      notes: "Assigned for work purposes",
    };

    return request(app.getHttpServer())
      .patch(`/mobile-devices/${deviceId}/assign`)
      .send(assignDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.assignedUserId).toBe("user123");
        expect(res.body.assignmentNotes).toBe("Assigned for work purposes");
      });
  });

  it("/mobile-devices/:id/os-update (PATCH)", async () => {
    // First create a device
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012351",
      serialNumber: "SN123456795",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    const createResponse = await request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201);

    const deviceId = createResponse.body.id;

    // Then update the OS version
    const osUpdateDto = {
      osVersion: "15.1",
    };

    return request(app.getHttpServer())
      .patch(`/mobile-devices/${deviceId}/os-update`)
      .send(osUpdateDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.currentOsVersion).toBe("15.1");
      });
  });

  it("/mobile-devices/:id/decommission (PATCH)", async () => {
    // First create a device
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012352",
      serialNumber: "SN123456796",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    const createResponse = await request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201);

    const deviceId = createResponse.body.id;

    // Then decommission the device
    const decommissionDto = {
      reason: "End of life cycle",
    };

    return request(app.getHttpServer())
      .patch(`/mobile-devices/${deviceId}/decommission`)
      .send(decommissionDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe("decommissioned");
        expect(res.body.decommissionReason).toBe("End of life cycle");
      });
  });

  it("/mobile-devices/:id (DELETE)", async () => {
    // First create a device
    const createDeviceDto = {
      name: "iPhone 13",
      model: "iPhone 13",
      manufacturer: "Apple",
      imei: "123456789012353",
      serialNumber: "SN123456797",
      operatingSystem: OperatingSystem.IOS,
      osVersion: "15.0",
    };

    const createResponse = await request(app.getHttpServer())
      .post("/mobile-devices")
      .send(createDeviceDto)
      .expect(201);

    const deviceId = createResponse.body.id;

    // Then delete the device
    return request(app.getHttpServer())
      .delete(`/mobile-devices/${deviceId}`)
      .expect(200);
  });
}); 