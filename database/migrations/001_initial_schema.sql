-- ============================================================================
-- SafeSettle MVP - Milestone 1: Database Foundation
-- Migration: 001_initial_schema.sql
-- Description: Core schema with PostGIS spatial types, SRID 4326, constraints,
--              UUID primary keys, and GiST spatial indexes.
-- Target: PostgreSQL 14+ with PostGIS 3+ (Supabase compatible)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Ensure PostGIS spatial types and functions resolve cleanly
SET search_path TO public, postgis, extensions;

-- 2. Trigger Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Users and Operational Roles
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN' CHECK (
        role IN ('ADMIN', 'DISASTER_OFFICER', 'FIELD_RESPONDER', 'CITIZEN')
    ),
    phone VARCHAR(50),
    department VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Habitations (Vulnerable Settlements / Villages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS habitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    population INTEGER NOT NULL CHECK (population >= 0),
    vulnerable_population INTEGER NOT NULL DEFAULT 0 CHECK (
        vulnerable_population >= 0 AND vulnerable_population <= population
    ),
    risk_level VARCHAR(50) NOT NULL CHECK (
        risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    ),
    priority_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (priority_score >= 0.0),
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial and relational indexes
CREATE INDEX idx_habitations_location ON habitations USING GIST (location);
CREATE INDEX idx_habitations_risk_level ON habitations(risk_level);
CREATE INDEX idx_habitations_priority_score ON habitations(priority_score DESC);

CREATE TRIGGER trg_habitations_updated_at
BEFORE UPDATE ON habitations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Shelters (Safe Evacuation Centers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    physical_capacity INTEGER NOT NULL CHECK (physical_capacity > 0),
    current_occupancy INTEGER NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0),
    functional_available_capacity INTEGER NOT NULL CHECK (functional_available_capacity >= 0),
    water_available BOOLEAN NOT NULL DEFAULT TRUE,
    sanitation_available BOOLEAN NOT NULL DEFAULT TRUE,
    medical_support BOOLEAN NOT NULL DEFAULT FALSE,
    transport_available BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'INACTIVE', 'FULL', 'DAMAGED')
    ),
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_shelter_occupancy_valid CHECK (current_occupancy <= physical_capacity),
    CONSTRAINT chk_shelter_functional_valid CHECK (functional_available_capacity <= physical_capacity)
);

-- Spatial and operational indexes
CREATE INDEX idx_shelters_location ON shelters USING GIST (location);
CREATE INDEX idx_shelters_status ON shelters(status);
CREATE INDEX idx_shelters_functional_capacity ON shelters(functional_available_capacity DESC);

CREATE TRIGGER trg_shelters_updated_at
BEFORE UPDATE ON shelters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Roads (Evacuation & Transit Infrastructure)
-- ============================================================================
CREATE TABLE IF NOT EXISTS roads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CLEAR' CHECK (
        status IN ('CLEAR', 'CONGESTED', 'FLOODED', 'BLOCKED', 'DAMAGED')
    ),
    road_type VARCHAR(50) NOT NULL DEFAULT 'PRIMARY' CHECK (
        road_type IN ('HIGHWAY', 'PRIMARY', 'SECONDARY', 'TERTIARY', 'TRACK', 'BRIDGE')
    ),
    geometry GEOMETRY(LineString, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial and status indexes
CREATE INDEX idx_roads_geometry ON roads USING GIST (geometry);
CREATE INDEX idx_roads_status ON roads(status);
CREATE INDEX idx_roads_type ON roads(road_type);

CREATE TRIGGER trg_roads_updated_at
BEFORE UPDATE ON roads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Risk Zones (Hazard / Inundation Polygons)
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    hazard_type VARCHAR(100) NOT NULL CHECK (
        hazard_type IN ('FLOOD', 'LANDSLIDE', 'CYCLONE', 'STORM_SURGE', 'EARTHQUAKE', 'INDUSTRIAL_HAZARD', 'OTHER')
    ),
    risk_level VARCHAR(50) NOT NULL CHECK (
        risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    ),
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial and hazard indexes
CREATE INDEX idx_risk_zones_geometry ON risk_zones USING GIST (geometry);
CREATE INDEX idx_risk_zones_hazard_type ON risk_zones(hazard_type);
CREATE INDEX idx_risk_zones_risk_level ON risk_zones(risk_level);

CREATE TRIGGER trg_risk_zones_updated_at
BEFORE UPDATE ON risk_zones
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Citizen Reports (Crowdsourced Incident Feed)
-- Workflow Rule: PENDING_VERIFICATION -> VERIFIED or REJECTED
-- Note: Citizen reports NEVER directly alter official operational tables.
-- ============================================================================
CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL CHECK (
        report_type IN ('ROAD_BLOCKED', 'FLOODING', 'SHELTER_OVERFLOW', 'BRIDGE_COLLAPSE', 'MEDICAL_EMERGENCY', 'STRANDED_PERSONS', 'OTHER')
    ),
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (
        severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    ),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (
        status IN ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')
    ),
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verification_notes TEXT,
    CONSTRAINT chk_citizen_report_verification_integrity CHECK (
        (status = 'PENDING_VERIFICATION' AND verified_at IS NULL AND verified_by IS NULL)
        OR
        (status IN ('VERIFIED', 'REJECTED') AND verified_at IS NOT NULL)
    )
);

-- Spatial and workflow query indexes
CREATE INDEX idx_citizen_reports_location ON citizen_reports USING GIST (location);
CREATE INDEX idx_citizen_reports_status ON citizen_reports(status);
CREATE INDEX idx_citizen_reports_severity ON citizen_reports(severity);
CREATE INDEX idx_citizen_reports_created_at ON citizen_reports(created_at DESC);
CREATE INDEX idx_citizen_reports_verified_by ON citizen_reports(verified_by);

-- ============================================================================
-- 9. Relocation Plans (Evacuation Scenarios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS relocation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'GENERATED', 'FEASIBILITY_CHECK_PASSED', 'FEASIBILITY_CHECK_FAILED', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED')
    ),
    readiness_score NUMERIC(5, 2) CHECK (readiness_score >= 0.0 AND readiness_score <= 100.0),
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    CONSTRAINT chk_plan_approval_integrity CHECK (
        (status = 'APPROVED' AND approved_at IS NOT NULL)
        OR
        (status != 'APPROVED')
    )
);

CREATE INDEX idx_relocation_plans_status ON relocation_plans(status);
CREATE INDEX idx_relocation_plans_created_at ON relocation_plans(created_at DESC);
CREATE INDEX idx_relocation_plans_approved_by ON relocation_plans(approved_by);

-- ============================================================================
-- 10. Plan Assignments (Habitation -> Shelter Allocations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS plan_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES relocation_plans(id) ON DELETE CASCADE,
    habitation_id UUID NOT NULL REFERENCES habitations(id) ON DELETE RESTRICT,
    shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE RESTRICT,
    assigned_population INTEGER NOT NULL CHECK (assigned_population > 0),
    route_distance NUMERIC(10, 2) CHECK (route_distance >= 0.0), -- Distance in kilometers
    route_status VARCHAR(50) NOT NULL DEFAULT 'VIABLE' CHECK (
        route_status IN ('OPTIMAL', 'VIABLE', 'COMPROMISED', 'BLOCKED', 'NEEDS_REASSIGNMENT')
    ),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_plan_habitation_shelter UNIQUE (plan_id, habitation_id, shelter_id)
);

-- Foreign key & filtering indexes
CREATE INDEX idx_plan_assignments_plan_id ON plan_assignments(plan_id);
CREATE INDEX idx_plan_assignments_habitation_id ON plan_assignments(habitation_id);
CREATE INDEX idx_plan_assignments_shelter_id ON plan_assignments(shelter_id);
CREATE INDEX idx_plan_assignments_route_status ON plan_assignments(route_status);

CREATE TRIGGER trg_plan_assignments_updated_at
BEFORE UPDATE ON plan_assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
