# SafeSettle Backend (FastAPI)

## Status: Reserved for Upcoming Milestone

This directory is designated for the FastAPI backend application in subsequent milestones.

### Planned Capabilities
- **Spatial REST API**: Endpoints serving GeoJSON features for habitations, shelters, risk zones, and road networks directly backed by PostGIS spatial queries.
- **Citizen Report Verification Engine**: Secure endpoints for field responders and disaster officers to transition reports (`PENDING_VERIFICATION` → `VERIFIED` / `REJECTED`) and trigger operational updates.
- **Relocation Decision-Support Service**: Mathematical optimization and heuristic routing for capacity-constrained shelter allocation and route viability checks.
- **Supabase Integration**: Supabase client connection and PostgreSQL connection pool via SQLAlchemy / asyncpg.

*Note: In accordance with Milestone 1 specifications, no backend packages or business logic are initialized yet.*
