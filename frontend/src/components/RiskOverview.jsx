import React from "react";

function getRiskClass(riskLevel) {
  return riskLevel.toLowerCase();
}

export default function RiskOverview({ habitations }) {
  const critical = habitations.filter(
    (item) => item.risk_level === "CRITICAL"
  ).length;

  const high = habitations.filter(
    (item) => item.risk_level === "HIGH"
  ).length;

  const medium = habitations.filter(
    (item) => item.risk_level === "MEDIUM"
  ).length;

  return (
    <section className="risk-overview">
      <div className="risk-overview-header">
        <div>
          <p className="eyebrow">AUTHORITY DECISION SUPPORT</p>
          <h2>Risk & Vulnerability Overview</h2>
        </div>

        <span className="risk-total">
          {habitations.length} habitations
        </span>
      </div>

      <div className="risk-summary">
        <div className="risk-summary-card critical">
          <strong>{critical}</strong>
          <span>Critical</span>
        </div>

        <div className="risk-summary-card high">
          <strong>{high}</strong>
          <span>High</span>
        </div>

        <div className="risk-summary-card medium">
          <strong>{medium}</strong>
          <span>Medium</span>
        </div>
      </div>

      <div className="risk-list">
        {habitations
          .slice()
          .sort((a, b) => b.priority_score - a.priority_score)
          .map((habitation) => {
            const vulnerabilityRatio =
              (habitation.vulnerable_population / habitation.population) * 100;

            return (
              <article
                key={habitation.id}
                className={`risk-card ${getRiskClass(
                  habitation.risk_level
                )}`}
              >
                <div className="risk-card-top">
                  <div>
                    <span className="risk-level">
                      {habitation.risk_level}
                    </span>

                    <h3>{habitation.name}</h3>
                  </div>

                  <div className="priority-score">
                    <strong>{habitation.priority_score}</strong>
                    <span>Priority</span>
                  </div>
                </div>

                <div className="risk-metrics">
                  <div>
                    <span>Population</span>
                    <strong>
                      {habitation.population.toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>Vulnerable</span>
                    <strong>
                      {habitation.vulnerable_population.toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>Vulnerability</span>
                    <strong>{vulnerabilityRatio.toFixed(1)}%</strong>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}
