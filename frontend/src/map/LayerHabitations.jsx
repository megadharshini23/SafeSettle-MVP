import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createHabitationIcon } from './MapIcons';

export default function LayerHabitations({ habitations, visible }) {
  if (!visible) return null;

  return (
    <>
      {habitations.map((hab) => (
        <Marker
          key={hab.id}
          position={hab.coordinates}
          icon={createHabitationIcon(hab.risk_level)}
        >
          <Popup className="safesettle-popup">
            <div className="popup-container">

              <div className="popup-badge habitation">
                Vulnerable Habitation
              </div>

              <h4 className="popup-title">
                {hab.name}
              </h4>

              <div className="popup-row">
                <span className="popup-label">
                  Total Population:
                </span>
                <span className="popup-value font-bold">
                  {hab.population.toLocaleString()}
                </span>
              </div>

              <div className="popup-row">
                <span className="popup-label">
                  Vulnerable Pop:
                </span>
                <span className="popup-value text-red-600 font-semibold">
                  {hab.vulnerable_population.toLocaleString()}
                </span>
              </div>

              <div className="popup-row">
                <span className="popup-label">
                  Vulnerability:
                </span>
                <span className="popup-value">
                  {(
                    (hab.vulnerable_population / hab.population) * 100
                  ).toFixed(1)}%
                </span>
              </div>

              <div className="popup-row">
                <span className="popup-label">
                  Risk Level:
                </span>
                <span
                  className={`popup-tag risk-${hab.risk_level.toLowerCase()}`}
                >
                  {hab.risk_level}
                </span>
              </div>

              <div className="popup-row">
                <span className="popup-label">
                  Priority Score:
                </span>
                <span className="popup-value priority-score">
                  {hab.priority_score.toFixed(1)} / 100
                </span>
              </div>

            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}