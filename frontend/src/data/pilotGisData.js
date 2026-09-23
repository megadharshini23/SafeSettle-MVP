/**
 * SafeSettle MVP — Pilot Demonstration Dataset
 * Focus Area: Puri Coastal Corridor, Odisha, India
 * 
 * DISCLAIMER:
 * Pilot demonstration data only — not official government operational data.
 * Synthetic operational scenario modeling a coastal cyclone & storm surge event.
 */

export const PILOT_METADATA = {
  region: "Puri District Coastal Corridor, Odisha, India",
  center: [19.85, 85.82], // [Latitude, Longitude] for Leaflet
  defaultZoom: 12,
  disclaimer: "Pilot demonstration data — not official government operational data."
};

export const PILOT_RISK_ZONES = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Coastal Surge Zone Alpha (Puri Coastal Belt)",
    hazard_type: "STORM_SURGE",
    risk_level: "CRITICAL",
    // PostGIS SRID 4326: MULTIPOLYGON(((85.80 19.78, 85.88 19.78, 85.89 19.83, 85.81 19.84, 85.80 19.78)))
    // Leaflet coordinates: [[lat, lng], [lat, lng], ...]
    coordinates: [
      [19.78, 85.80],
      [19.78, 85.88],
      [19.83, 85.89],
      [19.84, 85.81],
      [19.78, 85.80]
    ]
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Bhargavi River Lowland Inundation Belt",
    hazard_type: "FLOOD",
    risk_level: "HIGH",
    // PostGIS SRID 4326: MULTIPOLYGON(((85.75 19.85, 85.82 19.85, 85.84 19.92, 85.76 19.91, 85.75 19.85)))
    coordinates: [
      [19.85, 85.75],
      [19.85, 85.82],
      [19.92, 85.84],
      [19.91, 85.76],
      [19.85, 85.75]
    ]
  }
];

export const PILOT_HABITATIONS = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    name: "Balukhanda Fishermen Settlement",
    population: 1250,
    vulnerable_population: 380,
    risk_level: "CRITICAL",
    priority_score: 94.50,
    // PostGIS: 85.8350, 19.8050
    coordinates: [19.8050, 85.8350]
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    name: "Pentakota Coastal Hamlet",
    population: 2100,
    vulnerable_population: 520,
    risk_level: "CRITICAL",
    priority_score: 91.00,
    // PostGIS: 85.8420, 19.8010
    coordinates: [19.8010, 85.8420]
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    name: "Chandanpur Lowland Basti",
    population: 850,
    vulnerable_population: 210,
    risk_level: "HIGH",
    priority_score: 78.00,
    // PostGIS: 85.7950, 19.8650
    coordinates: [19.8650, 85.7950]
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    name: "Satyabadi Agrarian Settlement",
    population: 1400,
    vulnerable_population: 290,
    risk_level: "MEDIUM",
    priority_score: 62.50,
    // PostGIS: 85.7720, 19.9050
    coordinates: [19.9050, 85.7720]
  }
];

export const PILOT_SHELTERS = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    name: "Multipurpose Cyclone Shelter - Gop Elevated Campus",
    physical_capacity: 2000,
    current_occupancy: 150,
    functional_available_capacity: 1850,
    water_available: true,
    sanitation_available: true,
    medical_support: true,
    transport_available: true,
    status: "ACTIVE",
    // PostGIS: 85.8650, 19.8820
    coordinates: [19.8820, 85.8650]
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    name: "District Higher Secondary School Shelter Complex",
    physical_capacity: 1500,
    current_occupancy: 0,
    functional_available_capacity: 1500,
    water_available: true,
    sanitation_available: true,
    medical_support: true,
    transport_available: false,
    status: "ACTIVE",
    // PostGIS: 85.8180, 19.8920
    coordinates: [19.8920, 85.8180]
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    name: "Satyabadi Community Resilience Center",
    physical_capacity: 1800,
    current_occupancy: 400,
    functional_available_capacity: 1400,
    water_available: true,
    sanitation_available: true,
    medical_support: false,
    transport_available: true,
    status: "ACTIVE",
    // PostGIS: 85.7680, 19.9320
    coordinates: [19.9320, 85.7680]
  }
];

export const PILOT_ROADS = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    name: "NH-316 Coastal Arterial Route",
    status: "CLEAR",
    road_type: "HIGHWAY",
    // PostGIS: 85.8300 19.8000, 85.8380 19.8350, 85.8450 19.8700, 85.8650 19.8820
    coordinates: [
      [19.8000, 85.8300],
      [19.8350, 85.8380],
      [19.8700, 85.8450],
      [19.8820, 85.8650]
    ]
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    name: "Chandanpur-Gop Rural Relief Link",
    status: "CLEAR",
    road_type: "SECONDARY",
    // PostGIS: 85.7950 19.8650, 85.8200 19.8720, 85.8650 19.8820
    coordinates: [
      [19.8650, 85.7950],
      [19.8720, 85.8200],
      [19.8820, 85.8650]
    ]
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    name: "Pentakota Shoreline Access Road",
    status: "FLOODED",
    road_type: "TERTIARY",
    // PostGIS: 85.8420 19.8010, 85.8370 19.8150, 85.8300 19.8000
    coordinates: [
      [19.8010, 85.8420],
      [19.8150, 85.8370],
      [19.8000, 85.8300]
    ]
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    name: "Satyabadi Bypass Connector",
    status: "CLEAR",
    road_type: "PRIMARY",
    // PostGIS: 85.7720 19.9050, 85.7700 19.9200, 85.7680 19.9320
    coordinates: [
      [19.9050, 85.7720],
      [19.9200, 85.7700],
      [19.9320, 85.7680]
    ]
  }
];

export const PILOT_CITIZEN_REPORTS = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    report_type: "ROAD_BLOCKED",
    description: "Fallen Casuarina trees and 2 feet waterlogging blocking the Pentakota access road link",
    severity: "HIGH",
    status: "PENDING_VERIFICATION",
    // PostGIS: 85.8390, 19.8080
    coordinates: [19.8080, 85.8390]
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    report_type: "FLOODING",
    description: "Bhargavi river embankment seepage near Chandanpur culvert. Lowland inundation beginning.",
    severity: "CRITICAL",
    status: "VERIFIED",
    // PostGIS: 85.7980, 19.8690
    coordinates: [19.8690, 85.7980]
  },
  {
    id: "e0000000-0000-0000-0000-000000000003",
    report_type: "BRIDGE_COLLAPSE",
    description: "Rumor of Satyabadi bridge collapse circulating on social media",
    severity: "LOW",
    status: "REJECTED",
    // PostGIS: 85.7710, 19.9120
    coordinates: [19.9120, 85.7710]
  }
];
