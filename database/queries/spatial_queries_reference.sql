-- ============================================================================
-- SafeSettle MVP - Milestone 1: Database Foundation
-- File: database/queries/spatial_queries_reference.sql
-- Description: Core PostGIS spatial queries demonstrating spatial filtering,
--              proximity calculations, risk intersection, and GeoJSON outputs.
-- ============================================================================

-- ============================================================================
-- 1. Identify Habitations Located Inside High-Risk / Hazard Zones
-- Uses: ST_Intersects / ST_Contains
-- Purpose: Pinpoint settlements requiring immediate mandatory evacuation.
-- ============================================================================
SELECT 
    h.id AS habitation_id,
    h.name AS habitation_name,
    h.population,
    h.vulnerable_population,
    h.risk_level AS habitation_risk_level,
    rz.name AS hazard_zone_name,
    rz.hazard_type,
    rz.risk_level AS zone_risk_level
FROM habitations h
JOIN risk_zones rz ON ST_Intersects(h.location, rz.geometry)
ORDER BY h.priority_score DESC;

-- ============================================================================
-- 2. Find Nearest Active Shelters to a Specific Habitation
-- Uses: ST_Distance (geography cast for accurate ground distance in meters/km)
-- Purpose: Relocation engine candidate shelter discovery.
-- ============================================================================
SELECT 
    s.id AS shelter_id,
    s.name AS shelter_name,
    s.status,
    s.functional_available_capacity,
    s.water_available,
    s.medical_support,
    ROUND((ST_Distance(s.location::geography, h.location::geography) / 1000.0)::numeric, 2) AS distance_km
FROM shelters s, habitations h
WHERE h.name = 'Balukhanda Fishermen Settlement'
  AND s.status = 'ACTIVE'
  AND s.functional_available_capacity >= h.population
ORDER BY s.location <-> h.location
LIMIT 5;

-- ============================================================================
-- 3. Detect Road Segments Inundated by Hazard Zones or Near Verified Blockages
-- Uses: ST_Intersects and ST_DWithin
-- Purpose: Invalidate compromised road segments during route computation.
-- ============================================================================
-- A. Roads intersecting hazard zones
SELECT 
    r.id AS road_id,
    r.name AS road_name,
    r.road_type,
    r.status AS current_road_status,
    rz.name AS intersecting_hazard_zone,
    rz.hazard_type
FROM roads r
JOIN risk_zones rz ON ST_Intersects(r.geometry, rz.geometry);

-- B. Roads within 100 meters of a VERIFIED incident report
SELECT 
    r.id AS road_id,
    r.name AS road_name,
    cr.report_type,
    cr.severity,
    cr.description AS report_description,
    ROUND(ST_Distance(r.geometry::geography, cr.location::geography)::numeric, 1) AS distance_meters
FROM roads r
JOIN citizen_reports cr ON ST_DWithin(r.geometry::geography, cr.location::geography, 100)
WHERE cr.status = 'VERIFIED';

-- ============================================================================
-- 4. Shelter Capacity vs Assignment Load Assessment
-- Purpose: Feasibility check ensuring shelters are not overloaded by plans.
-- ============================================================================
SELECT 
    s.id AS shelter_id,
    s.name AS shelter_name,
    s.physical_capacity,
    s.functional_available_capacity,
    COALESCE(SUM(pa.assigned_population), 0) AS total_assigned_in_plan,
    s.functional_available_capacity - COALESCE(SUM(pa.assigned_population), 0) AS remaining_headroom,
    CASE 
        WHEN COALESCE(SUM(pa.assigned_population), 0) > s.functional_available_capacity 
        THEN 'OVERLOADED'
        ELSE 'VIABLE'
    END AS feasibility_flag
FROM shelters s
LEFT JOIN plan_assignments pa ON s.id = pa.shelter_id
LEFT JOIN relocation_plans rp ON pa.plan_id = rp.id AND rp.status IN ('APPROVED', 'ACTIVE')
GROUP BY s.id, s.name, s.physical_capacity, s.functional_available_capacity;

-- ============================================================================
-- 5. Export GeoJSON Features for React / MapLibre Layer Rendering
-- Uses: ST_AsGeoJSON
-- Purpose: Backend FastAPI endpoint query for direct map visualization.
-- ============================================================================
-- Habitations Layer:
SELECT json_build_object(
    'type', 'FeatureCollection',
    'features', json_agg(
        json_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(location)::json,
            'properties', json_build_object(
                'name', name,
                'population', population,
                'vulnerable_population', vulnerable_population,
                'risk_level', risk_level,
                'priority_score', priority_score
            )
        )
    )
) AS habitations_geojson
FROM habitations;

-- Shelters Layer:
SELECT json_build_object(
    'type', 'FeatureCollection',
    'features', json_agg(
        json_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(location)::json,
            'properties', json_build_object(
                'name', name,
                'physical_capacity', physical_capacity,
                'current_occupancy', current_occupancy,
                'functional_available_capacity', functional_available_capacity,
                'water_available', water_available,
                'sanitation_available', sanitation_available,
                'medical_support', medical_support,
                'transport_available', transport_available,
                'status', status
            )
        )
    )
) AS shelters_geojson
FROM shelters;
