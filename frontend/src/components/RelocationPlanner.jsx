import React, { useState } from 'react';

export default function RelocationPlanner({ habitations, shelters }) {
  const [plan, setPlan] = useState([]);

  const generatePlan = () => {
    const assignments = [];
    const usedCapacity = {};

    shelters.forEach((shelter) => {
      usedCapacity[shelter.id] = shelter.current_occupancy;
    });

    const sortedHabitations = [...habitations].sort(
      (a, b) => b.priority_score - a.priority_score
    );

    sortedHabitations.forEach((habitation) => {
      let remainingPopulation = habitation.vulnerable_population;

      for (const shelter of shelters) {
        if (
          shelter.status !== 'ACTIVE' ||
          !shelter.water_available ||
          !shelter.sanitation_available ||
          !shelter.medical_support ||
          !shelter.transport_available
        ) {
          continue;
        }

        const availableCapacity =
          shelter.physical_capacity - usedCapacity[shelter.id];

        if (availableCapacity <= 0 || remainingPopulation <= 0) {
          continue;
        }

        const assignedPopulation = Math.min(
          remainingPopulation,
          availableCapacity
        );

        assignments.push({
          habitation: habitation.name,
          riskLevel: habitation.risk_level,
          priorityScore: habitation.priority_score,
          vulnerablePopulation: habitation.vulnerable_population,
          shelter: shelter.name,
          assignedPopulation,
          remainingPopulation:
            remainingPopulation - assignedPopulation,
        });

        usedCapacity[shelter.id] += assignedPopulation;
        remainingPopulation -= assignedPopulation;
      }

      if (remainingPopulation > 0) {
        assignments.push({
          habitation: habitation.name,
          riskLevel: habitation.risk_level,
          priorityScore: habitation.priority_score,
          vulnerablePopulation: habitation.vulnerable_population,
          shelter: 'NO CAPACITY AVAILABLE',
          assignedPopulation: 0,
          remainingPopulation,
        });
      }
    });

    setPlan(assignments);
  };

  const totalVulnerablePopulation = habitations.reduce(
    (total, item) => total + item.vulnerable_population,
    0
  );

  return (
    <section className="relocation-planner">

      <div className="relocation-header">
        <div>
          <p className="eyebrow">RELOCATION PLANNING</p>

          <h2>Capacity-Aware Relocation Planner</h2>

          <p>
            Match vulnerable populations with available evacuation shelters.
          </p>
        </div>

        <button
          className="generate-plan-button"
          onClick={generatePlan}
        >
          Generate Relocation Plan
        </button>
      </div>

      <div className="relocation-summary">

        <div className="relocation-summary-card">
          <span>Priority Habitations</span>
          <strong>{habitations.length}</strong>
        </div>

        <div className="relocation-summary-card">
          <span>Available Shelters</span>
          <strong>{shelters.length}</strong>
        </div>

        <div className="relocation-summary-card">
          <span>Vulnerable Population</span>
          <strong>
            {totalVulnerablePopulation.toLocaleString()}
          </strong>
        </div>

      </div>

      {plan.length === 0 ? (
        <div className="relocation-empty-state">

          <div className="relocation-icon">
            ↔
          </div>

          <h3>No relocation plan generated</h3>

          <p>
            Generate a plan to match vulnerable populations
            with capacity-ready shelters.
          </p>

        </div>
      ) : (

        <div className="relocation-results">

          <h3>Generated Relocation Plan</h3>

          {plan.map((item, index) => (
            <div
              className="relocation-assignment"
              key={`${item.habitation}-${item.shelter}-${index}`}
            >

              <div>
                <strong>
                  {item.habitation}
                </strong>

                <span>
                  Risk: {item.riskLevel} | Priority:{' '}
                  {item.priorityScore}
                </span>

                <span>
                  Vulnerable Population:{' '}
                  {item.vulnerablePopulation.toLocaleString()}
                </span>
              </div>

              <div>
                <strong>
                  → {item.shelter}
                </strong>

                <span>
                  Assigned:{' '}
                  {item.assignedPopulation.toLocaleString()}
                </span>
              </div>

              {item.remainingPopulation > 0 && (
                <div className="relocation-warning">
                  Remaining vulnerable population:{' '}
                  {item.remainingPopulation.toLocaleString()}
                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </section>
  );
}