-- ============================================================================
-- SafeSettle MVP - Milestone 1: Database Foundation
-- Migration: 002_verification_workflow.sql
-- Description: Functions, audit logs, and views supporting the multi-stage
--              operational lifecycle:
--              Citizen Report -> Authority Verification -> GIS Update
--              -> Feasibility Re-check -> Repair/Reassignment/Rerouting
-- ============================================================================

-- ============================================================================
-- 1. Report Verification and Operational Actions Audit Log
-- ============================================================================
CREATE TABLE IF NOT EXISTS report_verification_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES citizen_reports(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action_type VARCHAR(50) NOT NULL CHECK (
        action_type IN ('VERIFICATION_DECISION', 'GIS_STATUS_UPDATE', 'PLAN_RECHECK_TRIGGERED')
    ),
    previous_report_status VARCHAR(50),
    new_report_status VARCHAR(50),
    affected_entity_type VARCHAR(50) CHECK (
        affected_entity_type IS NULL OR affected_entity_type IN ('ROAD', 'SHELTER', 'HABITATION', 'RELOCATION_PLAN')
    ),
    affected_entity_id UUID,
    action_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_actions_report_id ON report_verification_actions(report_id);
CREATE INDEX idx_report_actions_officer_id ON report_verification_actions(officer_id);
CREATE INDEX idx_report_actions_created_at ON report_verification_actions(created_at DESC);

-- ============================================================================
-- 2. Stored Procedure: Verify Citizen Report
-- Transitions status from PENDING_VERIFICATION to VERIFIED or REJECTED.
-- Crucial Rule: Verification DOES NOT alter official operational GIS data.
-- ============================================================================
CREATE OR REPLACE FUNCTION verify_citizen_report(
    p_report_id UUID,
    p_verifier_id UUID,
    p_decision VARCHAR(50),
    p_notes TEXT DEFAULT NULL
)
RETURNS citizen_reports AS $$
DECLARE
    v_report citizen_reports%ROWTYPE;
BEGIN
    -- Validate decision argument
    IF p_decision NOT IN ('VERIFIED', 'REJECTED') THEN
        RAISE EXCEPTION 'Invalid decision: %. Must be VERIFIED or REJECTED', p_decision;
    END IF;

    -- Fetch current report
    SELECT * INTO v_report FROM citizen_reports WHERE id = p_report_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Citizen report not found with id: %', p_report_id;
    END IF;

    IF v_report.status != 'PENDING_VERIFICATION' THEN
        RAISE EXCEPTION 'Report is already processed. Current status: %', v_report.status;
    END IF;

    -- Update report state
    UPDATE citizen_reports
    SET status = p_decision,
        verified_at = NOW(),
        verified_by = p_verifier_id,
        verification_notes = p_notes
    WHERE id = p_report_id
    RETURNING * INTO v_report;

    -- Audit the verification decision
    INSERT INTO report_verification_actions (
        report_id,
        officer_id,
        action_type,
        previous_report_status,
        new_report_status,
        action_notes
    ) VALUES (
        p_report_id,
        p_verifier_id,
        'VERIFICATION_DECISION',
        'PENDING_VERIFICATION',
        p_decision,
        p_notes
    );

    RETURN v_report;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Stored Procedure: Apply Verified Report to Official GIS Data
-- Step 2 in lifecycle: Authority explicitly translates verified ground intelligence
-- into official infrastructure status (e.g. marking a road BLOCKED or shelter FULL).
-- ============================================================================
CREATE OR REPLACE FUNCTION apply_verified_report_to_gis(
    p_report_id UUID,
    p_officer_id UUID,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_new_status VARCHAR(50),
    p_action_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_report_status VARCHAR(50);
BEGIN
    -- Ensure the report has already been VERIFIED
    SELECT status INTO v_report_status FROM citizen_reports WHERE id = p_report_id;

    IF v_report_status IS NULL THEN
        RAISE EXCEPTION 'Report not found: %', p_report_id;
    END IF;

    IF v_report_status != 'VERIFIED' THEN
        RAISE EXCEPTION 'Only VERIFIED reports can trigger official GIS updates. Current status: %', v_report_status;
    END IF;

    -- Update official entity
    IF p_entity_type = 'ROAD' THEN
        UPDATE roads
        SET status = p_new_status,
            updated_at = NOW()
        WHERE id = p_entity_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Road entity not found with id: %', p_entity_id;
        END IF;

    ELSIF p_entity_type = 'SHELTER' THEN
        UPDATE shelters
        SET status = p_new_status,
            updated_at = NOW()
        WHERE id = p_entity_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Shelter entity not found with id: %', p_entity_id;
        END IF;

    ELSE
        RAISE EXCEPTION 'Unsupported entity type for GIS update: %', p_entity_type;
    END IF;

    -- Audit the operational change
    INSERT INTO report_verification_actions (
        report_id,
        officer_id,
        action_type,
        affected_entity_type,
        affected_entity_id,
        action_notes
    ) VALUES (
        p_report_id,
        p_officer_id,
        'GIS_STATUS_UPDATE',
        p_entity_type,
        p_entity_id,
        p_action_notes
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Analytical View: Compromised Plan Assignments Monitor
-- Step 3 in lifecycle: Automatically identifies plan assignments affected by
-- inactive/damaged shelters or roads that are not CLEAR.
-- ============================================================================
CREATE OR REPLACE VIEW v_plan_assignment_health AS
SELECT 
    pa.id AS assignment_id,
    pa.plan_id,
    rp.name AS plan_name,
    rp.status AS plan_status,
    h.id AS habitation_id,
    h.name AS habitation_name,
    h.population AS habitation_population,
    s.id AS shelter_id,
    s.name AS shelter_name,
    s.status AS shelter_status,
    s.functional_available_capacity AS shelter_capacity,
    pa.assigned_population,
    pa.route_distance,
    pa.route_status,
    -- Shelter viability flag
    CASE 
        WHEN s.status != 'ACTIVE' THEN 'SHELTER_UNAVAILABLE'
        WHEN pa.assigned_population > s.functional_available_capacity THEN 'CAPACITY_EXCEEDED'
        ELSE 'SHELTER_HEALTHY'
    END AS shelter_health_assessment
FROM plan_assignments pa
JOIN relocation_plans rp ON pa.plan_id = rp.id
JOIN habitations h ON pa.habitation_id = h.id
JOIN shelters s ON pa.shelter_id = s.id;

-- ============================================================================
-- 5. Stored Procedure: Trigger Plan Feasibility Re-check
-- Flags assignments as COMPROMISED if the assigned shelter is no longer active.
-- ============================================================================
CREATE OR REPLACE FUNCTION recheck_plan_feasibility(p_plan_id UUID)
RETURNS TABLE (
    compromised_assignments_count INTEGER,
    new_plan_status VARCHAR(50)
) AS $$
DECLARE
    v_compromised_count INTEGER := 0;
    v_resulting_status VARCHAR(50);
BEGIN
    -- Flag assignments where shelter is no longer ACTIVE
    UPDATE plan_assignments pa
    SET route_status = 'COMPROMISED',
        updated_at = NOW()
    FROM shelters s
    WHERE pa.shelter_id = s.id
      AND pa.plan_id = p_plan_id
      AND s.status != 'ACTIVE';

    GET DIAGNOSTICS v_compromised_count = ROW_COUNT;

    IF v_compromised_count > 0 THEN
        v_resulting_status := 'FEASIBILITY_CHECK_FAILED';
        UPDATE relocation_plans
        SET status = v_resulting_status,
            failure_reason = FORMAT('%s assignment(s) compromised due to shelter or route disruption', v_compromised_count)
        WHERE id = p_plan_id;
    ELSE
        v_resulting_status := 'FEASIBILITY_CHECK_PASSED';
        UPDATE relocation_plans
        SET status = v_resulting_status,
            failure_reason = NULL
        WHERE id = p_plan_id;
    END IF;

    RETURN QUERY SELECT v_compromised_count, v_resulting_status;
END;
$$ LANGUAGE plpgsql;
