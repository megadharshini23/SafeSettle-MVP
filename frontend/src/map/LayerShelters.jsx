import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createShelterIcon } from './MapIcons';

export default function LayerShelters({ shelters, visible }) {
  if (!visible) {
    return null;
  }

  return (
    <>
      {shelters.map((shelter) => {
        const availableCapacity =
          shelter.physical_capacity - shelter.current_occupancy;

        const servicesReady =
          shelter.water_available &&
          shelter.sanitation_available &&
          shelter.medical_support &&
          shelter.transport_available;

        const functionalReady =
          shelter.status === 'ACTIVE' &&
          availableCapacity > 0 &&
          servicesReady;

        return (
          <Marker
            key={shelter.id}
            position={shelter.coordinates}
            icon={createShelterIcon(shelter.status)}
          >
            <Popup className="safesettle-popup">
              <div className="popup-container">

                <div className="popup-badge shelter">
                  Evacuation Center
                </div>

                <h4 className="popup-title">
                  {shelter.name}
                </h4>

                <div className="popup-row">
                  <span className="popup-label">
                    Physical Capacity:
                  </span>
                  <span className="popup-value font-bold">
                    {shelter.physical_capacity.toLocaleString()}
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Current Occupancy:
                  </span>
                  <span className="popup-value">
                    {shelter.current_occupancy.toLocaleString()}
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Available Capacity:
                  </span>
                  <span className="popup-value">
                    {availableCapacity.toLocaleString()}
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Water:
                  </span>
                  <span className="popup-value">
                    {shelter.water_available
                      ? 'Available'
                      : 'Unavailable'}
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Sanitation:
                  </span>
                  <span className="popup-value">
                    {shelter.sanitation_available
                      ? 'Available'
                      : 'Unavailable'}
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Medical Support:
                  </span>
                  <span className="popup-value">
                    {shelter.medical_support
                      ? 'Available'
                      : 'Unavailable'}
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Transport:
                  </span>
                  <span className="popup-value">
                    {shelter.transport_available
                      ? 'Available'
                      : 'Unavailable'}
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Status:
                  </span>
                  <span
                    className={`popup-tag shelter-${shelter.status.toLowerCase()}`}
                  >
                    {shelter.status}
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Functional Capacity:
                  </span>
                  <span className="popup-value font-bold">
                    {availableCapacity.toLocaleString()} people
                  </span>
                </div>

                <div className="popup-row">
                  <span className="popup-label">
                    Relocation Readiness:
                  </span>
                  <span className="popup-value font-bold">
                    {functionalReady
                      ? 'READY'
                      : 'NOT READY'}
                  </span>
                </div>

              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}