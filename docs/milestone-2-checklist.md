# SafeSettle MVP — Milestone 2: Pilot-Area GIS & Data Preparation Checklist

This checklist tracks the preparation, specification, and validation of the geospatial data foundation for the SafeSettle prototype.

---

## 1. Milestone 2 Deliverables Checklist

- [x] **GIS data model reviewed**
  - Evaluated existing database schema (`001_initial_schema.sql` and `002_verification_workflow.sql`).
  - Confirmed 5 spatial tables: `risk_zones`, `habitations`, `shelters`, `roads`, `citizen_reports`.
  - Confirmed relational integrity constraints and verification workflow decoupling.
  - Documented in [`docs/gis-data-plan.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-plan.md) and [`docs/gis-data-dictionary.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-dictionary.md).

- [x] **Pilot area documented**
  - Focus Region: Puri District coastal corridor, Odisha, Eastern India (Bay of Bengal coast to Gop/Satyabadi inland).
  - Geographic Bounding Box: 85.70°E – 85.90°E (Longitude), 19.75°N – 19.95°N (Latitude).
  - Explicit prototype notice documented: Seed data represents synthetic test scenarios and is not official government data.
  - Documented in [`docs/gis-data-plan.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-plan.md#2-pilot-geographic-scope).

- [x] **PostGIS geometry reviewed**
  - Confirmed native PostGIS geometry data types: `Point`, `LineString`, `MultiPolygon`.
  - Confirmed GiST indexing configured on all geometry columns.
  - Documented in [`docs/gis-data-dictionary.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-dictionary.md#1-summary-of-spatial-entities).

- [x] **SRID 4326 verified**
  - Confirmed coordinate reference system is EPSG:4326 (WGS 84, Longitude / Latitude) across all layers.
  - Verified compatibility with web mapping client libraries (MapLibre GL / Leaflet).
  - Documented in [`docs/gis-data-plan.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-plan.md#3-spatial-reference-system-standard).

- [x] **Risk zones verified**
  - Schema: `GEOMETRY(MultiPolygon, 4326)` with hazard types (`STORM_SURGE`, `FLOOD`) and risk tiers (`CRITICAL`, `HIGH`).
  - Symbology and containment rules specified in [`docs/gis-data-dictionary.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-dictionary.md#21-risk_zones).

- [x] **Habitations verified**
  - Schema: `GEOMETRY(Point, 4326)` with population metrics, vulnerability counts, and priority scores.
  - Proximity logic and visual representation documented in [`docs/gis-data-dictionary.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-dictionary.md#22-habitations).

- [x] **Shelters verified**
  - Schema: `GEOMETRY(Point, 4326)` with physical capacity, functional capacity, utility indicators, and operational status.
  - Capacity metrics and nearest-neighbor discovery documented in [`docs/gis-data-dictionary.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-dictionary.md#23-shelters).

- [x] **Roads verified**
  - Schema: `GEOMETRY(LineString, 4326)` with road classifications and real-time status flags (`CLEAR`, `FLOODED`, `BLOCKED`).
  - Line styling and proximity buffering documented in [`docs/gis-data-dictionary.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-dictionary.md#24-roads).

- [x] **Citizen reports verified**
  - Schema: `GEOMETRY(Point, 4326)` with verification integrity constraints and lifecycle states (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`).
  - Interaction with road corridors and audit trails documented in [`docs/gis-data-dictionary.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-dictionary.md#25-citizen_reports).

- [x] **Spatial validation queries prepared**
  - Created read-only SQL validation suite: [`database/queries/gis_validation.sql`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/database/queries/gis_validation.sql).
  - Covers record counts, SRID verification, `ST_IsValid` geometry checks, hazard zone intersections, shelter proximity ranking, and road incident buffering.
  - Schema-safe: Contains zero mutating statements.

---

## 2. Next Steps (Subsequent Milestones)
1. **Milestone 3 (Backend API Development)**:
   - Initialize FastAPI in `backend/`.
   - Implement asynchronous database connectivity to Supabase.
   - Expose GeoJSON endpoints leveraging `ST_AsGeoJSON` for the 5 GIS layers.
   - Implement citizen report verification endpoints.
2. **Milestone 4 (Frontend Geospatial Visualization)**:
   - Initialize React web client in `frontend/`.
   - Render vector layers via MapLibre GL using styling guidelines from [`docs/gis-data-dictionary.md`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/docs/gis-data-dictionary.md).
