export default () => ({
  port: Number.parseInt(process.env.PORT, 10) || 3001,
  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "manageassets",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  starknet: {
    nodeUrl: process.env.STARKNET_NODE_URL || "https://starknet-testnet.public.blastapi.io",
    privateKey: process.env.STARKNET_PRIVATE_KEY,
    accountAddress: process.env.STARKNET_ACCOUNT_ADDRESS,
    assetRegistryAddress: process.env.STARKNET_ASSET_REGISTRY_ADDRESS,
    assetTransferAddress: process.env.STARKNET_ASSET_TRANSFER_ADDRESS,
    assetLifecycleAddress: process.env.STARKNET_ASSET_LIFECYCLE_ADDRESS,
    inventoryRegistryAddress: process.env.STARKNET_INVENTORY_REGISTRY_ADDRESS,
    assetCheckoutAddress: process.env.STARKNET_ASSET_CHECKOUT_ADDRESS,
    assetCertificateAddress: process.env.STARKNET_ASSET_CERTIFICATE_ADDRESS,
    auditTrailAddress: process.env.STARKNET_AUDIT_TRAIL_ADDRESS,
  },
  upload: {
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3000",
  },
  api: {
    url: process.env.API_URL || "http://localhost:3001",
  },
})
