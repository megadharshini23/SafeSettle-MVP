import React from 'react';
import { Polyline, Popup } from 'react-leaflet';

export default function LayerRoads({ roads, visible }) {
  if (!visible) return null;

  const getRoadStyle = (status, roadType) => {
    let weight = 4;
    if (roadType === 'HIGHWAY') weight = 5;
    else if (roadType === 'PRIMARY') weight = 4;
    else if (roadType === 'SECONDARY') weight = 3.5;
    else if (roadType === 'TERTIARY' || roadType === 'TRACK') weight = 3;

    switch (status) {
      case 'FLOODED':
        return {
          color: '#0284c7',
          weight,
          dashArray: '6, 8',
          opacity: 0.9
        };
      case 'BLOCKED':
        return {
          color: '#ef4444',
          weight,
          opacity: 0.95
        };
      case 'DAMAGED':
        return {
          color: '#991b1b',
          weight,
          dashArray: '4, 4',
          opacity: 0.95
        };
      case 'CONGESTED':
        return {
          color: '#f59e0b',
          weight,
          opacity: 0.9
        };
      case 'CLEAR':
      default:
        return {
          color: '#10b981',
          weight,
          opacity: 0.85
        };
    }
  };

  return (
    <>
      {roads.map((road) => (
        <Polyline
          key={road.id}
          positions={road.coordinates}
          pathOptions={getRoadStyle(road.status, road.road_type)}
        >
          <Popup className="safesettle-popup">
            <div className="popup-container">
              <div className="popup-badge road">Transit Corridor</div>
              <h4 className="popup-title">{road.name}</h4>
              <div className="popup-row">
                <span className="popup-label">Road Type:</span>
                <span className="popup-value font-semibold">{road.road_type}</span>
              </div>
              <div className="popup-row">
                <span className="popup-label">Traffic Status:</span>
                <span className={`popup-tag status-${road.status.toLowerCase()}`}>
                  {road.status}
                </span>
              </div>
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
}
