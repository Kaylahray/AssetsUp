-- Create maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL DEFAULT 'preventive',
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    estimated_hours INTEGER DEFAULT 0,
    actual_hours INTEGER,
    asset_id UUID NOT NULL,
    responsible_person_id UUID,
    vendor_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_maintenance_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_user FOREIGN KEY (responsible_person_id) REFERENCES users(id),
    CONSTRAINT fk_maintenance_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    CONSTRAINT chk_maintenance_type CHECK (type IN ('preventive', 'corrective', 'inspection', 'emergency', 'routine')),
    CONSTRAINT chk_maintenance_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled')),
    CONSTRAINT chk_due_date_after_start CHECK (due_date > start_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_asset_id ON maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_due_date ON maintenance(due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_responsible_person ON maintenance(responsible_person_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON maintenance(type);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintenance_updated_at
    BEFORE UPDATE ON maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_updated_at();
