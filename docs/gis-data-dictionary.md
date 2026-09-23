# SafeSettle MVP — GIS Data Dictionary

This document defines the schema, geometry specifications, attribute metadata, intended cartographic representation, and spatial relationships for all geospatial entities in the SafeSettle platform.

---

## 1. Summary of Spatial Entities

| Entity / Table | Geometry Primitive | PostGIS Type | SRID | Spatial Index | Primary Operational Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`risk_zones`** | MultiPolygon | `GEOMETRY(MultiPolygon, 4326)` | 4326 | GiST | Hazard, storm surge, and inundation perimeters |
| **`habitations`** | Point | `GEOMETRY(Point, 4326)` | 4326 | GiST | Vulnerable settlements & evacuation demand |
| **`shelters`** | Point | `GEOMETRY(Point, 4326)` | 4326 | GiST | Evacuation intake centers & resource supply |
| **`roads`** | LineString | `GEOMETRY(LineString, 4326)` | 4326 | GiST | Evacuation transit corridors & infrastructure state |
| **`citizen_reports`** | Point | `GEOMETRY(Point, 4326)` | 4326 | GiST | Crowdsourced field observations & incidents |

---

## 2. Entity Details

### 2.1 `risk_zones`
Delineated geographical perimeters indicating areas subject to hazard exposure (storm surges, riverine floods, landslides).

- **Database Table:** `risk_zones`
- **Geometry Type:** `MultiPolygon`
- **SRID:** `4326` (WGS 84, Longitude / Latitude)
- **Key Attributes:**
  - `id` (`UUID`): Primary key.
  - `name` (`VARCHAR(255)`): Descriptive name (e.g. *"Coastal Surge Zone Alpha"*).
  - `hazard_type` (`VARCHAR(100)`): Check-constrained enum (`FLOOD`, `LANDSLIDE`, `CYCLONE`, `STORM_SURGE`, `EARTHQUAKE`, `INDUSTRIAL_HAZARD`, `OTHER`).
  - `risk_level` (`VARCHAR(50)`): Check-constrained enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - `created_at` / `updated_at` (`TIMESTAMPTZ`): Record tracking timestamps.
- **Intended Map Representation:**
  - **Symbology:** Semi-transparent polygon fill with darker boundary stroke.
  - **Color Palette by Risk Level:**
    - `CRITICAL`: Fill `#EF4444` (Red, 35% opacity), Stroke `#B91C1C` (2px solid).
    - `HIGH`: Fill `#F97316` (Orange, 35% opacity), Stroke `#C2410C` (2px solid).
    - `MEDIUM`: Fill `#FBBF24` (Amber, 30% opacity), Stroke `#D97706` (1.5px solid).
    - `LOW`: Fill `#3B82F6` (Blue, 25% opacity), Stroke `#1D4ED8` (1px dashed).
  - **Interactive Features:** Hover tooltip showing hazard type and risk level; click popup displaying zone name, estimated population exposed, and weather advisory link.
- **Important Spatial Relationships:**
  - `ST_Intersects(habitations.location, risk_zones.geometry)`: Detects settlements inside danger zones.
  - `ST_Intersects(roads.geometry, risk_zones.geometry)`: Identifies road corridors currently inundated or threatened.
  - `ST_Contains(risk_zones.geometry, shelters.location)`: Safety integrity check ensuring shelters are **not** placed inside high-risk surge zones.

---

### 2.2 `habitations`
Settlements, coastal villages, bastis, or wards requiring potential or mandatory evacuation.

- **Database Table:** `habitations`
- **Geometry Type:** `Point` (settlement centroid)
- **SRID:** `4326` (WGS 84, Longitude / Latitude)
- **Key Attributes:**
  - `id` (`UUID`): Primary key.
  - `name` (`VARCHAR(255)`): Settlement name (e.g. *"Balukhanda Fishermen Settlement"*).
  - `population` (`INTEGER`): Total resident population (`>= 0`).
  - `vulnerable_population` (`INTEGER`): Count of elderly, children, pregnant women, and disabled residents (`0 <= vulnerable <= population`).
  - `risk_level` (`VARCHAR(50)`): Check-constrained enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - `priority_score` (`NUMERIC(5,2)`): Urgency score (`>= 0.0`), calculated from vulnerability ratio and hazard exposure.
- **Intended Map Representation:**
  - **Symbology:** Circular point markers with proportional radius scaled by population or priority score.
  - **Marker Colors:**
    - `CRITICAL`: Marker fill `#DC2626` (Deep Red) with white border.
    - `HIGH`: Marker fill `#EA580C` (Dark Orange).
    - `MEDIUM`: Marker fill `#D97706` (Amber).
    - `LOW`: Marker fill `#16A34A` (Green).
  - **Badge / Label:** Priority score badge (e.g., `94.5`) visible at medium-to-high zoom levels.
  - **Interactive Features:** Click popup displaying total population, vulnerable population count, priority score, and current assigned shelter.
- **Important Spatial Relationships:**
  - `ST_Intersects(location, risk_zones.geometry)`: Establishes hazard zone containment.
  - `ST_Distance(location::geography, shelters.location::geography)`: Determines candidate shelter proximity in meters/kilometers.
  - `ST_DWithin(location::geography, roads.geometry::geography, 500)`: Finds nearby arterial road access nodes.

---

### 2.3 `shelters`
Authorized evacuation centers, cyclone relief shelters, and elevated institutional campuses.

- **Database Table:** `shelters`
- **Geometry Type:** `Point` (facility entrance/centroid coordinate)
- **SRID:** `4326` (WGS 84, Longitude / Latitude)
- **Key Attributes:**
  - `id` (`UUID`): Primary key.
  - `name` (`VARCHAR(255)`): Facility name (e.g. *"Gop Multipurpose Cyclone Shelter"*).
  - `physical_capacity` (`INTEGER`): Maximum structural capacity (`> 0`).
  - `current_occupancy` (`INTEGER`): Currently admitted persons (`>= 0`).
  - `functional_available_capacity` (`INTEGER`): Usable remaining capacity factoring water/sanitation status.
  - `water_available` (`BOOLEAN`): Potable water supply indicator.
  - `sanitation_available` (`BOOLEAN`): Functional toilets/sanitation indicator.
  - `medical_support` (`BOOLEAN`): Medical team / first-aid station indicator.
  - `transport_available` (`BOOLEAN`): Evacuation shuttle staging indicator.
  - `status` (`VARCHAR(50)`): Check-constrained enum (`ACTIVE`, `INACTIVE`, `FULL`, `DAMAGED`).
- **Intended Map Representation:**
  - **Symbology:** Square or shield icon marker containing a home/shelter symbol.
  - **Status Colors:**
    - `ACTIVE`: Marker fill `#059669` (Emerald Green).
    - `FULL`: Marker fill `#D97706` (Amber / Yellow).
    - `INACTIVE`: Marker fill `#6B7280` (Gray).
    - `DAMAGED`: Marker fill `#DC2626` (Red with hazard cross).
  - **Capacity Meter:** Mini progress bar in popup or badge showing `current_occupancy / physical_capacity`.
  - **Utility Icons:** Visual badges for Water, Sanitation, Medical, and Transport availability.
- **Important Spatial Relationships:**
  - `ST_Distance(location::geography, habitations.location::geography)`: Used for nearest-neighbor allocation.
  - `ST_DWithin(location::geography, roads.geometry::geography, 200)`: Confirms vehicular access to road network.
  - Reverse spatial join via `plan_assignments`: Tracks total population routed from all habitations to verify capacity headroom.

---

### 2.4 `roads`
Evacuation corridors and transit infrastructure connecting habitations to shelters.

- **Database Table:** `roads`
- **Geometry Type:** `LineString`
- **SRID:** `4326` (WGS 84, Longitude / Latitude)
- **Key Attributes:**
  - `id` (`UUID`): Primary key.
  - `name` (`VARCHAR(255)`): Route name (e.g. *"NH-316 Coastal Arterial Route"*).
  - `road_type` (`VARCHAR(50)`): Check-constrained enum (`HIGHWAY`, `PRIMARY`, `SECONDARY`, `TERTIARY`, `TRACK`, `BRIDGE`).
  - `status` (`VARCHAR(50)`): Operational trafficability (`CLEAR`, `CONGESTED`, `FLOODED`, `BLOCKED`, `DAMAGED`).
- **Intended Map Representation:**
  - **Line Width by Classification:**
    - `HIGHWAY`: 5px stroke.
    - `PRIMARY`: 4px stroke.
    - `SECONDARY`: 3px stroke.
    - `TERTIARY` / `TRACK`: 2px stroke.
    - `BRIDGE`: 4px stroke with bridge symbology / cased line.
  - **Line Stroke Color by Operational Status:**
    - `CLEAR`: `#10B981` (Solid Green).
    - `CONGESTED`: `#F59E0B` (Amber / Yellow).
    - `FLOODED`: `#0284C7` (Cyan / Wave dash pattern).
    - `BLOCKED`: `#EF4444` (Solid Red with crosshatch).
    - `DAMAGED`: `#7F1D1D` (Dark Red, dashed).
- **Important Spatial Relationships:**
  - `ST_Intersects(geometry, risk_zones.geometry)`: Detects road segments crossing active hazard inundation zones.
  - `ST_DWithin(geometry::geography, citizen_reports.location::geography, 100)`: Detects roads within proximity of verified incident reports (e.g., fallen trees, washouts).
  - Topological connectivity with habitations and shelters for graph routing solvers.

---

### 2.5 `citizen_reports`
Crowdsourced field reports submitted by citizens, village heads, or quick-response volunteers.

- **Database Table:** `citizen_reports`
- **Geometry Type:** `Point`
- **SRID:** `4326` (WGS 84, Longitude / Latitude)
- **Key Attributes:**
  - `id` (`UUID`): Primary key.
  - `report_type` (`VARCHAR(100)`): Check-constrained enum (`ROAD_BLOCKED`, `FLOODING`, `SHELTER_OVERFLOW`, `BRIDGE_COLLAPSE`, `MEDICAL_EMERGENCY`, `STRANDED_PERSONS`, `OTHER`).
  - `description` (`TEXT`): Ground details submitted by observer.
  - `severity` (`VARCHAR(50)`): Check-constrained enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - `status` (`VARCHAR(50)`): Multi-stage workflow status (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`).
  - `created_at` (`TIMESTAMPTZ`): Submission timestamp.
  - `verified_at` (`TIMESTAMPTZ`): Authority review timestamp.
  - `verified_by` (`UUID`): Foreign key to `users(id)`.
  - `verification_notes` (`TEXT`): Official justification.
- **Intended Map Representation:**
  - **Symbology:** Warning exclamation pin icon.
  - **Status Styling:**
    - `PENDING_VERIFICATION`: Flashing yellow/amber marker with question mark.
    - `VERIFIED`: Solid red/orange pin with warning badge.
    - `REJECTED`: Faded gray marker (hidden by default on operational maps, visible in audit console).
  - **Interactive Features:** Authority quick-action modal allowing officers to review description, verify/reject, and trigger operational GIS status updates.
- **Important Spatial Relationships:**
  - `ST_DWithin(location::geography, roads.geometry::geography, 100)`: Associates incident reports with target road segments for authority confirmation.
  - `ST_DWithin(location::geography, shelters.location::geography, 200)`: Associates shelter overflow reports with target shelter facilities.
