import { NestFactory } from "@nestjs/core"
import { AppModule } from "../app.module"
import { UsersService } from "../users/users.service"
import { BranchesService } from "../branches/branches.service"
import { AssetsService } from "../assets/assets.service"
import { InventoryService } from "../inventory/inventory.service"
import { Logger } from "@nestjs/common"

async function bootstrap() {
  const logger = new Logger("Seed")
  const app = await NestFactory.createApplicationContext(AppModule)

  const usersService = app.get(UsersService)
  const branchesService = app.get(BranchesService)
  const assetsService = app.get(AssetsService)
  const inventoryService = app.get(InventoryService)

  try {
    // Create branches
    logger.log("Creating branches...")
    const branches = await Promise.all([
      branchesService.create({
        name: "Headquarters",
        code: "HQ001",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        country: "USA",
        phone: "+1-212-555-0100",
        email: "hq@manageassets.com",
        isActive: true,
        latitude: 40.7128,
        longitude: -74.006,
      }),
      branchesService.create({
        name: "West Coast Office",
        code: "WC001",
        address: "456 Pacific Avenue",
        city: "San Francisco",
        state: "CA",
        country: "USA",
        phone: "+1-415-555-0200",
        email: "westcoast@manageassets.com",
        isActive: true,
        latitude: 37.7749,
        longitude: -122.4194,
      }),
    ])

    // Create users
    logger.log("Creating users...")
    const users = await Promise.all([
      usersService.create({
        name: "Admin User",
        email: "admin@manageassets.com",
        password: "admin123",
        role: "admin",
        department: "IT",
        position: "System Administrator",
        branchId: branches[0].id,
      }),
      usersService.create({
        name: "Asset Manager",
        email: "manager@manageassets.com",
        password: "manager123",
        role: "asset_manager",
        department: "Operations",
        position: "Asset Manager",
        branchId: branches[0].id,
      }),
      usersService.create({
        name: "John Employee",
        email: "john@manageassets.com",
        password: "john123",
        role: "employee",
        department: "Sales",
        position: "Sales Representative",
        branchId: branches[1].id,
      }),
    ])

    // Create assets
    logger.log("Creating assets...")
    const assetCategories = ["Electronics", "Furniture", "Vehicles", "Equipment"]
    const assetStatuses = ["available", "assigned", "maintenance"]

    for (let i = 1; i <= 20; i++) {
      await assetsService.create({
        name: `Asset ${i}`,
        description: `Description for asset ${i}`,
        serialNumber: `SN${String(i).padStart(6, "0")}`,
        category: assetCategories[Math.floor(Math.random() * assetCategories.length)],
        status: assetStatuses[Math.floor(Math.random() * assetStatuses.length)],
        condition: "good",
        purchaseDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        purchasePrice: Math.floor(Math.random() * 5000) + 500,
        supplier: `Supplier ${Math.floor(Math.random() * 5) + 1}`,
        warrantyExpiration: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        location: `Location ${Math.floor(Math.random() * 10) + 1}`,
        department: ["IT", "Sales", "HR", "Operations"][Math.floor(Math.random() * 4)],
        branchId: branches[Math.floor(Math.random() * branches.length)].id,
      })
    }

    // Create inventory items
    logger.log("Creating inventory items...")
    const inventoryCategories = ["Office Supplies", "Cleaning", "Electronics", "Safety"]

    for (let i = 1; i <= 15; i++) {
      await inventoryService.create({
        name: `Inventory Item ${i}`,
        sku: `SKU${String(i).padStart(6, "0")}`,
        description: `Description for inventory item ${i}`,
        category: inventoryCategories[Math.floor(Math.random() * inventoryCategories.length)],
        quantity: Math.floor(Math.random() * 100) + 10,
        unit: ["pcs", "box", "pack", "unit"][Math.floor(Math.random() * 4)],
        cost: Math.floor(Math.random() * 100) + 10,
        reorderPoint: Math.floor(Math.random() * 20) + 5,
        department: ["IT", "Sales", "HR", "Operations"][Math.floor(Math.random() * 4)],
        location: `Storage ${Math.floor(Math.random() * 5) + 1}`,
        branchId: branches[Math.floor(Math.random() * branches.length)].id,
      })
    }

    logger.log("Seed data created successfully!")
    logger.log(`
      Default credentials:
      - Admin: admin@manageassets.com / admin123
      - Manager: manager@manageassets.com / manager123
      - Employee: john@manageassets.com / john123
    `)
  } catch (error) {
    logger.error("Error seeding data:", error)
  } finally {
    await app.close()
  }
}

bootstrap()
