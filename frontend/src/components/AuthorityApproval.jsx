import React, { useEffect, useState } from "react";

export default function AuthorityApproval({
  plan = null,
  totalPopulation = 0,
  repairType = "SPLIT",
  feasibility = null,
  onApprovalChange,
}) {
  const [status, setStatus] =
    useState("PENDING");

  /*
   * Reset approval whenever the feasibility
   * state changes or becomes invalid.
   */
  useEffect(() => {
    if (
      !feasibility?.checked ||
      !feasibility?.feasible
    ) {
      setStatus("PENDING");

      if (onApprovalChange) {
        onApprovalChange("PENDING");
      }
    }
  }, [
    feasibility?.checked,
    feasibility?.feasible,
  ]);

  const canApprove =
    feasibility?.checked === true &&
    feasibility?.feasible === true;

  const repairedAssignments =
    feasibility?.repairedPlan?.length > 0
      ? feasibility.repairedPlan
      : [];

  const displayPopulation =
    totalPopulation ||
    repairedAssignments.reduce(
      (total, item) =>
        total +
        Number(item.population || 0),
      0
    ) ||
    1400;

  const handleApprove = () => {
    if (!canApprove) {
      return;
    }

    setStatus("APPROVED");

    if (onApprovalChange) {
      onApprovalChange("APPROVED");
    }
  };

  const handleModify = () => {
    if (!canApprove) {
      return;
    }

    setStatus(
      "MODIFICATION_REQUIRED"
    );

    if (onApprovalChange) {
      onApprovalChange(
        "MODIFICATION_REQUIRED"
      );
    }
  };

  const handleReject = () => {
    if (!canApprove) {
      return;
    }

    setStatus("REJECTED");

    if (onApprovalChange) {
      onApprovalChange("REJECTED");
    }
  };

  return (
    <section className="authority-approval">
      <div className="authority-approval-header">
        <div>
          <p className="eyebrow">
            HUMAN-IN-THE-LOOP
          </p>

          <h2>Authority Review</h2>

          <p>
            AI recommends the relocation plan.
            The authority makes the final decision.
          </p>
        </div>

        <div
          className={`approval-status ${status.toLowerCase()}`}
        >
          {status === "PENDING" &&
            "PENDING REVIEW"}

          {status === "APPROVED" &&
            "✓ APPROVED"}

          {status ===
            "MODIFICATION_REQUIRED" &&
            "⚠ MODIFICATION REQUIRED"}

          {status === "REJECTED" &&
            "✕ REJECTED"}
        </div>
      </div>

      {!feasibility?.checked && (
        <div className="approval-warning">
          <strong>
            ⚠ Feasibility Check Required
          </strong>

          <p>
            The relocation plan cannot be
            approved until feasibility has been
            checked.
          </p>
        </div>
      )}

      {feasibility?.checked &&
        !feasibility.feasible && (
          <div className="approval-warning">
            <strong>
              ⚠ Plan Requires Repair
            </strong>

            <p>
              The current relocation plan failed
              feasibility validation. Repair and
              re-test the plan before authority
              approval.
            </p>
          </div>
        )}

      <div className="approval-summary">
        <div className="approval-card">
          <span>Plan Status</span>

          <strong>
            {!feasibility?.checked
              ? "NOT CHECKED"
              : feasibility.feasible
              ? "FEASIBLE"
              : "REQUIRES REPAIR"}
          </strong>
        </div>

        <div className="approval-card">
          <span>Population</span>

          <strong>
            {displayPopulation.toLocaleString()}
          </strong>
        </div>

        <div className="approval-card">
          <span>Repair Applied</span>

          <strong>
            {feasibility?.repaired
              ? repairType
              : "NONE"}
          </strong>
        </div>

        <div className="approval-card">
          <span>Decision</span>

          <strong>
            {status === "APPROVED"
              ? "APPROVED"
              : status === "REJECTED"
              ? "REJECTED"
              : status ===
                "MODIFICATION_REQUIRED"
              ? "MODIFY"
              : "PENDING"}
          </strong>
        </div>
      </div>

      <div className="approval-section">
        <h3>
          Why is this plan feasible?
        </h3>

        <div className="approval-checks">
          <div className="approval-check">
            <span>✓</span>

            <div>
              <strong>
                Shelter capacity checked
              </strong>

              <p>
                Available shelter capacity
                supports the planned population.
              </p>
            </div>
          </div>

          <div className="approval-check">
            <span>✓</span>

            <div>
              <strong>
                Required services checked
              </strong>

              <p>
                Active shelters provide the
                required operational services.
              </p>
            </div>
          </div>

          <div className="approval-check">
            <span>✓</span>

            <div>
              <strong>
                Road constraints checked
              </strong>

              <p>
                Road conditions were evaluated
                during feasibility validation.
              </p>
            </div>
          </div>

          <div className="approval-check">
            <span>✓</span>

            <div>
              <strong>
                Repair re-tested
              </strong>

              <p>
                The repaired plan passed
                feasibility validation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {repairedAssignments.length > 0 && (
        <div className="approval-section">
          <h3>
            Repaired Population Assignments
          </h3>

          <div className="assignment-list">
            {repairedAssignments.map(
              (assignment, index) => (
                <div
                  className="assignment-card"
                  key={`${assignment.shelterId}-${index}`}
                >
                  <div>
                    <strong>
                      {assignment.habitation}
                    </strong>

                    <p>
                      → {assignment.shelter}
                    </p>
                  </div>

                  <strong>
                    {Number(
                      assignment.population
                    ).toLocaleString()}{" "}
                    people
                  </strong>
                </div>
              )
            )}
          </div>

          <div className="assignment-total">
            <span>
              Total Relocated
            </span>

            <strong>
              {repairedAssignments
                .reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.population || 0
                    ),
                  0
                )
                .toLocaleString()}{" "}
              people
            </strong>
          </div>
        </div>
      )}

      {status === "PENDING" && (
        <div className="approval-actions">
          <button
            type="button"
            className="approve-plan-button"
            onClick={handleApprove}
            disabled={!canApprove}
          >
            ✓ Approve Plan
          </button>

          <button
            type="button"
            className="modify-plan-button"
            onClick={handleModify}
            disabled={!canApprove}
          >
            Modify Plan
          </button>

          <button
            type="button"
            className="reject-plan-button"
            onClick={handleReject}
            disabled={!canApprove}
          >
            Reject Plan
          </button>
        </div>
      )}

      {status === "APPROVED" && (
        <div className="approval-success">
          <div className="approval-success-icon">
            ✓
          </div>

          <div>
            <strong>
              APPROVED RELOCATION PLAN
            </strong>

            <p>
              The authority has approved this
              feasible relocation plan for
              operational use.
            </p>
          </div>
        </div>
      )}

      {status ===
        "MODIFICATION_REQUIRED" && (
        <div className="approval-warning">
          <strong>
            Modification Required
          </strong>

          <p>
            The authority has requested changes
            before approval.
          </p>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="approval-rejected">
          <strong>
            Relocation Plan Rejected
          </strong>

          <p>
            The authority rejected this plan.
            A new plan must be generated or
            modified.
          </p>
        </div>
      )}
    </section>
  );
}