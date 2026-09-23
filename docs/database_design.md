# SafeSettle MVP — Database Design & Schema Specification

## 1. Design Principles

1. **Native Spatial First**: Every spatial entity (`habitations`, `shelters`, `roads`, `risk_zones`, `citizen_reports`) leverages PostGIS geometries rather than raw longitude/latitude float pairs, enabling native spatial indexing and topology operations.
2. **Standardized Coordinate Reference**: All spatial attributes are strictly defined using **SRID 4326** (WGS 84 coordinate system with coordinates stored as `(Longitude, Latitude)`).
3. **Decoupled Verification Lifecycle**: Ground reports from citizens remain strictly isolated in `citizen_reports` under `PENDING_VERIFICATION` until verified by authorized personnel. They never mutate operational tables directly.
4. **Relational & Spatial Integrity**: Foreign key constraints, range checks (e.g. population non-negative, vulnerable population bounded), and state machine constraints are enforced directly at the SQL level.
5. **High-Performance Spatial Indexing**: Every geometry column is indexed using Generalized Search Trees (`GiST`), optimizing bounding-box queries (`&&`), distance filtering (`ST_DWithin`), and intersection checks (`ST_Intersects`).

---

## 2. Entity Dictionary

### 2.1 `users`
Operational actors managing or interacting with the evacuation system.
- `id` (UUID, PK): Auto-generated unique identifier.
- `email` (VARCHAR(255), UNIQUE, NOT NULL): Official identity handle.
- `full_name` (VARCHAR(255), NOT NULL): Name of officer/citizen.
- `role` (VARCHAR(50), NOT NULL): Enum check (`ADMIN`, `DISASTER_OFFICER`, `FIELD_RESPONDER`, `CITIZEN`).
- `phone` (VARCHAR(50)): Emergency contact number.
- `department` (VARCHAR(100)): Organization or responder wing.
- `created_at` / `updated_at` (TIMESTAMPTZ): Standard audit timestamps.

### 2.2 `habitations`
Settlements, villages, or urban wards vulnerable to disaster hazards.
- `id` (UUID, PK): Unique identifier.
- `name` (VARCHAR(255), NOT NULL): Settlement name.
- `population` (INTEGER, NOT NULL): Total resident count (`>= 0`).
- `vulnerable_population` (INTEGER, NOT NULL): Count of elderly, infants, disabled (`0 <= vulnerable <= population`).
- `risk_level` (VARCHAR(50), NOT NULL): Risk category (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `priority_score` (NUMERIC(5, 2), NOT NULL): Calculated urgency score (`>= 0.0`).
- `location` (GEOMETRY(Point, 4326), NOT NULL): Settlement centroid. Indexed with GiST.

### 2.3 `shelters`
Designated evacuation centers and relief camps.
- `id` (UUID, PK): Unique identifier.
- `name` (VARCHAR(255), NOT NULL): Facility name.
- `physical_capacity` (INTEGER, NOT NULL): Maximum total head-count (`> 0`).
- `current_occupancy` (INTEGER, NOT NULL): Currently admitted evacuees (`>= 0`).
- `functional_available_capacity` (INTEGER, NOT NULL): Usable remaining capacity factoring resources (`>= 0`).
- `water_available` (BOOLEAN, NOT NULL): Potable water supply indicator.
- `sanitation_available` (BOOLEAN, NOT NULL): Functional toilets and sanitation indicator.
- `medical_support` (BOOLEAN, NOT NULL): On-site paramedic / medical kit presence.
- `transport_available` (BOOLEAN, NOT NULL): Evacuation vehicle availability at site.
- `status` (VARCHAR(50), NOT NULL): Operational state (`ACTIVE`, `INACTIVE`, `FULL`, `DAMAGED`).
- `location` (GEOMETRY(Point, 4326), NOT NULL): Facility coordinates. Indexed with GiST.

### 2.4 `roads`
Transit arteries and evacuation corridors connecting settlements to shelters.
- `id` (UUID, PK): Unique identifier.
- `name` (VARCHAR(255), NOT NULL): Highway or local road name.
- `status` (VARCHAR(50), NOT NULL): Trafficability state (`CLEAR`, `CONGESTED`, `FLOODED`, `BLOCKED`, `DAMAGED`).
- `road_type` (VARCHAR(50), NOT NULL): Infrastructure category (`HIGHWAY`, `PRIMARY`, `SECONDARY`, `TERTIARY`, `TRACK`, `BRIDGE`).
- `geometry` (GEOMETRY(LineString, 4326), NOT NULL): Spatial trace of the road. Indexed with GiST.

### 2.5 `risk_zones`
Delineated hazard perimeters (inundation zones, landslide slips, storm surge belts).
- `id` (UUID, PK): Unique identifier.
- `name` (VARCHAR(255), NOT NULL): Zone identifier.
- `hazard_type` (VARCHAR(100), NOT NULL): Type (`FLOOD`, `LANDSLIDE`, `CYCLONE`, `STORM_SURGE`, `EARTHQUAKE`, `INDUSTRIAL_HAZARD`, `OTHER`).
- `risk_level` (VARCHAR(50), NOT NULL): Severity level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `geometry` (GEOMETRY(MultiPolygon, 4326), NOT NULL): Spatial area polygon. Indexed with GiST.

### 2.6 `citizen_reports`
Crowdsourced field reports submitted by citizens and local observers.
- `id` (UUID, PK): Unique identifier.
- `report_type` (VARCHAR(100), NOT NULL): Category (`ROAD_BLOCKED`, `FLOODING`, `SHELTER_OVERFLOW`, `BRIDGE_COLLAPSE`, `MEDICAL_EMERGENCY`, `STRANDED_PERSONS`, `OTHER`).
- `description` (TEXT, NOT NULL): Narrative details submitted by observer.
- `severity` (VARCHAR(50), NOT NULL): Incident severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `status` (VARCHAR(50), NOT NULL): Verification status (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`).
- `location` (GEOMETRY(Point, 4326), NOT NULL): Geographic location of incident. Indexed with GiST.
- `created_at` (TIMESTAMPTZ, NOT NULL): Submission timestamp.
- `verified_at` (TIMESTAMPTZ): Authority verification timestamp.
- `verified_by` (UUID, FK -> users): Officer performing verification.
- `verification_notes` (TEXT): Assessment justification.
- **Integrity Constraint**:
  ```sql
  CONSTRAINT chk_citizen_report_verification_integrity CHECK (
      (status = 'PENDING_VERIFICATION' AND verified_at IS NULL AND verified_by IS NULL)
      OR
      (status IN ('VERIFIED', 'REJECTED') AND verified_at IS NOT NULL)
  )
  ```

### 2.7 `relocation_plans`
Formulated evacuation operations associating multiple habitation evacuations.
- `id` (UUID, PK): Unique identifier.
- `name` (VARCHAR(255), NOT NULL): Plan title (e.g. "Cyclone Alert Phase 1").
- `status` (VARCHAR(50), NOT NULL): Lifecycle phase (`DRAFT`, `GENERATED`, `FEASIBILITY_CHECK_PASSED`, `FEASIBILITY_CHECK_FAILED`, `APPROVED`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
- `readiness_score` (NUMERIC(5, 2)): Overall readiness percentage (0.00 to 100.00).
- `failure_reason` (TEXT): Detailed explanation if feasibility check failed.
- `created_at` / `approved_at` (TIMESTAMPTZ): Plan lifecycle dates.
- `approved_by` (UUID, FK -> users): Authorized disaster commissioner/collector.
- `created_by` (UUID, FK -> users): Planner who generated scenario.

### 2.8 `plan_assignments`
Atomic assignments mapping an individual habitation to a target shelter within a relocation plan.
- `id` (UUID, PK): Unique identifier.
- `plan_id` (UUID, FK -> relocation_plans, ON DELETE CASCADE): Parent plan.
- `habitation_id` (UUID, FK -> habitations, ON DELETE RESTRICT): Source settlement.
- `shelter_id` (UUID, FK -> shelters, ON DELETE RESTRICT): Destination shelter.
- `assigned_population` (INTEGER, NOT NULL): Number of evacuees routed.
- `route_distance` (NUMERIC(10, 2)): Path length in kilometers.
- `route_status` (VARCHAR(50), NOT NULL): Operational corridor state (`OPTIMAL`, `VIABLE`, `COMPROMISED`, `BLOCKED`, `NEEDS_REASSIGNMENT`).
- `assigned_at` / `updated_at` (TIMESTAMPTZ): Timestamps.
- **Unique Constraint**: `uq_plan_habitation_shelter UNIQUE (plan_id, habitation_id, shelter_id)`.

---

## 3. PostGIS Indexing & Spatial Logic

### Why GiST (Generalized Search Tree)?
Standard B-Trees can only index single-dimensional scalar values. Spatial geometries are multi-dimensional bounding boxes. PostGIS GiST indexes implement an R-Tree structure over bounding boxes (`ST_Envelope`), enabling logarithmic-time queries:
- Bounding Box Intersects: `geom1 && geom2`
- Distance radius: `ST_DWithin(geom1, geom2, distance_in_meters)`
- Geometry Intersect: `ST_Intersects(geom1, geom2)`

### Spatial Indexes Configured:
```sql
CREATE INDEX idx_habitations_location ON habitations USING GIST (location);
CREATE INDEX idx_shelters_location ON shelters USING GIST (location);
CREATE INDEX idx_roads_geometry ON roads USING GIST (geometry);
CREATE INDEX idx_risk_zones_geometry ON risk_zones USING GIST (geometry);
CREATE INDEX idx_citizen_reports_location ON citizen_reports USING GIST (location);
```
