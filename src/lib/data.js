/**
 * EquipX Core Data Layer & Mock Data Store
 * Structured to be easily mapped to Prisma / Neon database models
 * once openapi.yaml is uploaded.
 */

export const INITIAL_EQUIPMENT = [
  {
    id: "EQ-8849-CYBER",
    name: "Quantum Spectrometer Rig X1",
    category: "Analytical Physics",
    status: "AVAILABLE", // AVAILABLE, BOOKED, MAINTENANCE, DECOMMISSIONED
    serialNumber: "SN-QN-99210",
    qrCode: "EQUIPX://EQ-8849-CYBER",
    location: "Bay 04-A (Main Laboratory)",
    condition: "EXCELLENT",
    specs: {
      resolution: "0.001 nm",
      cryoTemp: "4.2 Kelvin",
      maxPressure: "15 Bar",
      powerRating: "2.4 kW",
    },
    journey: [
      { date: "2026-09-15", event: "Hardware Commissioned & Calibrated", actor: "Dr. Aris Vance" },
      { date: "2026-09-28", event: "Sensor Array Firmware Updated to v2.4", actor: "Engineering Core" },
      { date: "2026-10-02", event: "Successful Deep-Spectrum Analysis", actor: "Team Helios" },
      { date: "2026-10-06", event: "Routine Diagnostics Passed (99.4%)", actor: "Automated Telemetry" },
    ],
    imageUrl: "/images/quantum-spectrometer.svg",
    description: "High-precision cryogenic spectrometer for non-invasive quantum state diagnostics and isotopic resonance mapping.",
  },
  {
    id: "EQ-4421-HOLO",
    name: "Holographic Laser Metrology Unit",
    category: "Optics & Metrology",
    status: "AVAILABLE",
    serialNumber: "SN-HLM-33201",
    qrCode: "EQUIPX://EQ-4421-HOLO",
    location: "Optics Cleanroom B2",
    condition: "EXCELLENT",
    specs: {
      beamWavelength: "532 nm (Emerald)",
      interferometerRange: "500 mm",
      samplingFreq: "100 kHz",
      accuracy: "+/- 0.05 um",
    },
    journey: [
      { date: "2026-08-10", event: "Optics Unit Initialized", actor: "Tech Ops" },
      { date: "2026-09-12", event: "Sub-nanometer calibration verified", actor: "Dr. Elena Rostova" },
      { date: "2026-09-25", event: "Returned in clean condition", actor: "Photonics Lab" },
    ],
    imageUrl: "/images/laser-metrology.svg",
    description: "Multi-axis laser interferometer for micro-surface topography and real-time deformation analysis.",
  },
  {
    id: "EQ-1092-DRONE",
    name: "Autonomous Atmospheric Probe Drone",
    category: "Field Robotics",
    status: "BOOKED",
    serialNumber: "SN-AAP-88219",
    qrCode: "EQUIPX://EQ-1092-DRONE",
    location: "Flight Hangar 01",
    condition: "GOOD",
    specs: {
      endurance: "180 Minutes",
      payloadCapacity: "4.5 kg",
      sensors: "LIDAR + Hyperspectral",
      range: "25 km Mesh",
    },
    journey: [
      { date: "2026-09-01", event: "Flight Certified", actor: "FAA / Lab Safety" },
      { date: "2026-10-04", event: "Mission 14 Atmospheric Sampling", actor: "Atmosphere Unit" },
      { date: "2026-10-07", event: "Reserved for high-altitude sensor run", actor: "Flight Ops" },
    ],
    imageUrl: "/images/probe-drone.svg",
    description: "Ruggedized UAV for high-altitude air quality sampling, radiation profiling, and 3D terrain mapping.",
  },
  {
    id: "EQ-5573-CRYO",
    name: "Cryogenic Electron Cryostat Chamber",
    category: "Cryogenics",
    status: "MAINTENANCE",
    serialNumber: "SN-CEC-11048",
    qrCode: "EQUIPX://EQ-5573-CRYO",
    location: "Basement Deep-Freeze Lab",
    condition: "NEEDS_SERVICE",
    specs: {
      minTemp: "1.8 Kelvin",
      vacuumLevel: "10^-9 Torr",
      coolant: "Liquid Helium",
      chamberVolume: "45 Liters",
    },
    journey: [
      { date: "2026-07-20", event: "Installed in Basement Deep Freeze", actor: "Facility Core" },
      { date: "2026-10-05", event: "Pressure seal micro-leak detected", actor: "Automated Sensor" },
      { date: "2026-10-06", event: "Scheduled for vacuum gasket refurbishment", actor: "Maintenance Team" },
    ],
    imageUrl: "/images/cryo-chamber.svg",
    description: "Ultra-low vibration cryostat environment for single-molecule microscopy and superconductor testing.",
  },
];

export const INITIAL_BOOKINGS = [
  {
    id: "BK-9021",
    equipmentId: "EQ-1092-DRONE",
    equipmentName: "Autonomous Atmospheric Probe Drone",
    userId: "USR-0042",
    userName: "Alex Mercer",
    userEmail: "alex.mercer@equipx.io",
    startTime: "2026-10-08T08:00:00.000Z",
    endTime: "2026-10-08T18:00:00.000Z",
    status: "ACTIVE", // PENDING, APPROVED, ACTIVE, COMPLETED, CANCELLED, REJECTED
    purpose: "Atmospheric aerosol density profiling over sector 7.",
    createdAt: "2026-10-07T14:22:00.000Z",
  },
  {
    id: "BK-9022",
    equipmentId: "EQ-8849-CYBER",
    equipmentName: "Quantum Spectrometer Rig X1",
    userId: "USR-0088",
    userName: "Dr. Sarah Chen",
    userEmail: "sarah.chen@equipx.io",
    startTime: "2026-10-09T10:00:00.000Z",
    endTime: "2026-10-09T16:00:00.000Z",
    status: "APPROVED",
    purpose: "Superconducting qubit coherence time benchmark testing.",
    createdAt: "2026-10-07T16:45:00.000Z",
  },
  {
    id: "BK-9023",
    equipmentId: "EQ-4421-HOLO",
    equipmentName: "Holographic Laser Metrology Unit",
    userId: "USR-0105",
    userName: "Devon Reed",
    userEmail: "devon.reed@equipx.io",
    startTime: "2026-10-10T13:00:00.000Z",
    endTime: "2026-10-10T17:00:00.000Z",
    status: "PENDING",
    purpose: "Sub-micron optical lens alignment for photonics waveguide prototype.",
    createdAt: "2026-10-08T09:15:00.000Z",
  },
];

export const INITIAL_RETURNS = [
  {
    id: "RET-301",
    bookingId: "BK-8900",
    equipmentId: "EQ-4421-HOLO",
    equipmentName: "Holographic Laser Metrology Unit",
    returnedBy: "Dr. Elena Rostova",
    returnDate: "2026-09-25T17:00:00.000Z",
    conditionReported: "EXCELLENT",
    damageFound: false,
    damageNotes: "All mirrors pristine, lens zero-dust checked.",
    damageFine: 0,
    lateHours: 0,
    lateFine: 0,
    status: "VERIFIED_CLOSED",
  },
];
