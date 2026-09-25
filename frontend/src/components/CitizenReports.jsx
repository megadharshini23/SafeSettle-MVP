import React, { useState } from "react";

export default function CitizenReports({
  reports = [],
  roads = [],
  onReportVerified,
}) {
  const [reportType, setReportType] =
    useState("ROAD_BLOCKED");

  const [severity, setSeverity] =
    useState("HIGH");

  const [description, setDescription] =
    useState("");

  const [affectedRoadId, setAffectedRoadId] =
    useState(
      roads.length > 0 ? roads[0].id : ""
    );

  const [localReports, setLocalReports] =
    useState(reports);

  const submitReport = () => {
    if (!description.trim()) {
      return;
    }

    const newReport = {
      id: `local-${Date.now()}`,
      report_type: reportType,
      description: description.trim(),
      severity,
      status: "PENDING_VERIFICATION",
      road_id:
        reportType === "ROAD_BLOCKED"
          ? affectedRoadId
          : null,
      coordinates: [19.808, 85.839],
    };

    setLocalReports((current) => [
      newReport,
      ...current,
    ]);

    setDescription("");
  };

  const verifyReport = (reportId) => {
    const updatedReports =
      localReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status: "VERIFIED",
            }
          : report
      );

    setLocalReports(updatedReports);

    const verifiedReport =
      updatedReports.find(
        (report) =>
          report.id === reportId
      );

    if (
      verifiedReport &&
      onReportVerified
    ) {
      onReportVerified(
        verifiedReport
      );
    }
  };

  const rejectReport = (reportId) => {
    setLocalReports((current) =>
      current.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status: "REJECTED",
            }
          : report
      )
    );
  };

  return (
    <section className="citizen-reports">

      <div className="citizen-reports-header">

        <div>
          <p className="eyebrow">
            COMMUNITY REPORTING
          </p>

          <h2>
            Citizen Reports
          </h2>

          <p>
            Citizens can report changing
            conditions for authority verification.
          </p>
        </div>

      </div>

      <div className="report-workflow">

        <div className="report-form">

          <h3>
            Submit a Report
          </h3>

          <label>
            Report Type
          </label>

          <select
            value={reportType}
            onChange={(event) =>
              setReportType(
                event.target.value
              )
            }
          >
            <option value="ROAD_BLOCKED">
              Road Blocked
            </option>

            <option value="FLOODING">
              Flooding
            </option>

            <option value="SHELTER_ISSUE">
              Shelter Issue
            </option>

            <option value="INFRASTRUCTURE_DAMAGE">
              Infrastructure Damage
            </option>
          </select>

          {reportType ===
            "ROAD_BLOCKED" && (

            <>
              <label>
                Affected Road
              </label>

              <select
                value={affectedRoadId}
                onChange={(event) =>
                  setAffectedRoadId(
                    event.target.value
                  )
                }
              >
                {roads.map((road) => (
                  <option
                    key={road.id}
                    value={road.id}
                  >
                    {road.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>
            Severity
          </label>

          <select
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value
              )
            }
          >
            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="CRITICAL">
              Critical
            </option>
          </select>

          <label>
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Describe the problem..."
            rows={4}
          />

          <button
            type="button"
            className="report-submit-button"
            onClick={submitReport}
          >
            Submit Report
          </button>

        </div>

        <div className="report-list">

          <div className="report-list-header">

            <h3>
              Authority Verification
            </h3>

            <span>
              {localReports.filter(
                (report) =>
                  report.status ===
                  "PENDING_VERIFICATION"
              ).length}{" "}
              pending
            </span>

          </div>

          {localReports.length === 0 ? (

            <div className="report-empty">
              No citizen reports available.
            </div>

          ) : (

            localReports.map((report) => (

              <div
                className="citizen-report-card"
                key={report.id}
              >

                <div className="report-card-top">

                  <strong>
                    {report.report_type.replaceAll(
                      "_",
                      " "
                    )}
                  </strong>

                  <span
                    className={`report-status ${report.status.toLowerCase()}`}
                  >
                    {report.status.replaceAll(
                      "_",
                      " "
                    )}
                  </span>

                </div>

                <div className="report-card-row">

                  <span>
                    Severity
                  </span>

                  <strong>
                    {report.severity}
                  </strong>

                </div>

                {report.road_id && (
                  <div className="report-card-row">

                    <span>
                      Affected Road
                    </span>

                    <strong>
                      {roads.find(
                        (road) =>
                          road.id ===
                          report.road_id
                      )?.name ||
                        "Selected road"}
                    </strong>

                  </div>
                )}

                <p>
                  {report.description}
                </p>

                {report.status ===
                  "PENDING_VERIFICATION" && (

                  <div className="report-actions">

                    <button
                      type="button"
                      className="verify-report-button"
                      onClick={() =>
                        verifyReport(
                          report.id
                        )
                      }
                    >
                      ✓ Verify
                    </button>

                    <button
                      type="button"
                      className="reject-report-button"
                      onClick={() =>
                        rejectReport(
                          report.id
                        )
                      }
                    >
                      Reject
                    </button>

                  </div>

                )}

                {report.status ===
                  "VERIFIED" && (

                  <div className="verified-message">
                    ✓ Verified by authority.
                    Operational data can now
                    be re-evaluated.
                  </div>

                )}

                {report.status ===
                  "REJECTED" && (

                  <div className="rejected-message">
                    Report rejected by authority.
                  </div>

                )}

              </div>

            ))

          )}

        </div>

      </div>

    </section>
  );
}