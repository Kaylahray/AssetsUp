# AssetsUp - Unified Inventory and Asset Management System

A comprehensive asset management system with blockchain transparency via Stellar for critical events like asset acquisition, transfer, and disposal.

## Features

- **Asset Registration & Management**: Complete lifecycle management with QR codes and digital tracking
- **Inventory Management**: Real-time stock tracking with low inventory alerts
- **Multi-Branch Support**: Manage assets across multiple locations
- **Assignment & Ownership**: Track asset assignments to employees and departments
- **Maintenance Scheduling**: Preventive and corrective maintenance tracking
- **Check-in/Check-out System**: Temporary asset usage tracking with QR scanning
- **Audit Trail & Stellar Integration**: Immutable blockchain records for critical events
- **Role-Based Access Control**: Fine-grained permissions system
- **Comprehensive Reporting**: Asset distribution, depreciation, and performance analytics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Blockchain**: Stellar for payments
- **Authentication**: JWT with role-based access control
- **Real-time**: WebSockets for notifications
- **File Storage**: Local storage with cloud integration support

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Docker and Docker Compose (optional)
- Stellar account (for blockchain features)

## Quick Start with Docker

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/AssetsUp.git
   cd AssetsUp
   \`\`\`

2. Create environment files:
   \`\`\`bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   \`\`\`

3. Start the application:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## Manual Setup

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up the database:
   \`\`\`bash

# Create a PostgreSQL database named 'AssetsUp'

createdb AssetsUp
\`\`\`

4. Configure environment variables:
   \`\`\`bash
   cp .env.example .env

# Edit .env with your database credentials and other settings

\`\`\`

5. Run database migrations:
   \`\`\`bash
   npm run migration:run
   \`\`\`

6. Seed the database (optional):
   \`\`\`bash
   npm run seed
   \`\`\`

7. Start the development server:
   \`\`\`bash
   npm run start:dev
   \`\`\`

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure environment variables:
   \`\`\`bash
   cp .env.example .env

# Edit .env with your API URL

\`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Stellar Setup (Optional)

1. Navigate to the Stellar directory:
   \`\`\`bash
   cd Stellar
   \`\`\`

2. Install Scarb (Cairo package manager):
   \`\`\`bash
   curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
   \`\`\`

3. Build contracts:
   \`\`\`bash
   scarb build
   \`\`\`

4. Deploy contracts:
   \`\`\`bash
   ./scripts/deploy.sh
   \`\`\`

5. Update backend .env with deployed contract addresses

## Default Credentials

After seeding the database, you can use these credentials:

- **Admin**: admin@AssetsUp.com / admin123
- **Manager**: manager@AssetsUp.com / manager123
- **Employee**: john@AssetsUp.com / john123

## Project Structure

\`\`\`
AssetsUp/
├── frontend/ # Next.js frontend application
│ ├── app/ # App router pages
│ ├── components/ # React components
│ ├── lib/ # Utilities and API client
│ └── public/ # Static assets
├── backend/ # NestJS backend application
│ ├── src/
│ │ ├── assets/ # Asset management module
│ │ ├── auth/ # Authentication module
│ │ ├── inventory/ # Inventory management module
│ │ ├── maintenance/ # Maintenance tracking module
│ │ ├── branches/ # Multi-branch support
│ │ ├── audit/ # Audit trail module
│ │ └── Stellar/ # Stellar integration
│ └── uploads/ # File storage
└── Stellar/ # Cairo smart contracts
├── src/ # Contract source files
└── scripts/ # Deployment scripts
\`\`\`

## API Documentation

The API documentation is available at http://localhost:3001/api/docs when the backend is running.

## Key Features Documentation

### Asset Management

- Register assets with detailed information
- Generate and print QR codes
- Track asset lifecycle from acquisition to disposal
- Assign assets to users or departments
- Transfer assets between branches

### Inventory Management

- Track consumable items with quantity-based management
- Set reorder points and receive low stock alerts
- Record stock transactions with full history
- Generate inventory valuation reports

### Maintenance Tracking

- Schedule preventive maintenance
- Log repairs and associated costs
- Track asset downtime and performance
- Generate maintenance cost reports

### Blockchain Integration

- Immutable audit trail for critical events
- On-chain proof of asset ownership
- Transparent asset lifecycle tracking
- Optional NFT-like certificates for high-value items

### Reporting & Analytics

- Asset distribution heatmaps
- Depreciation calculations and forecasts
- Maintenance vs expense trends
- Performance and downtime analytics
- Custom report generation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@AssetsUp.com or open an issue in the GitHub repository.

## Acknowledgments

- Built with Next.js, NestJS, and Stellar
- UI components from shadcn/ui
- Icons from Lucide React
