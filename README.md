# SafeSettle (SIH 2026 MVP)

**Disaster-Relocation Decision-Support Platform**

SafeSettle is an intelligent geospatial decision-support platform designed to assist disaster response authorities during extreme events (such as cyclones, floods, and storm surges). It bridges crowdsourced field intelligence with coordinated, capacity-aware evacuation planning and dynamic corridor rerouting.

---

## Current Milestone: Milestone 1 — Supabase + PostGIS Foundation

**Status:** Completed & Ready for Review

The primary focus of this milestone is establishing a clean, robust, and mathematically sound database foundation using **PostgreSQL** with the **PostGIS** extension (compatible with Supabase), without prematurely introducing unneeded complexity or frontend/AI mocks.

### Milestone 1 Achievements:
- Clean modular workspace layout (`frontend/`, `backend/`, `database/`, `docs/`).
- Complete PostgreSQL + PostGIS schema covering 8 core operational entities.
- Spatial geometry definitions using **SRID 4326** with **GiST** spatial indexes.
- Decoupled citizen report verification workflow:
  `PENDING_VERIFICATION` → `VERIFIED` or `REJECTED` (with audit trail and protected operational infrastructure).
- Analytical health view and stored procedures for plan feasibility re-checking.
- Geographically coherent seed dataset based on a realistic coastal disaster corridor (Puri, Odisha).
- Comprehensive `.gitignore` and `.env.example` templates preventing credential leakage.

---

## Project Structure

```
SafeSettle-MVP/
├── .env.example                               # Root template for environment variables
├── .gitignore                                 # Git ignore for Node.js, Python, VS Code, secrets
├── README.md                                  # Main project documentation
├── backend/
│   ├── .env.example                           # FastAPI backend environment template
│   └── README.md                              # Backend placeholder (FastAPI - Milestone 2)
├── frontend/
│   ├── .env.example                           # React frontend environment template
│   └── README.md                              # Frontend placeholder (React - Milestone 3)
├── database/
│   ├── README.md                              # Database setup and migration guide
│   ├── migrations/
│   │   ├── 001_initial_schema.sql             # Tables, constraints, GiST indexes, triggers
│   │   ├── 002_verification_workflow.sql      # Multi-stage verification, audit logs, recheck views
│   │   └── 003_seed_data.sql                  # Coastal flood scenario seed data (SRID 4326)
│   └── queries/
│       └── spatial_queries_reference.sql      # PostGIS queries (ST_Intersects, ST_Distance, GeoJSON)
└── docs/
    ├── architecture.md                        # Overall system architecture and sequence diagrams
    └── database_design.md                     # Entity specifications and spatial logic details
```

---

## Database Purpose & Core Entities

The database provides a single source of truth for disaster operational data, separating unverified field reports from authoritative emergency models:

1. **`users`**: System roles (`ADMIN`, `DISASTER_OFFICER`, `FIELD_RESPONDER`, `CITIZEN`).
2. **`habitations`**: Vulnerable settlements with population, vulnerability counts, and geographic coordinates (`Point`).
3. **`shelters`**: Evacuation shelters with physical capacity, functional available capacity, utility flags, and coordinates (`Point`).
4. **`roads`**: Transit network segments with road classification, operational status, and line paths (`LineString`).
5. **`risk_zones`**: Hazard areas (cyclone surge, inundation zones) defined as spatial polygons (`MultiPolygon`).
6. **`citizen_reports`**: Field reports from citizens (`Point`), enforced with verification constraints (`PENDING_VERIFICATION` → `VERIFIED` | `REJECTED`).
7. **`relocation_plans`**: Evacuation plans with status tracking, readiness scores, and approval audit fields.
8. **`plan_assignments`**: Specific pairings of habitations to target shelters with route distances and viability states.
9. **`report_verification_actions`**: Audit log recording authority decisions and operational GIS adjustments.

---

## How PostGIS is Used

PostGIS elevates PostgreSQL from a traditional relational database into a high-performance geographic information system:

- **Standard Coordinate System (SRID 4326)**: All geometries represent standard longitude and latitude coordinates (WGS 84), making them directly compatible with modern web mapping libraries (MapLibre GL, Leaflet, Mapbox).
- **GiST Spatial Indexing**: Enables sub-millisecond execution of spatial relationship filters across large geographic footprints.
- **Spatial Relationship Detection (`ST_Intersects`, `ST_Contains`)**: Automatically determines which habitations and road segments lie within high-risk flood polygons.
- **Proximity Calculations (`ST_Distance`, `ST_DWithin`)**: Computes distances between settlements and shelters, as well as detecting whether verified incident reports fall within transit corridor buffers.
- **Direct GeoJSON Generation (`ST_AsGeoJSON`)**: Enables the backend to serialize spatial records directly into standard GeoJSON feature collections for the React map layers.

---

## Security & Secrets Management

> [!IMPORTANT]
> **NEVER commit real credentials, passwords, or service role keys to version control.**
> Real credentials must remain exclusively in local `.env` files (e.g., `.env`, `backend/.env`, `frontend/.env`), which are strictly excluded by `.gitignore`.

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate the `.env` file with your private Supabase database URL, anon key, and service role key.
3. Keep public and client-side keys limited to the public anonymous key (`VITE_SUPABASE_ANON_KEY`); never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code.

---

## Next Steps (Milestone 2)

Following confirmation of Milestone 1:
- Initialize the **FastAPI** backend application in `backend/`.
- Establish asynchronous database connections using SQLAlchemy and asyncpg.
- Implement REST API endpoints for GeoJSON spatial data retrieval.
- Build the report verification workflow endpoints.
