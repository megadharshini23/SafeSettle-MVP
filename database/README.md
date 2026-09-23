# SafeSettle Database Architecture (Supabase + PostGIS)

## Overview

SafeSettle utilizes **PostgreSQL** extended with **PostGIS** (hosted seamlessly via **Supabase**) to manage geospatial operations for disaster-relocation decision-support. 

Spatial data is represented using **SRID 4326** (WGS 84 coordinate reference system: Longitude, Latitude) and indexed via Generalized Search Trees (**GiST**) for high-performance spatial querying.

---

## Directory Structure

```
database/
├── README.md                              # This setup and reference guide
├── migrations/
│   ├── 001_initial_schema.sql             # Core tables, constraints, GiST indexes, updated_at triggers
│   ├── 002_verification_workflow.sql      # Multi-stage verification workflow, audit logs, recheck views
│   └── 003_seed_data.sql                  # Realistic coastal disaster scenario test data (Puri corridor)
└── queries/
    └── spatial_queries_reference.sql      # PostGIS queries (ST_Intersects, ST_Distance, GeoJSON exports)
```

---

## Entity-Relationship Summary

| Entity | Primary Key | Key Geographic Column | Geometry Type | SRID | Index Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `users` | UUID | — | — | — | B-Tree |
| `habitations` | UUID | `location` | `POINT` | 4326 | GiST |
| `shelters` | UUID | `location` | `POINT` | 4326 | GiST |
| `roads` | UUID | `geometry` | `LINESTRING` | 4326 | GiST |
| `risk_zones` | UUID | `geometry` | `MULTIPOLYGON` | 4326 | GiST |
| `citizen_reports` | UUID | `location` | `POINT` | 4326 | GiST |
| `relocation_plans` | UUID | — | — | — | B-Tree |
| `plan_assignments`| UUID | — | — | — | B-Tree (FKs to Habitation & Shelter) |
| `report_verification_actions` | UUID | — | — | — | B-Tree (Audit log) |

---

## Lifecycle Architecture: Citizen Incident to Relocation Adaptation

A critical principle of SafeSettle is that **crowdsourced citizen reports must never directly modify official operational infrastructure**. 

The database implements a controlled 5-stage lifecycle:

```mermaid
flowchart TD
    A["Citizen Report (PENDING_VERIFICATION)"] --> B{"Authority Review (Disaster Officer / Field Responder)"}
    B -- Spurious / False Alarm --> C["Status: REJECTED (Logged in Audit)"]
    B -- Validated Incident --> D["Status: VERIFIED (Logged in Audit)"]
    D --> E["Official GIS Update (Road marked BLOCKED / Shelter marked DAMAGED)"]
    E --> F["Plan Feasibility Re-check (v_plan_assignment_health / recheck_plan_feasibility)"]
    F --> G["Decision Engine: Reroute / Reassign Compromised Habitations"]
```

### 1. Citizen Report Submission
- New reports start with `status = 'PENDING_VERIFICATION'`.
- Enforced constraint: `chk_citizen_report_verification_integrity` ensures `verified_at` and `verified_by` remain `NULL` until reviewed.

### 2. Authority Verification
- Authorized disaster response personnel invoke `verify_citizen_report(report_id, verifier_id, 'VERIFIED' | 'REJECTED', notes)`.
- Logs record to `report_verification_actions`.

### 3. Operational GIS Update
- An officer explicitly evaluates ground reality and updates official data via `apply_verified_report_to_gis(report_id, officer_id, 'ROAD' | 'SHELTER', entity_id, new_status, notes)`.
- The official road/shelter status is updated in its authoritative table.

### 4. Feasibility Re-check
- Running `recheck_plan_feasibility(plan_id)` or querying `v_plan_assignment_health` checks if any assignment in an approved plan is assigned to a shelter that is no longer `ACTIVE` or exceeds functional capacity.
- Compromised assignments are flagged with `route_status = 'COMPROMISED'`.
- The plan status transitions to `FEASIBILITY_CHECK_FAILED` with an explanatory reason.

### 5. Repair / Reassignment / Rerouting
- In subsequent milestones, the FastAPI backend will trigger relocation reassignment algorithms to select viable alternative routes or fallback shelters.

---

## How to Apply Migrations to Supabase

### Option A: Using the Supabase Web Dashboard (Recommended for Fast Setup)
1. Log in to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor** tab on the left sidebar.
3. Open and run the migration scripts sequentially:
   - Run `database/migrations/001_initial_schema.sql`
   - Run `database/migrations/002_verification_workflow.sql`
   - Run `database/migrations/003_seed_data.sql`
4. Confirm tables and extensions under the **Table Editor** and **Database -> Extensions** tabs.

### Option B: Using the Supabase CLI
```bash
# Link project (requires SUPABASE_ACCESS_TOKEN and project ID)
supabase link --project-ref your-project-ref

# Apply SQL migrations
supabase db push
```

### Option C: Using Direct psql Connection
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f database/migrations/001_initial_schema.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f database/migrations/002_verification_workflow.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f database/migrations/003_seed_data.sql
```

---

## PostGIS Spatial Queries in Action

See [`database/queries/spatial_queries_reference.sql`](file:///C:/Users/imadh/OneDrive/Desktop/SafeSettle-MVP/database/queries/spatial_queries_reference.sql) for practical queries demonstrating:
- Intersecting settlements with cyclone/flood hazard zones (`ST_Intersects`)
- Nearest neighbor shelter search (`ST_Distance` on geography)
- Buffering citizen incident reports to identify affected roads (`ST_DWithin`)
- Generating GeoJSON directly in PostgreSQL for React map components (`ST_AsGeoJSON`)
