import React from 'react';
import { Polygon, Popup } from 'react-leaflet';

export default function LayerRiskZones({ riskZones, visible }) {
  if (!visible) return null;

  const getStyle = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return {
          color: '#b91c1c',
          fillColor: '#ef4444',
          fillOpacity: 0.35,
          weight: 2
        };
      case 'HIGH':
        return {
          color: '#c2410c',
          fillColor: '#f97316',
          fillOpacity: 0.35,
          weight: 2
        };
      case 'MEDIUM':
        return {
          color: '#d97706',
          fillColor: '#fbbf24',
          fillOpacity: 0.3,
          weight: 1.5
        };
      default:
        return {
          color: '#1d4ed8',
          fillColor: '#3b82f6',
          fillOpacity: 0.25,
          weight: 1
        };
    }
  };

  return (
    <>
      {riskZones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.coordinates}
          pathOptions={getStyle(zone.risk_level)}
        >
          <Popup className="safesettle-popup">
            <div className="popup-container">
              <div className="popup-badge danger">Hazard Zone</div>
              <h4 className="popup-title">{zone.name}</h4>
              <div className="popup-row">
                <span className="popup-label">Hazard Type:</span>
                <span className="popup-value font-semibold">{zone.hazard_type.replace('_', ' ')}</span>
              </div>
              <div className="popup-row">
                <span className="popup-label">Risk Level:</span>
                <span className={`popup-tag risk-${zone.risk_level.toLowerCase()}`}>
                  {zone.risk_level}
                </span>
              </div>
            </div>
          </Popup>
        </Polygon>
      ))}
    </>
  );
}
