-- ============================================================================
-- SafeSettle MVP — Milestone 2: Pilot-Area GIS Validation Queries
-- File: database/queries/gis_validation.sql
-- Description: Read-only PostGIS spatial validation queries for the Puri coastal
--              pilot scenario. Validates geometry integrity, coordinate SRID (4326),
--              record counts, and spatial relationships.
-- NOTE: Read-only queries only. Does NOT modify database state or schema.
-- ============================================================================

-- Ensure PostGIS spatial functions are discoverable across schemas
SET search_path TO public, postgis, extensions;

-- ============================================================================
-- 1. Table Record Counts Summary
-- Verifies seeded record existence across all geospatial & operational tables.
-- ============================================================================
SELECT 'risk_zones' AS table_name, COUNT(*) AS record_count FROM risk_zones
UNION ALL
SELECT 'habitations', COUNT(*) FROM habitations
UNION ALL
SELECT 'shelters', COUNT(*) FROM shelters
UNION ALL
SELECT 'roads', COUNT(*) FROM roads
UNION ALL
SELECT 'citizen_reports', COUNT(*) FROM citizen_reports
UNION ALL
SELECT 'relocation_plans', COUNT(*) FROM relocation_plans
UNION ALL
SELECT 'plan_assignments', COUNT(*) FROM plan_assignments
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- ============================================================================
-- 2. Spatial Reference System (SRID) Verification
-- Confirms all geometry columns adhere to EPSG/SRID 4326 (WGS 84).
-- Expected: SRID = 4326 and invalid_srid_count = 0 for every entity.
-- ============================================================================
SELECT 
    'risk_zones' AS table_name,
    COUNT(*) AS total_features,
    COUNT(CASE WHEN ST_SRID(geometry) = 4326 THEN 1 END) AS valid_srid_4326_count,
    COUNT(CASE WHEN ST_SRID(geometry) != 4326 OR geometry IS NULL THEN 1 END) AS invalid_srid_count
FROM risk_zones
UNION ALL
SELECT 
    'habitations',
    COUNT(*),
    COUNT(CASE WHEN ST_SRID(location) = 4326 THEN 1 END),
    COUNT(CASE WHEN ST_SRID(location) != 4326 OR location IS NULL THEN 1 END)
FROM habitations
UNION ALL
SELECT 
    'shelters',
    COUNT(*),
    COUNT(CASE WHEN ST_SRID(location) = 4326 THEN 1 END),
    COUNT(CASE WHEN ST_SRID(location) != 4326 OR location IS NULL THEN 1 END)
FROM shelters
UNION ALL
SELECT 
    'roads',
    COUNT(*),
    COUNT(CASE WHEN ST_SRID(geometry) = 4326 THEN 1 END),
    COUNT(CASE WHEN ST_SRID(geometry) != 4326 OR geometry IS NULL THEN 1 END)
FROM roads
UNION ALL
SELECT 
    'citizen_reports',
    COUNT(*),
    COUNT(CASE WHEN ST_SRID(location) = 4326 THEN 1 END),
    COUNT(CASE WHEN ST_SRID(location) != 4326 OR location IS NULL THEN 1 END)
FROM citizen_reports;

-- ============================================================================
-- 3. Geometry Validity Checks (ST_IsValid & ST_GeometryType)
-- Ensures all geometries are mathematically valid (no self-intersections,
-- degenerate rings, or malformed points).
-- ============================================================================

-- 3A. Risk Zones (MultiPolygon validation)
SELECT 
    id,
    name,
    hazard_type,
    risk_level,
    ST_GeometryType(geometry) AS geometry_type,
    ST_IsValid(geometry) AS is_valid,
    ST_IsValidReason(geometry) AS validity_reason,
    ST_NPoints(geometry) AS vertex_count,
    ROUND(ST_Area(geometry::geography) / 1000000.0, 2) AS approx_area_sq_km
FROM risk_zones;

-- 3B. Habitations (Point validation)
SELECT 
    id,
    name,
    population,
    risk_level,
    ST_GeometryType(location) AS geometry_type,
    ST_IsValid(location) AS is_valid,
    ROUND(ST_X(location)::numeric, 4) AS longitude,
    ROUND(ST_Y(location)::numeric, 4) AS latitude
FROM habitations;

-- 3C. Shelters (Point validation)
SELECT 
    id,
    name,
    physical_capacity,
    functional_available_capacity,
    status,
    ST_GeometryType(location) AS geometry_type,
    ST_IsValid(location) AS is_valid,
    ROUND(ST_X(location)::numeric, 4) AS longitude,
    ROUND(ST_Y(location)::numeric, 4) AS latitude
FROM shelters;

-- 3D. Roads (LineString validation)
SELECT 
    id,
    name,
    road_type,
    status,
    ST_GeometryType(geometry) AS geometry_type,
    ST_IsValid(geometry) AS is_valid,
    ST_NPoints(geometry) AS segment_points,
    ROUND((ST_Length(geometry::geography) / 1000.0)::numeric, 2) AS length_km
FROM roads;

-- 3E. Citizen Reports (Point validation)
SELECT 
    id,
    report_type,
    severity,
    status,
    ST_GeometryType(location) AS geometry_type,
    ST_IsValid(location) AS is_valid,
    ROUND(ST_X(location)::numeric, 4) AS longitude,
    ROUND(ST_Y(location)::numeric, 4) AS latitude
FROM citizen_reports;

-- ============================================================================
-- 4. Spatial Relationship: Habitations Intersecting Risk Zones
-- Identifies which settlements fall inside active hazard / inundation polygons.
-- Uses: ST_Intersects
-- ============================================================================
SELECT 
    h.id AS habitation_id,
    h.name AS habitation_name,
    h.population,
    h.vulnerable_population,
    h.risk_level AS habitation_risk_level,
    h.priority_score,
    rz.id AS zone_id,
    rz.name AS hazard_zone_name,
    rz.hazard_type,
    rz.risk_level AS hazard_zone_risk_level
FROM habitations h
JOIN risk_zones rz ON ST_Intersects(h.location, rz.geometry)
ORDER BY h.priority_score DESC;

-- ============================================================================
-- 5. Spatial Relationship: Shelters Near Habitations
-- Calculates true geodetic ground distance (km) from each settlement to shelters,
-- ranked from nearest to farthest.
-- Uses: ST_Distance with geography cast
-- ============================================================================
SELECT 
    h.name AS habitation_name,
    h.population AS habitation_population,
    s.name AS shelter_name,
    s.status AS shelter_status,
    s.physical_capacity,
    s.functional_available_capacity,
    ROUND((ST_Distance(h.location::geography, s.location::geography) / 1000.0)::numeric, 2) AS distance_km,
    CASE 
        WHEN s.functional_available_capacity >= h.population THEN 'SUFFICIENT_CAPACITY'
        ELSE 'CAPACITY_DEFICIT'
    END AS capacity_fit
FROM habitations h
CROSS JOIN shelters s
ORDER BY h.name, distance_km ASC;

-- ============================================================================
-- 6. Spatial Relationship: Evacuation Roads Near Habitations
-- Detects access corridors within 2 km of each habitation.
-- Uses: ST_DWithin and ST_Distance with geography cast
-- ============================================================================
SELECT 
    h.name AS habitation_name,
    r.name AS road_name,
    r.road_type,
    r.status AS road_status,
    ROUND(ST_Distance(h.location::geography, r.geometry::geography)::numeric, 0) AS distance_meters
FROM habitations h
JOIN roads r ON ST_DWithin(h.location::geography, r.geometry::geography, 2000)
ORDER BY h.name, distance_meters ASC;

-- ============================================================================
-- 7. Spatial Relationship: Citizen Incident Reports Near Roads
-- Buffers road corridors to detect reported hazards (blockages, flooding)
-- within 150 meters of transit infrastructure.
-- Uses: ST_DWithin and ST_Distance with geography cast
-- ============================================================================
SELECT 
    r.id AS road_id,
    r.name AS road_name,
    r.status AS road_current_status,
    cr.id AS report_id,
    cr.report_type,
    cr.severity AS report_severity,
    cr.status AS report_verification_status,
    cr.description AS report_description,
    ROUND(ST_Distance(r.geometry::geography, cr.location::geography)::numeric, 1) AS distance_meters
FROM roads r
JOIN citizen_reports cr ON ST_DWithin(r.geometry::geography, cr.location::geography, 150)
ORDER BY r.name, distance_meters ASC;
