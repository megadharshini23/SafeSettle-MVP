import L from 'leaflet';

/**
 * Creates custom HTML/SVG divIcons for Leaflet markers.
 * Avoids default Leaflet asset path resolution issues and provides crisp,
 * responsive emergency-management cartographic styling.
 */

export const createHabitationIcon = (riskLevel) => {
  let bgColor = '#ef4444'; // CRITICAL red
  if (riskLevel === 'HIGH') bgColor = '#f97316';
  else if (riskLevel === 'MEDIUM') bgColor = '#f59e0b';
  else if (riskLevel === 'LOW') bgColor = '#10b981';

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 15px;
        cursor: pointer;
      " title="Habitation: ${riskLevel}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export const createShelterIcon = (status) => {
  let bgColor = '#059669'; // ACTIVE emerald green
  if (status === 'FULL') bgColor = '#d97706';
  else if (status === 'INACTIVE') bgColor = '#6b7280';
  else if (status === 'DAMAGED') bgColor = '#dc2626';

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
      " title="Shelter: ${status}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20]
  });
};

export const createReportIcon = (severity, status) => {
  let bgColor = '#f59e0b'; // PENDING amber
  if (status === 'VERIFIED') bgColor = '#dc2626'; // VERIFIED red
  else if (status === 'REJECTED') bgColor = '#9ca3af'; // REJECTED gray

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 30px;
        height: 30px;
        border-radius: 6px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        ${status === 'PENDING_VERIFICATION' ? 'animation: pulse 2s infinite;' : ''}
      " title="Citizen Report: ${status}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18]
  });
};
