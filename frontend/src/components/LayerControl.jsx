import React from 'react';
import { Layers, Shield, Home, AlertOctagon, Navigation, MessageSquareWarning } from 'lucide-react';

export default function LayerControl({ 
  visibility, 
  onToggle, 
  counts 
}) {
  const layers = [
    {
      id: 'riskZones',
      label: 'Risk Zones',
      count: counts.riskZones,
      color: '#ef4444',
      icon: AlertOctagon,
      desc: 'Cyclone surge & inundation areas'
    },
    {
      id: 'habitations',
      label: 'Habitations',
      count: counts.habitations,
      color: '#dc2626',
      icon: Home,
      desc: 'Vulnerable settlements & villages'
    },
    {
      id: 'shelters',
      label: 'Shelters',
      count: counts.shelters,
      color: '#059669',
      icon: Shield,
      desc: 'Active evacuation centers'
    },
    {
      id: 'roads',
      label: 'Roads & Corridors',
      count: counts.roads,
      color: '#0284c7',
      icon: Navigation,
      desc: 'Evacuation transit routes'
    },
    {
      id: 'citizenReports',
      label: 'Citizen Reports',
      count: counts.citizenReports,
      color: '#f59e0b',
      icon: MessageSquareWarning,
      desc: 'Crowdsourced field incidents'
    }
  ];

  return (
    <div className="layer-control-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Layers size={18} className="panel-icon" />
          <span>GIS Layers</span>
        </div>
      </div>

      <div className="layer-list">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isChecked = visibility[layer.id];

          return (
            <label 
              key={layer.id} 
              className={`layer-item ${isChecked ? 'active' : 'inactive'}`}
            >
              <div className="layer-left">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(layer.id)}
                  className="layer-checkbox"
                />
                <div 
                  className="layer-icon-box"
                  style={{ backgroundColor: isChecked ? `${layer.color}15` : '#f1f5f9', color: layer.color }}
                >
                  <Icon size={16} />
                </div>
                <div className="layer-meta">
                  <span className="layer-name">{layer.label}</span>
                  <span className="layer-desc">{layer.desc}</span>
                </div>
              </div>

              <span className="layer-count-badge">
                {layer.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
