import React, { useMemo, useState } from "react";

import Header from "./components/Header";
import LayerControl from "./components/LayerControl";
import RiskOverview from "./components/RiskOverview";
import RelocationPlanner from "./components/RelocationPlanner";
import FeasibilityCheck from "./components/FeasibilityCheck";
import CitizenReports from "./components/CitizenReports";
import AuthorityApproval from "./components/AuthorityApproval";

import MapContainer from "./map/MapContainer";

import {
  PILOT_RISK_ZONES,
  PILOT_HABITATIONS,
  PILOT_SHELTERS,
  PILOT_ROADS,
  PILOT_CITIZEN_REPORTS,
} from "./data/pilotGisData";

export default function App() {
  /*
   * =========================================================
   * GLOBAL APPLICATION STATE
   * =========================================================
   */

  // Current road conditions
  const [roads, setRoads] =
    useState(PILOT_ROADS);

  // GIS layer visibility
  const [layerVisibility, setLayerVisibility] =
    useState({
      riskZones: true,
      habitations: true,
      shelters: true,
      roads: true,
      citizenReports: true,
    });

  // Whether an operational road failure is active
  const [roadFailureActive, setRoadFailureActive] =
    useState(false);

  // Verified citizen reports
  const [verifiedReports, setVerifiedReports] =
    useState([]);

  // Feasibility state shared with Authority Approval
  const [feasibility, setFeasibility] =
    useState({
      checked: false,
      feasible: false,
      repaired: false,
      repairedPlan: [],
    });

  // Authority decision
  const [approvalStatus, setApprovalStatus] =
    useState("PENDING");

  /*
   * =========================================================
   * DERIVED DATA
   * =========================================================
   */

  const totalVulnerablePopulation =
    useMemo(() => {
      return PILOT_HABITATIONS.reduce(
        (total, habitation) =>
          total +
          Number(
            habitation.vulnerable_population || 0
          ),
        0
      );
    }, []);

  const counts = {
    riskZones: PILOT_RISK_ZONES.length,
    habitations: PILOT_HABITATIONS.length,
    shelters: PILOT_SHELTERS.length,
    roads: roads.length,
    citizenReports:
      PILOT_CITIZEN_REPORTS.length +
      verifiedReports.length,
  };

  /*
   * =========================================================
   * GIS LAYER CONTROL
   * =========================================================
   */

  const toggleLayer = (layerId) => {
    setLayerVisibility((current) => ({
      ...current,
      [layerId]: !current[layerId],
    }));
  };

  /*
   * =========================================================
   * FEASIBILITY STATE
   * =========================================================
   */

  const handleFeasibilityChange = (
    feasibilityResult
  ) => {
    setFeasibility(feasibilityResult);

    /*
     * If a new feasibility result is generated,
     * the previous authority approval must not
     * remain valid automatically.
     */
    setApprovalStatus("PENDING");
  };

  /*
   * =========================================================
   * AUTHORITY APPROVAL
   * =========================================================
   */

  const handleApprovalChange = (status) => {
    setApprovalStatus(status);
  };

  /*
   * =========================================================
   * ROAD FAILURE SIMULATION
   * =========================================================
   */

  const simulateRoadBlockage = () => {
    setRoads((currentRoads) => {
      const targetRoad =
        currentRoads.find(
          (road) =>
            road.status === "CLEAR" ||
            road.status === "OPEN"
        );

      if (!targetRoad) {
        return currentRoads;
      }

      return currentRoads.map((road) =>
        road.id === targetRoad.id
          ? {
              ...road,
              status: "BLOCKED",
            }
          : road
      );
    });

    setRoadFailureActive(true);

    /*
     * Existing approval becomes invalid
     * because operational conditions changed.
     */
    setFeasibility({
      checked: false,
      feasible: false,
      repaired: false,
      repairedPlan: [],
    });

    setApprovalStatus("PENDING");
  };

  /*
   * =========================================================
   * RESET ROAD CONDITIONS
   * =========================================================
   */

  const resetRoadConditions = () => {
    setRoads(PILOT_ROADS);

    setRoadFailureActive(false);

    /*
     * Reset feasibility because the operational
     * conditions have changed again.
     */
    setFeasibility({
      checked: false,
      feasible: false,
      repaired: false,
      repairedPlan: [],
    });

    setApprovalStatus("PENDING");
  };

  /*
   * =========================================================
   * CITIZEN REPORT VERIFICATION
   * =========================================================
   */

  const handleReportVerified = (report) => {
    /*
     * Prevent duplicate verified reports
     */
    setVerifiedReports((current) => {
      const alreadyExists =
        current.some(
          (item) => item.id === report.id
        );

      if (alreadyExists) {
        return current;
      }

      return [...current, report];
    });

    /*
     * A verified ROAD_BLOCKED report changes
     * the operational road status.
     */
    if (
      report.report_type ===
        "ROAD_BLOCKED" &&
      report.road_id
    ) {
      setRoads((currentRoads) =>
        currentRoads.map((road) =>
          road.id === report.road_id
            ? {
                ...road,
                status: "BLOCKED",
              }
            : road
        )
      );

      setRoadFailureActive(true);

      /*
       * The previously approved plan is no longer
       * automatically valid.
       */
      setFeasibility({
        checked: false,
        feasible: false,
        repaired: false,
        repairedPlan: [],
      });

      setApprovalStatus("PENDING");

      console.log(
        "Verified road blockage:",
        report.road_id
      );
    }

    console.log(
      "Verified citizen report:",
      report
    );
  };

  /*
   * =========================================================
   * MAIN UI
   * =========================================================
   */

  return (
    <div className="app">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <Header />

      <main className="map-page">
        {/* ===================================================
            RISK OVERVIEW
            =================================================== */}

        <RiskOverview
          habitations={
            PILOT_HABITATIONS
          }
        />

        {/* ===================================================
            GIS MAP
            =================================================== */}

        <div className="map-wrapper">
          <MapContainer
            riskZones={
              PILOT_RISK_ZONES
            }
            habitations={
              PILOT_HABITATIONS
            }
            shelters={
              PILOT_SHELTERS
            }
            roads={roads}
            citizenReports={
              PILOT_CITIZEN_REPORTS
            }
            layerVisibility={
              layerVisibility
            }
          />

          <LayerControl
            visibility={
              layerVisibility
            }
            onToggle={toggleLayer}
            counts={counts}
          />
        </div>

        {/* ===================================================
            RELOCATION PLANNING
            =================================================== */}

        <RelocationPlanner
          habitations={
            PILOT_HABITATIONS
          }
          shelters={
            PILOT_SHELTERS
          }
        />

        {/* ===================================================
            FEASIBILITY CHECK
            =================================================== */}

        <FeasibilityCheck
          shelters={
            PILOT_SHELTERS
          }
          roads={roads}
          habitations={
            PILOT_HABITATIONS
          }
          onFeasibilityChange={
            handleFeasibilityChange
          }
        />

        {/* ===================================================
            AUTHORITY APPROVAL
            =================================================== */}

        <AuthorityApproval
          totalPopulation={
            totalVulnerablePopulation
          }
          repairType={
            feasibility.repaired
              ? "SPLIT"
              : "NONE"
          }
          feasibility={
            feasibility
          }
          onApprovalChange={
            handleApprovalChange
          }
        />

        {/* ===================================================
            CITIZEN REPORTING
            =================================================== */}

        <CitizenReports
          reports={
            PILOT_CITIZEN_REPORTS
          }
          roads={roads}
          onReportVerified={
            handleReportVerified
          }
        />

        {/* ===================================================
            VERIFIED REPORT SUMMARY
            =================================================== */}

        {verifiedReports.length >
          0 && (
          <section className="verified-report-summary">
            <div>
              <p className="eyebrow">
                AUTHORITY UPDATE
              </p>

              <h2>
                Verified Citizen Reports
              </h2>

              <p>
                Verified reports are now
                available for operational
                re-evaluation.
              </p>
            </div>

            <div className="verified-report-count">
              <strong>
                {
                  verifiedReports.length
                }
              </strong>

              <span>
                Verified Report
                {verifiedReports.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>
          </section>
        )}

        {/* ===================================================
            OPERATIONAL FAILURE SIMULATION
            =================================================== */}

        <section className="failure-simulation">
          <div className="failure-simulation-header">
            <div>
              <p className="eyebrow">
                OPERATIONAL SIMULATION
              </p>

              <h2>
                Test Plan Failure
              </h2>

              <p>
                Simulate a road blockage
                and observe how the
                relocation plan conditions
                change.
              </p>
            </div>

            <div className="simulation-actions">
              <button
                type="button"
                className="simulate-failure-button"
                onClick={
                  simulateRoadBlockage
                }
                disabled={
                  roadFailureActive
                }
              >
                🚧 Simulate Road
                Blockage
              </button>

              <button
                type="button"
                className="reset-road-button"
                onClick={
                  resetRoadConditions
                }
                disabled={
                  !roadFailureActive
                }
              >
                Reset Roads
              </button>
            </div>
          </div>

          <div
            className={
              roadFailureActive
                ? "failure-state active"
                : "failure-state"
            }
          >
            <div className="failure-state-icon">
              {roadFailureActive
                ? "⚠"
                : "✓"}
            </div>

            <div>
              <strong>
                {roadFailureActive
                  ? "Road failure simulated"
                  : "Normal road conditions"}
              </strong>

              <span>
                {roadFailureActive
                  ? "A usable road has been marked BLOCKED. The relocation plan should now be re-evaluated."
                  : "No operational road failure is currently being simulated."}
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            AUTHORITY DECISION SUMMARY
            =================================================== */}

        {approvalStatus ===
          "APPROVED" && (
          <section className="authority-decision-summary">
            <div>
              <p className="eyebrow">
                AUTHORITY DECISION
              </p>

              <h2>
                ✓ Relocation Plan Approved
              </h2>

              <p>
                The feasible relocation
                plan has been approved for
                operational use.
              </p>
            </div>

            <div className="authority-decision-badge">
              APPROVED
            </div>
          </section>
        )}

        {/* ===================================================
            PILOT DISCLAIMER
            =================================================== */}

        <div className="pilot-disclaimer">
          Pilot demonstration data —
          not official government
          operational data.
        </div>
      </main>
    </div>
  );
}