import React, { useState } from "react";

export default function FeasibilityCheck({
  shelters,
  roads,
  habitations = [],
  onFeasibilityChange,
}) {
  const [result, setResult] = useState(null);
  const [repairAction, setRepairAction] = useState(null);
  const [repairMessage, setRepairMessage] = useState("");
  const [repairedPlan, setRepairedPlan] = useState([]);

  const requiredPopulation =
    habitations.length > 0
      ? habitations.reduce(
          (total, habitation) =>
            total +
            Number(
              habitation.vulnerable_population || 0
            ),
          0
        )
      : 1400;

  const getFunctionalShelters = () => {
    return shelters.filter(
      (shelter) =>
        shelter.status === "ACTIVE" &&
        shelter.water_available &&
        shelter.sanitation_available &&
        shelter.medical_support &&
        shelter.transport_available &&
        shelter.physical_capacity >
          shelter.current_occupancy
    );
  };

  const generatePlan = () => {
    const functionalShelters =
      getFunctionalShelters();

    const assignments = [];
    const remainingCapacity = {};

    functionalShelters.forEach((shelter) => {
      remainingCapacity[shelter.id] =
        shelter.physical_capacity -
        shelter.current_occupancy;
    });

    const sortedHabitations = [...habitations].sort(
      (a, b) =>
        b.priority_score - a.priority_score
    );

    sortedHabitations.forEach((habitation) => {
      let remaining =
        habitation.vulnerable_population;

      for (const shelter of functionalShelters) {
        if (remaining <= 0) {
          break;
        }

        const available =
          remainingCapacity[shelter.id];

        if (available <= 0) {
          continue;
        }

        const assigned = Math.min(
          remaining,
          available
        );

        assignments.push({
          habitation: habitation.name,
          population: assigned,
          shelter: shelter.name,
          shelterId: shelter.id,
        });

        remainingCapacity[shelter.id] -= assigned;
        remaining -= assigned;
      }

      if (remaining > 0) {
        assignments.push({
          habitation: habitation.name,
          population: remaining,
          shelter: "NO CAPACITY AVAILABLE",
          shelterId: null,
        });
      }
    });

    return assignments;
  };

  const createChecks = () => {
    const checks = [];

    const activeShelters = shelters.filter(
      (shelter) =>
        shelter.status === "ACTIVE"
    );

    checks.push({
      name: "Active evacuation shelters",
      passed: activeShelters.length > 0,
      detail: `${activeShelters.length} active shelter(s) available`,
    });

    const functionalShelters =
      getFunctionalShelters();

    checks.push({
      name: "Shelter services",
      passed: functionalShelters.length > 0,
      detail: `${functionalShelters.length} shelter(s) have required services`,
    });

    const totalAvailableCapacity =
      functionalShelters.reduce(
        (total, shelter) =>
          total +
          (shelter.physical_capacity -
            shelter.current_occupancy),
        0
      );

    checks.push({
      name: "Shelter capacity",
      passed:
        totalAvailableCapacity >=
        requiredPopulation,
      detail: `${totalAvailableCapacity.toLocaleString()} people available`,
    });

    const usableRoads = roads.filter(
      (road) =>
        road.status === "CLEAR" ||
        road.status === "OPEN"
    );

    const blockedRoads = roads.filter(
      (road) =>
        road.status === "BLOCKED" ||
        road.status === "FLOODED"
    );

    checks.push({
      name: "Road connectivity",
      passed: blockedRoads.length === 0,
      detail:
        blockedRoads.length === 0
          ? `${usableRoads.length} usable road(s) available`
          : `${blockedRoads.length} road(s) blocked or affected`,
    });

    return {
      checks,
      usableRoads,
      blockedRoads,
    };
  };

  const updateParent = (newResult) => {
    setResult(newResult);

    if (onFeasibilityChange) {
      onFeasibilityChange({
        checked: true,
        feasible: newResult.feasible,
        repaired:
          repairedPlan.length > 0,
        repairedPlan,
      });
    }
  };

  const checkFeasibility = () => {
    const {
      checks,
      usableRoads,
      blockedRoads,
    } = createChecks();

    const feasible = checks.every(
      (check) => check.passed
    );

    const newResult = {
      feasible,
      checks,
      usableRoads,
      blockedRoads,
    };

    setResult(newResult);
    setRepairAction(null);
    setRepairMessage("");
    setRepairedPlan([]);

    if (onFeasibilityChange) {
      onFeasibilityChange({
        checked: true,
        feasible,
        repaired: false,
        repairedPlan: [],
      });
    }
  };

  const applyRepairedResult = (
    action,
    message,
    plan
  ) => {
    if (!result) return;

    const repairedChecks =
      result.checks.map((check) => {
        if (
          check.name ===
          "Road connectivity"
        ) {
          return {
            ...check,
            passed: true,
            detail:
              action === "reroute"
                ? `Rerouted through ${result.usableRoads.length} usable road(s)`
                : action === "reassign"
                ? "Population reassigned through an alternative shelter"
                : "Population split across alternative shelters",
          };
        }

        return check;
      });

    const newResult = {
      ...result,
      feasible: repairedChecks.every(
        (check) => check.passed
      ),
      checks: repairedChecks,
      blockedRoads: [],
    };

    setRepairAction(action);
    setRepairMessage(message);
    setRepairedPlan(plan);
    setResult(newResult);

    if (onFeasibilityChange) {
      onFeasibilityChange({
        checked: true,
        feasible: newResult.feasible,
        repaired: true,
        repairedPlan: plan,
      });
    }
  };

  const handleReroute = () => {
    if (!result) return;

    if (result.usableRoads.length === 0) {
      setRepairAction("reroute");
      setRepairMessage(
        "No alternative usable road is currently available."
      );
      return;
    }

    const plan = generatePlan();

    applyRepairedResult(
      "reroute",
      `Alternative route found using ${result.usableRoads.length} usable road(s). The relocation plan has been rerouted around the blocked road.`,
      plan
    );
  };

  const handleReassign = () => {
    if (!result) return;

    const functionalShelters =
      getFunctionalShelters();

    if (functionalShelters.length < 2) {
      setRepairAction("reassign");
      setRepairMessage(
        "No alternative functional shelter with available capacity was found."
      );
      return;
    }

    const primaryShelter =
      functionalShelters[0];

    const alternativeShelter =
      functionalShelters[1];

    const primaryCapacity =
      primaryShelter.physical_capacity -
      primaryShelter.current_occupancy;

    const alternativeCapacity =
      alternativeShelter.physical_capacity -
      alternativeShelter.current_occupancy;

    const primaryPopulation = Math.min(
      requiredPopulation,
      primaryCapacity
    );

    const remainingPopulation =
      requiredPopulation -
      primaryPopulation;

    const alternativePopulation =
      Math.min(
        remainingPopulation,
        alternativeCapacity
      );

    if (
      primaryPopulation +
        alternativePopulation <
      requiredPopulation
    ) {
      setRepairAction("reassign");
      setRepairMessage(
        "The available alternative shelters do not have enough combined capacity."
      );
      return;
    }

    const plan = [
      {
        habitation:
          "Primary Relocation Group",
        population: primaryPopulation,
        shelter: primaryShelter.name,
        shelterId: primaryShelter.id,
      },
      {
        habitation:
          "Reassigned Relocation Group",
        population:
          alternativePopulation,
        shelter:
          alternativeShelter.name,
        shelterId:
          alternativeShelter.id,
      },
    ];

    applyRepairedResult(
      "reassign",
      `${alternativePopulation.toLocaleString()} people were reassigned to ${alternativeShelter.name}.`,
      plan
    );
  };

  const handleSplit = () => {
    if (!result) return;

    const functionalShelters =
      getFunctionalShelters();

    if (functionalShelters.length < 2) {
      setRepairAction("split");
      setRepairMessage(
        "At least two functional shelters with available capacity are required for population splitting."
      );
      return;
    }

    const firstShelter =
      functionalShelters[0];

    const secondShelter =
      functionalShelters[1];

    const firstCapacity =
      firstShelter.physical_capacity -
      firstShelter.current_occupancy;

    const secondCapacity =
      secondShelter.physical_capacity -
      secondShelter.current_occupancy;

    let firstPopulation = Math.ceil(
      requiredPopulation / 2
    );

    let secondPopulation =
      requiredPopulation -
      firstPopulation;

    if (firstPopulation > firstCapacity) {
      firstPopulation = firstCapacity;

      secondPopulation =
        requiredPopulation -
        firstPopulation;
    }

    if (
      secondPopulation >
        secondCapacity ||
      firstPopulation < 0 ||
      secondPopulation < 0
    ) {
      setRepairAction("split");
      setRepairMessage(
        "The selected shelters do not have enough combined capacity to split the population."
      );
      return;
    }

    const plan = [
      {
        habitation:
          "Priority Population — Group A",
        population: firstPopulation,
        shelter: firstShelter.name,
        shelterId: firstShelter.id,
      },
      {
        habitation:
          "Priority Population — Group B",
        population: secondPopulation,
        shelter: secondShelter.name,
        shelterId: secondShelter.id,
      },
    ];

    applyRepairedResult(
      "split",
      `${firstPopulation.toLocaleString()} people assigned to ${firstShelter.name} and ${secondPopulation.toLocaleString()} people assigned to ${secondShelter.name}.`,
      plan
    );
  };

  return (
    <section className="feasibility-check">
      <div className="feasibility-header">
        <div>
          <p className="eyebrow">
            PLAN VALIDATION
          </p>

          <h2>
            Relocation Feasibility Check
          </h2>

          <p>
            Test whether the relocation plan can
            operate with current shelter and road
            conditions.
          </p>
        </div>

        <button
          className="feasibility-button"
          onClick={checkFeasibility}
        >
          Check Feasibility
        </button>
      </div>

      {!result ? (
        <div className="feasibility-empty">
          <h3>
            Feasibility not checked
          </h3>

          <p>
            Run the feasibility check before
            approving the relocation plan.
          </p>
        </div>
      ) : (
        <div className="feasibility-result">
          <div
            className={
              result.feasible
                ? "feasibility-status feasible"
                : "feasibility-status failed"
            }
          >
            <strong>
              {result.feasible
                ? "✓ PLAN FEASIBLE"
                : "⚠ PLAN REQUIRES REPAIR"}
            </strong>

            <span>
              {result.feasible
                ? "Current shelter and road conditions support the plan."
                : "One or more operational constraints have changed. The plan must be repaired before approval."}
            </span>
          </div>

          {!result.feasible &&
            result.blockedRoads.length > 0 && (
              <div className="failure-alert">
                <strong>
                  ⚠ Road Network Failure Detected
                </strong>

                <p>
                  {result.blockedRoads.length} road(s)
                  are currently blocked or affected.
                  The relocation plan requires
                  re-evaluation.
                </p>
              </div>
            )}

          <div className="feasibility-check-list">
            {result.checks.map(
              (check, index) => (
                <div
                  className="feasibility-check-row"
                  key={index}
                >
                  <div>
                    <strong>
                      {check.name}
                    </strong>

                    <span>
                      {check.detail}
                    </span>
                  </div>

                  <span
                    className={
                      check.passed
                        ? "check-passed"
                        : "check-failed"
                    }
                  >
                    {check.passed
                      ? "PASS"
                      : "FAIL"}
                  </span>
                </div>
              )
            )}
          </div>

          {!result.feasible && (
            <div className="repair-engine-preview">
              <p className="eyebrow">
                NEXT ACTION
              </p>

              <h3>
                Feasibility Repair Required
              </h3>

              <p>
                The current relocation plan cannot
                be approved until the operational
                failure is resolved.
              </p>

              <div className="repair-options">
                <button
                  type="button"
                  className="repair-option"
                  onClick={handleReroute}
                >
                  <strong>Reroute</strong>

                  <span>
                    Find an alternative road path.
                  </span>
                </button>

                <button
                  type="button"
                  className="repair-option"
                  onClick={handleReassign}
                >
                  <strong>Reassign</strong>

                  <span>
                    Move people to another shelter.
                  </span>
                </button>

                <button
                  type="button"
                  className="repair-option"
                  onClick={handleSplit}
                >
                  <strong>Split</strong>

                  <span>
                    Divide the population between
                    shelters.
                  </span>
                </button>
              </div>

              {repairAction && (
                <div className="repair-result">
                  <strong>
                    {repairAction === "reroute" &&
                      "✓ Reroute Repair Applied"}

                    {repairAction === "reassign" &&
                      "✓ Reassignment Repair Applied"}

                    {repairAction === "split" &&
                      "✓ Population Split Repair Applied"}
                  </strong>

                  <p>
                    {repairMessage}
                  </p>
                </div>
              )}

              {repairedPlan.length > 0 && (
                <div className="repaired-plan">
                  <p className="eyebrow">
                    REPAIRED RELOCATION PLAN
                  </p>

                  <h3>
                    Updated Population Assignments
                  </h3>

                  {repairedPlan.map(
                    (assignment, index) => (
                      <div
                        className="repaired-plan-row"
                        key={`${assignment.shelterId}-${index}`}
                      >
                        <div>
                          <strong>
                            {assignment.habitation}
                          </strong>

                          <span>
                            → {assignment.shelter}
                          </span>
                        </div>

                        <strong>
                          {assignment.population.toLocaleString()}{" "}
                          people
                        </strong>
                      </div>
                    )
                  )}

                  <div className="repaired-plan-total">
                    <span>
                      Total relocated
                    </span>

                    <strong>
                      {repairedPlan
                        .reduce(
                          (total, item) =>
                            total +
                            item.population,
                          0
                        )
                        .toLocaleString()}{" "}
                      people
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {result.feasible &&
            repairedPlan.length > 0 && (
              <div className="repaired-plan">
                <p className="eyebrow">
                  REPAIRED RELOCATION PLAN
                </p>

                <h3>
                  Updated Population Assignments
                </h3>

                {repairedPlan.map(
                  (assignment, index) => (
                    <div
                      className="repaired-plan-row"
                      key={`${assignment.shelterId}-${index}`}
                    >
                      <div>
                        <strong>
                          {assignment.habitation}
                        </strong>

                        <span>
                          → {assignment.shelter}
                        </span>
                      </div>

                      <strong>
                        {assignment.population.toLocaleString()}{" "}
                        people
                      </strong>
                    </div>
                  )
                )}

                <div className="repaired-plan-total">
                  <span>
                    Total relocated
                  </span>

                  <strong>
                    {repairedPlan
                      .reduce(
                        (total, item) =>
                          total +
                          item.population,
                        0
                      )
                      .toLocaleString()}{" "}
                    people
                  </strong>
                </div>
              </div>
            )}
        </div>
      )}
    </section>
  );
}