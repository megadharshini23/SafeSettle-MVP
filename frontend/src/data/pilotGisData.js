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
  center: [19.85, 85.82],
  defaultZoom: 12,
  disclaimer:
    "Pilot demonstration data — not official government operational data."
};

export const PILOT_RISK_ZONES = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Coastal Surge Zone Alpha (Puri Coastal Belt)",
    hazard_type: "STORM_SURGE",
    risk_level: "CRITICAL",
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
    priority_score: 94.5,
    coordinates: [19.805, 85.835]
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    name: "Pentakota Coastal Hamlet",
    population: 2100,
    vulnerable_population: 520,
    risk_level: "CRITICAL",
    priority_score: 91,
    coordinates: [19.801, 85.842]
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    name: "Chandanpur Lowland Basti",
    population: 850,
    vulnerable_population: 210,
    risk_level: "HIGH",
    priority_score: 78,
    coordinates: [19.865, 85.795]
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    name: "Satyabadi Agrarian Settlement",
    population: 1400,
    vulnerable_population: 290,
    risk_level: "MEDIUM",
    priority_score: 62.5,
    coordinates: [19.905, 85.772]
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
    coordinates: [19.882, 85.865]
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
    transport_available: true,
    status: "ACTIVE",
    coordinates: [19.892, 85.818]
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    name: "Satyabadi Community Resilience Center",
    physical_capacity: 1800,
    current_occupancy: 400,
    functional_available_capacity: 1400,
    water_available: true,
    sanitation_available: true,
    medical_support: true,
    transport_available: true,
    status: "ACTIVE",
    coordinates: [19.932, 85.768]
  }
];

export const PILOT_ROADS = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    name: "NH-316 Coastal Arterial Route",
    status: "CLEAR",
    road_type: "HIGHWAY",
    coordinates: [
      [19.8, 85.83],
      [19.835, 85.838],
      [19.87, 85.845],
      [19.882, 85.865]
    ]
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    name: "Chandanpur-Gop Rural Relief Link",
    status: "CLEAR",
    road_type: "SECONDARY",
    coordinates: [
      [19.865, 85.795],
      [19.872, 85.82],
      [19.882, 85.865]
    ]
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    name: "Pentakota Shoreline Access Road",
    status: "FLOODED",
    road_type: "TERTIARY",
    coordinates: [
      [19.801, 85.842],
      [19.815, 85.837],
      [19.8, 85.83]
    ]
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    name: "Satyabadi Bypass Connector",
    status: "CLEAR",
    road_type: "PRIMARY",
    coordinates: [
      [19.905, 85.772],
      [19.92, 85.77],
      [19.932, 85.768]
    ]
  }
];

export const PILOT_CITIZEN_REPORTS = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    report_type: "ROAD_BLOCKED",
    description:
      "Fallen Casuarina trees and 2 feet waterlogging blocking the Pentakota access road link",
    severity: "HIGH",
    status: "PENDING_VERIFICATION",
    coordinates: [19.808, 85.839]
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    report_type: "FLOODING",
    description:
      "Bhargavi river embankment seepage near Chandanpur culvert. Lowland inundation beginning.",
    severity: "CRITICAL",
    status: "VERIFIED",
    coordinates: [19.869, 85.798]
  },
  {
    id: "e0000000-0000-0000-0000-000000000003",
    report_type: "BRIDGE_COLLAPSE",
    description:
      "Rumor of Satyabadi bridge collapse circulating on social media",
    severity: "LOW",
    status: "REJECTED",
    coordinates: [19.912, 85.771]
  }
];