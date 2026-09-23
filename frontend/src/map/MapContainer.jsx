import React from 'react';
import { MapContainer as LeafletMap, TileLayer, ZoomControl } from 'react-leaflet';
import LayerRiskZones from './LayerRiskZones';
import LayerRoads from './LayerRoads';
import LayerHabitations from './LayerHabitations';
import LayerShelters from './LayerShelters';
import LayerCitizenReports from './LayerCitizenReports';
import { PILOT_METADATA } from '../data/pilotGisData';

export default function MapContainer({
  riskZones,
  habitations,
  shelters,
  roads,
  citizenReports,
  layerVisibility
}) {
  return (
    <div className="map-wrapper">
      <LeafletMap
        center={PILOT_METADATA.center}
        zoom={PILOT_METADATA.defaultZoom}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomControl position="bottomright" />
        
        {/* Base Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* 1. Risk Zones (Polygons rendered first as base hazard overlay) */}
        <LayerRiskZones
          riskZones={riskZones}
          visible={layerVisibility.riskZones}
        />

        {/* 2. Transit Roads (Polylines) */}
        <LayerRoads
          roads={roads}
          visible={layerVisibility.roads}
        />

        {/* 3. Habitations (Settlement Markers) */}
        <LayerHabitations
          habitations={habitations}
          visible={layerVisibility.habitations}
        />

        {/* 4. Shelters (Evacuation Centers) */}
        <LayerShelters
          shelters={shelters}
          visible={layerVisibility.shelters}
        />

        {/* 5. Citizen Reports (Field Incident Markers) */}
        <LayerCitizenReports
          citizenReports={citizenReports}
          visible={layerVisibility.citizenReports}
        />
      </LeafletMap>
    </div>
  );
}
