import React, { useState } from "react";
import Header from "./components/Header";
import LayerControl from "./components/LayerControl";
import MapContainer from "./map/MapContainer";

import {
  PILOT_RISK_ZONES,
  PILOT_HABITATIONS,
  PILOT_SHELTERS,
  PILOT_ROADS,
  PILOT_CITIZEN_REPORTS
} from "./data/pilotGisData";

export default function App() {
  const [layerVisibility, setLayerVisibility] = useState({
    riskZones: true,
    habitations: true,
    shelters: true,
    roads: true,
    citizenReports: true
  });

  const toggleLayer = (layerId) => {
    setLayerVisibility((current) => ({
      ...current,
      [layerId]: !current[layerId]
    }));
  };

  const counts = {
    riskZones: PILOT_RISK_ZONES.length,
    habitations: PILOT_HABITATIONS.length,
    shelters: PILOT_SHELTERS.length,
    roads: PILOT_ROADS.length,
    citizenReports: PILOT_CITIZEN_REPORTS.length
  };

  return (
    <div className="app">
      <Header />

      <main className="map-page">
        <div className="map-wrapper">
          <MapContainer
            riskZones={PILOT_RISK_ZONES}
            habitations={PILOT_HABITATIONS}
            shelters={PILOT_SHELTERS}
            roads={PILOT_ROADS}
            citizenReports={PILOT_CITIZEN_REPORTS}
            layerVisibility={layerVisibility}
          />

          <LayerControl
            visibility={layerVisibility}
            onToggle={toggleLayer}
            counts={counts}
          />
        </div>

        <div className="pilot-disclaimer">
          Pilot demonstration data — not official government operational data.
        </div>
      </main>
    </div>
  );
}
