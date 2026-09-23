-- ============================================================================
-- SafeSettle MVP - Milestone 1: Database Foundation
-- Migration: 003_seed_data.sql
-- Description: Realistic initial seed dataset representing a coastal cyclone/flood
--              evacuation scenario in Eastern India (Puri-Bhubaneswar corridor).
-- Coordinates: SRID 4326 (Longitude X, Latitude Y)
-- ============================================================================

-- Ensure PostGIS spatial constructors (ST_GeomFromText, ST_SetSRID, ST_MakePoint) resolve cleanly
SET search_path TO public, postgis, extensions;

-- ----------------------------------------------------------------------------
-- 1. Initial Users (Operational Roles)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, full_name, role, phone, department) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@safesettle.gov.in', 'Dr. Rajesh Sharma', 'ADMIN', '+91-9876543210', 'State Disaster Management Authority'),
('22222222-2222-2222-2222-222222222222', 'officer.puri@safesettle.gov.in', 'Ananya Patnaik', 'DISASTER_OFFICER', '+91-9876543211', 'District Relief Operations'),
('33333333-3333-3333-3333-333333333333', 'responder1@safesettle.gov.in', 'Bikash Mohanty', 'FIELD_RESPONDER', '+91-9876543212', 'Civil Defense QRT Unit 4'),
('44444444-4444-4444-4444-444444444444', 'citizen.sunil@gmail.com', 'Sunil Behera', 'CITIZEN', '+91-9876543213', 'Local Resident - Balukhanda')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Risk Zones (Coastal Flood / Cyclone Storm Surge Inundation Zone)
-- ----------------------------------------------------------------------------
INSERT INTO risk_zones (id, name, hazard_type, risk_level, geometry) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Coastal Surge Zone Alpha (Puri Coastal Belt)',
    'STORM_SURGE',
    'CRITICAL',
    ST_GeomFromText('MULTIPOLYGON(((85.80 19.78, 85.88 19.78, 85.89 19.83, 85.81 19.84, 85.80 19.78)))', 4326)
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Bhargavi River Lowland Inundation Belt',
    'FLOOD',
    'HIGH',
    ST_GeomFromText('MULTIPOLYGON(((85.75 19.85, 85.82 19.85, 85.84 19.92, 85.76 19.91, 85.75 19.85)))', 4326)
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Habitations (Vulnerable Settlements)
-- ----------------------------------------------------------------------------
INSERT INTO habitations (id, name, population, vulnerable_population, risk_level, priority_score, location) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'Balukhanda Fishermen Settlement',
    1250,
    380,
    'CRITICAL',
    94.50,
    ST_SetSRID(ST_MakePoint(85.8350, 19.8050), 4326)
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Pentakota Coastal Hamlet',
    2100,
    520,
    'CRITICAL',
    91.00,
    ST_SetSRID(ST_MakePoint(85.8420, 19.8010), 4326)
),
(
    'b0000000-0000-0000-0000-000000000003',
    'Chandanpur Lowland Basti',
    850,
    210,
    'HIGH',
    78.00,
    ST_SetSRID(ST_MakePoint(85.7950, 19.8650), 4326)
),
(
    'b0000000-0000-0000-0000-000000000004',
    'Satyabadi Agrarian Settlement',
    1400,
    290,
    'MEDIUM',
    62.50,
    ST_SetSRID(ST_MakePoint(85.7720, 19.9050), 4326)
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Shelters (Safe Evacuation Centers)
-- ----------------------------------------------------------------------------
INSERT INTO shelters (id, name, physical_capacity, current_occupancy, functional_available_capacity, water_available, sanitation_available, medical_support, transport_available, status, location) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Multipurpose Cyclone Shelter - Gop Elevated Campus',
    2000,
    150,
    1850,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    'ACTIVE',
    ST_SetSRID(ST_MakePoint(85.8650, 19.8820), 4326)
),
(
    'c0000000-0000-0000-0000-000000000002',
    'District Higher Secondary School Shelter Complex',
    1500,
    0,
    1500,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    'ACTIVE',
    ST_SetSRID(ST_MakePoint(85.8180, 19.8920), 4326)
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Satyabadi Community Resilience Center',
    1800,
    400,
    1400,
    TRUE,
    TRUE,
    FALSE,
    TRUE,
    'ACTIVE',
    ST_SetSRID(ST_MakePoint(85.7680, 19.9320), 4326)
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Roads (Evacuation Corridors)
-- ----------------------------------------------------------------------------
INSERT INTO roads (id, name, status, road_type, geometry) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'NH-316 Coastal Arterial Route',
    'CLEAR',
    'HIGHWAY',
    ST_GeomFromText('LINESTRING(85.8300 19.8000, 85.8380 19.8350, 85.8450 19.8700, 85.8650 19.8820)', 4326)
),
(
    'd0000000-0000-0000-0000-000000000002',
    'Chandanpur-Gop Rural Relief Link',
    'CLEAR',
    'SECONDARY',
    ST_GeomFromText('LINESTRING(85.7950 19.8650, 85.8200 19.8720, 85.8650 19.8820)', 4326)
),
(
    'd0000000-0000-0000-0000-000000000003',
    'Pentakota Shoreline Access Road',
    'FLOODED',
    'TERTIARY',
    ST_GeomFromText('LINESTRING(85.8420 19.8010, 85.8370 19.8150, 85.8300 19.8000)', 4326)
),
(
    'd0000000-0000-0000-0000-000000000004',
    'Satyabadi Bypass Connector',
    'CLEAR',
    'PRIMARY',
    ST_GeomFromText('LINESTRING(85.7720 19.9050, 85.7700 19.9200, 85.7680 19.9320)', 4326)
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. Citizen Reports (Demonstrating Multi-State Lifecycle)
-- ----------------------------------------------------------------------------
INSERT INTO citizen_reports (id, report_type, description, severity, status, location, created_at, verified_at, verified_by, verification_notes) VALUES
-- Report 1: Newly submitted crowdsourced report awaiting authority review
(
    'e0000000-0000-0000-0000-000000000001',
    'ROAD_BLOCKED',
    'Fallen Casuarina trees and 2 feet waterlogging blocking the Pentakota access road link',
    'HIGH',
    'PENDING_VERIFICATION',
    ST_SetSRID(ST_MakePoint(85.8390, 19.8080), 4326),
    NOW() - INTERVAL '45 minutes',
    NULL,
    NULL,
    NULL
),
-- Report 2: Verified incident by Field Responder / Disaster Officer
(
    'e0000000-0000-0000-0000-000000000002',
    'FLOODING',
    'Bhargavi river embankment seepage near Chandanpur culvert. Lowland inundation beginning.',
    'CRITICAL',
    'VERIFIED',
    ST_SetSRID(ST_MakePoint(85.7980, 19.8690), 4326),
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours',
    '22222222-2222-2222-2222-222222222222',
    'Confirmed on ground by QRT Unit 4. Embankment sandbagging underway.'
),
-- Report 3: Spurious / false alarm correctly marked REJECTED
(
    'e0000000-0000-0000-0000-000000000003',
    'BRIDGE_COLLAPSE',
    'Rumor of Satyabadi bridge collapse circulating on social media',
    'LOW',
    'REJECTED',
    ST_SetSRID(ST_MakePoint(85.7710, 19.9120), 4326),
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '4 hours 30 minutes',
    '22222222-2222-2222-2222-222222222222',
    'Physical inspection performed by patrol team. Bridge is 100% operational with no structural issues.'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. Relocation Plans (Evacuation Plan Draft and Approved Baseline)
-- ----------------------------------------------------------------------------
INSERT INTO relocation_plans (id, name, status, readiness_score, failure_reason, created_at, approved_at, approved_by, created_by, notes) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'Cyclone Alert Phase 1 - Coastal Evacuation Plan',
    'APPROVED',
    88.50,
    NULL,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '4 hours',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Initial pre-cyclone landfall evacuation plan allocating coastal habitations to high-capacity elevated centers.'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. Plan Assignments (Allocations linking Habitations to Shelters)
-- ----------------------------------------------------------------------------
INSERT INTO plan_assignments (id, plan_id, habitation_id, shelter_id, assigned_population, route_distance, route_status) VALUES
(
    'fa000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001', -- Balukhanda
    'c0000000-0000-0000-0000-000000000001', -- Gop Elevated Campus
    1250,
    9.20,
    'OPTIMAL'
),
(
    'fa000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002', -- Pentakota
    'c0000000-0000-0000-0000-000000000002', -- Secondary School Shelter
    1500,
    11.40,
    'VIABLE'
),
(
    'fa000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003', -- Chandanpur
    'c0000000-0000-0000-0000-000000000002', -- Secondary School Shelter
    850,
    4.10,
    'VIABLE'
),
(
    'fa000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000004', -- Satyabadi
    'c0000000-0000-0000-0000-000000000003', -- Satyabadi Resilience Center
    1400,
    3.20,
    'OPTIMAL'
)
ON CONFLICT (id) DO NOTHING;
