import React from 'react';
import { ShieldAlert, UserCheck, MapPin, AlertTriangle } from 'lucide-react';

export default function Header({ currentRole, onRoleChange }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-badge">
          <ShieldAlert className="logo-icon" size={24} />
          <div>
            <h1 className="logo-title">SafeSettle</h1>
            <span className="logo-subtitle">Disaster-Relocation Decision Support</span>
          </div>
        </div>

        <div className="header-divider" />

        <div className="location-pill">
          <MapPin size={14} className="location-icon" />
          <span>Puri Coastal Corridor, Odisha</span>
        </div>

        <div className="scenario-tag">
          <AlertTriangle size={14} className="alert-icon" />
          <span>CYCLONE LANDFALL PILOT</span>
        </div>
      </div>

      <div className="header-right">
        {/* Role Indicator Placeholder */}
        <div className="role-selector-container">
          <UserCheck size={16} className="role-icon" />
          <span className="role-label">Active Role:</span>
          <select 
            value={currentRole} 
            onChange={(e) => onRoleChange(e.target.value)}
            className="role-select"
            title="Switch operator role placeholder"
          >
            <option value="DISASTER_OFFICER">Disaster Officer (Authority)</option>
            <option value="FIELD_RESPONDER">Field Responder</option>
            <option value="ADMIN">System Administrator</option>
            <option value="CITIZEN">Citizen / Observer</option>
          </select>
        </div>
      </div>
    </header>
  );
}
