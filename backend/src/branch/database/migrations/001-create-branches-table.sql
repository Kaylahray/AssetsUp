-- Migration: Create branches table and related structures
-- Run this migration to set up the branch module database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create branches table
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    branch_code VARCHAR(10) UNIQUE NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    manager_id UUID,
    operating_hours JSONB,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_branches_branch_code ON branches(branch_code);
CREATE INDEX idx_branches_city ON branches(city);
CREATE INDEX idx_branches_state ON branches(state);
CREATE INDEX idx_branches_country ON branches(country);
CREATE INDEX idx_branches_is_active ON branches(is_active);
CREATE INDEX idx_branches_manager_id ON branches(manager_id);
CREATE INDEX idx_branches_location ON branches(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create user_branches junction table for many-to-many relationship
CREATE TABLE user_branches (
    user_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    PRIMARY KEY (user_id, branch_id),
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Create indexes for junction table
CREATE INDEX idx_user_branches_user_id ON user_branches(user_id);
CREATE INDEX idx_user_branches_branch_id ON user_branches(branch_id);

-- Create branch_transfer_logs table for audit trail
CREATE TABLE branch_transfer_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_branch_id UUID NOT NULL,
    to_branch_id UUID NOT NULL,
    asset_ids UUID[] NOT NULL,
    transferred_by UUID NOT NULL,
    transfer_reason TEXT,
    notes TEXT,
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_branch_id) REFERENCES branches(id),
    FOREIGN KEY (to_branch_id) REFERENCES branches(id)
);

-- Create indexes for transfer logs
CREATE INDEX idx_transfer_logs_from_branch ON branch_transfer_logs(from_branch_id);
CREATE INDEX idx_transfer_logs_to_branch ON branch_transfer_logs(to_branch_id);
CREATE INDEX idx_transfer_logs_transferred_at ON branch_transfer_logs(transferred_at);

-- Add foreign key constraints to existing tables (modify as needed based on your schema)
-- Uncomment and modify these based on your existing table structures

-- ALTER TABLE assets ADD COLUMN branch_id UUID REFERENCES branches(id);
-- ALTER TABLE inventories ADD COLUMN branch_id UUID REFERENCES branches(id);
-- ALTER TABLE transactions ADD COLUMN branch_id UUID REFERENCES branches(id);

-- Create indexes for foreign keys in existing tables
-- CREATE INDEX idx_assets_branch_id ON assets(branch_id);
-- CREATE INDEX idx_inventories_branch_id ON inventories(branch_id);
-- CREATE INDEX idx_transactions_branch_id ON transactions(branch_id);

-- Insert sample data
INSERT INTO branches (name, address, city, state, country, phone, email, branch_code, description, operating_hours, timezone) VALUES
(
    'Main Headquarters', 
    '123 Main Street', 
    'New York', 
    'NY', 
    'USA', 
    '+1-555-0101', 
    'main@company.com', 
    'MAIN01', 
    'Primary headquarters location',
    '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}, "saturday": {"closed": true}, "sunday": {"closed": true}}',
    'America/New_York'
),
(
    'West Coast Branch', 
    '456 Pacific Avenue', 
    'Los Angeles', 
    'CA', 
    'USA', 
    '+1-555-0102', 
    'west@company.com', 
    'WEST01', 
    'West coast operations center',
    '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "10:00", "close": "14:00"}, "sunday": {"closed": true}}',
    'America/Los_Angeles'
),
(
    'East Coast Branch', 
    '789 Atlantic Boulevard', 
    'Miami', 
    'FL', 
    'USA', 
    '+1-555-0103', 
    'east@company.com', 
    'EAST01', 
    'East coast distribution center',
    '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}, "saturday": {"closed": true}, "sunday": {"closed": true}}',
    'America/New_York'
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_branches_updated_at 
    BEFORE UPDATE ON branches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
