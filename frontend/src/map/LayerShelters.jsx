import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createShelterIcon } from './MapIcons';

export default function LayerShelters({ shelters, visible }) {
  if (!visible) return null;

  return (
    <>
      {shelters.map((shelter) => (
        <Marker
          key={shelter.id}
          position={shelter.coordinates}
          icon={createShelterIcon(shelter.status)}
        >
          <Popup className="safesettle-popup">
            <div className="popup-container">
              <div className="popup-badge shelter">Evacuation Center</div>
              <h4 className="popup-title">{shelter.name}</h4>
              <div className="popup-row">
                <span className="popup-label">Operational Status:</span>
                <span className={`popup-tag status-${shelter.status.toLowerCase()}`}>
                  {shelter.status}
                </span>
              </div>
              <div className="popup-row">
                <span className="popup-label">Functional Capacity:</span>
                <span className="popup-value font-bold text-emerald-700">
                  {shelter.functional_available_capacity.toLocaleString()} seats
                </span>
              </div>
              <div className="popup-row">
                <span className="popup-label">Occupancy / Physical:</span>
                <span className="popup-value text-slate-600">
                  {shelter.current_occupancy} / {shelter.physical_capacity}
                </span>
              </div>
              <div className="popup-amenities">
                <span className={`amenity-badge ${shelter.water_available ? 'active' : ''}`} title="Potable Water">
                  💧 Water: {shelter.water_available ? 'Yes' : 'No'}
                </span>
                <span className={`amenity-badge ${shelter.sanitation_available ? 'active' : ''}`} title="Sanitation Toilets">
                  🚻 Sanitation: {shelter.sanitation_available ? 'Yes' : 'No'}
                </span>
                <span className={`amenity-badge ${shelter.medical_support ? 'active' : ''}`} title="Medical Unit">
                  ⚕️ Medical: {shelter.medical_support ? 'Yes' : 'No'}
                </span>
                <span className={`amenity-badge ${shelter.transport_available ? 'active' : ''}`} title="Transport Fleet">
                  🚐 Transport: {shelter.transport_available ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
