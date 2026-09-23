import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createReportIcon } from './MapIcons';

export default function LayerCitizenReports({ citizenReports, visible }) {
  if (!visible) return null;

  return (
    <>
      {citizenReports.map((report) => (
        <Marker
          key={report.id}
          position={report.coordinates}
          icon={createReportIcon(report.severity, report.status)}
        >
          <Popup className="safesettle-popup">
            <div className="popup-container">
              <div className="popup-badge report">Citizen Field Incident</div>
              <h4 className="popup-title">{report.report_type.replace(/_/g, ' ')}</h4>
              <div className="popup-row">
                <span className="popup-label">Severity:</span>
                <span className={`popup-tag risk-${report.severity.toLowerCase()}`}>
                  {report.severity}
                </span>
              </div>
              <div className="popup-row">
                <span className="popup-label">Workflow Status:</span>
                <span className={`popup-tag status-${report.status.toLowerCase().replace(/_/g, '-')}`}>
                  {report.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="popup-notes">
                <p className="description-text">"{report.description}"</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
