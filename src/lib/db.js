/**
 * Database access and repository layer for EquipX
 * Strictly adheres to openapi.yaml F4 and Calendar schemas.
 */

import { findBookingConflict, checkDailyLimit, DAILY_LIMIT_HOURS } from "./conflictDetection";

export const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];

// Initial seed equipment matching OpenAPI contract + 5 department categories
const SEED_EQUIPMENT = [
  // CSE - Computer Science & Engineering
  {
    id: "EQ-1",
    name: "High-End GPU Workstation (NVIDIA RTX 4090)",
    quantity: 3,
    department: "CSE",
    lab: "AI & Distributed Systems Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "CSE Lab 301",
  },
  {
    id: "EQ-CSE-02",
    name: "Embedded IoT Gateway & Edge Sensor Kit",
    quantity: 6,
    department: "CSE",
    lab: "IoT & Embedded Systems Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "CSE Lab 304",
  },
  {
    id: "EQ-CSE-03",
    name: "Enterprise Cisco Core Switch & Router Bench",
    quantity: 4,
    department: "CSE",
    lab: "Computer Networks & Cyber Lab",
    condition: "GOOD",
    status: "available",
    location: "CSE Lab 308",
  },
  {
    id: "EQ-CSE-04",
    name: "VR Spatial Tracking & HMD Development Rig",
    quantity: 5,
    department: "CSE",
    lab: "HCI & Virtual Reality Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "CSE Lab 310",
  },

  // ECE - Electronics & Communication Engineering
  {
    id: "EQ-2",
    name: "Holographic Laser Metrology Unit",
    quantity: 2,
    department: "ECE",
    lab: "Photonics & Optical Cleanroom",
    condition: "EXCELLENT",
    status: "available",
    location: "ECE Cleanroom B2",
  },
  {
    id: "EQ-ECE-02",
    name: "Digital Storage Oscilloscope (100MHz 4-Ch)",
    quantity: 8,
    department: "ECE",
    lab: "VLSI & Signal Processing Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "ECE Lab 202",
  },
  {
    id: "EQ-ECE-03",
    name: "RF Microwave Spectrum Analyzer (9kHz - 3GHz)",
    quantity: 3,
    department: "ECE",
    lab: "Microwave & Antenna Lab",
    condition: "GOOD",
    status: "available",
    location: "ECE Lab 205",
  },
  {
    id: "EQ-ECE-04",
    name: "FPGA Spartan-7 Digital Logic Trainer",
    quantity: 7,
    department: "ECE",
    lab: "Digital Design Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "ECE Lab 208",
  },

  // EEE - Electrical & Electronics Engineering
  {
    id: "EQ-EEE-01",
    name: "Three-Phase Induction Motor Test Bench",
    quantity: 4,
    department: "EEE",
    lab: "Electrical Machines & Drives Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "EEE Lab 102",
  },
  {
    id: "EQ-EEE-02",
    name: "Digital Power Quality & Harmonics Analyzer",
    quantity: 2,
    department: "EEE",
    lab: "Power Systems & Smart Grid Lab",
    condition: "GOOD",
    status: "available",
    location: "EEE Lab 105",
  },
  {
    id: "EQ-EEE-03",
    name: "Precision Regulated Dual DC Power Supply",
    quantity: 10,
    department: "EEE",
    lab: "Power Electronics Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "EEE Lab 108",
  },
  {
    id: "EQ-EEE-04",
    name: "Grid-Tied Solar PV System Simulator",
    quantity: 3,
    department: "EEE",
    lab: "Renewable Energy Research Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "EEE Rooftop Bay",
  },

  // MECH - Mechanical Engineering
  {
    id: "EQ-3",
    name: "Autonomous Atmospheric Probe Drone",
    quantity: 5,
    department: "MECH",
    lab: "Mechatronics & Robotics Dynamics Lab",
    condition: "GOOD",
    status: "available",
    location: "MECH Hangar Bay 01",
  },
  {
    id: "EQ-MECH-02",
    name: "Universal Testing Machine (UTM) 100kN",
    quantity: 2,
    department: "MECH",
    lab: "Strength of Materials Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "MECH Workshop C",
  },
  {
    id: "EQ-MECH-03",
    name: "Industrial 5-Axis CNC Milling Station",
    quantity: 1,
    department: "MECH",
    lab: "Manufacturing & CAD/CAM Lab",
    condition: "GOOD",
    status: "available",
    location: "MECH Machine Shop A",
  },
  {
    id: "EQ-MECH-04",
    name: "Subsonic Aerodynamic Wind Tunnel",
    quantity: 2,
    department: "MECH",
    lab: "Fluid Mechanics & Aero Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "MECH Aero Tunnel Bay",
  },

  // CIVIL - Civil Engineering
  {
    id: "EQ-4",
    name: "Cryogenic Electron Cryostat Chamber",
    quantity: 1,
    department: "CIVIL",
    lab: "Concrete & Material Cryogenics Lab",
    condition: "NEEDS_SERVICE",
    status: "maintenance",
    location: "CIVIL Vault Basement C1",
  },
  {
    id: "EQ-CIVIL-02",
    name: "Electronic Total Station Surveying Theodolite",
    quantity: 4,
    department: "CIVIL",
    lab: "Surveying & Geomatics Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "CIVIL Field Geomatics Hub",
  },
  {
    id: "EQ-CIVIL-03",
    name: "Automatic Compression Testing Machine 2000kN",
    quantity: 2,
    department: "CIVIL",
    lab: "Structural Engineering & Concrete Lab",
    condition: "EXCELLENT",
    status: "available",
    location: "CIVIL Heavy Testing Bay",
  },
  {
    id: "EQ-CIVIL-04",
    name: "Direct Soil Shear & Triaxial Test Apparatus",
    quantity: 3,
    department: "CIVIL",
    lab: "Geotechnical & Soil Mechanics Lab",
    condition: "GOOD",
    status: "available",
    location: "CIVIL Soils Bay B",
  },
];

// In-memory synced state for rapid access and fallback
let inMemoryEquipment = [...SEED_EQUIPMENT];
let inMemoryBookings = [
  {
    id: "BK-1001",
    equipment_id: "EQ-1",
    user: "Alex Rivera (STU-2026-081)",
    registration_type: "INDIVIDUAL",
    from: "2026-10-09T09:00:00.000Z",
    to: "2026-10-09T13:00:00.000Z",
    status: "approved",
    department: "CSE",
    notes: "AI Deep Learning model training",
  },
  {
    id: "BK-1002",
    equipment_id: "EQ-2",
    user: "Team Quantum Wave [Lead: Devon Reed | Members: Kevin Patel, Anita Roy]",
    registration_type: "TEAM",
    team_name: "Quantum Wave",
    team_leader: "Devon Reed",
    team_members: ["Kevin Patel", "Anita Roy"],
    from: "2026-10-10T14:00:00.000Z",
    to: "2026-10-10T18:00:00.000Z",
    status: "pending",
    department: "ECE",
    notes: "Laser interferometry waveguide testing",
  },
];

let inMemoryDamageReports = [
  {
    id: "DMG-101",
    equipment_id: "EQ-4",
    reported_by: "Alex Mercer",
    description: "Cryo-seal pressure drop below threshold.",
    severity: "MODERATE",
    reported_at: "2026-10-07T11:00:00.000Z",
    status: "UNDER_REVIEW",
  },
];

let inMemoryNotifications = [
  {
    id: "NOTIF-1",
    title: "Reservation Approved",
    message: "Booking BK-1001 for Quantum Spectrometer Rig X1 has been approved.",
    type: "BOOKING_APPROVED",
    role: "STUDENT",
    created_at: new Date().toISOString(),
    read: false,
  },
  {
    id: "NOTIF-2",
    title: "Maintenance Notice",
    message: "Cryostat Chamber EQ-4 scheduled for routine vacuum gasket check.",
    type: "MAINTENANCE",
    role: "STAFF",
    created_at: new Date().toISOString(),
    read: false,
  },
];

let inMemoryCalendarEvents = [
  {
    id: "EVT-1",
    title: "Quantum Physics Lab Orientation",
    description: "Safety protocols and cryogenic handling workshop.",
    start: "2026-10-12T09:00:00.000Z",
    end: "2026-10-12T11:00:00.000Z",
    venue: "Main Auditorium Hall A",
    category: "ORIENTATION",
    all_day: false,
    created_at: "2026-10-08T09:00:00.000Z",
  },
  {
    id: "EVT-2",
    title: "Photonics Laser Calibration Routine",
    description: "Quarterly precision wavelength alignment.",
    start: "2026-10-15T13:00:00.000Z",
    end: "2026-10-15T16:00:00.000Z",
    venue: "Cleanroom B2",
    category: "MAINTENANCE",
    all_day: false,
    created_at: "2026-10-08T10:00:00.000Z",
  },
];

let prisma = null;
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("your_password")) {
  try {
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
  } catch (err) {
    console.warn("Prisma Client initialization deferred:", err.message);
  }
}

/**
 * List all bookable equipment (GET /equipment)
 */
export async function getEquipmentList() {
  if (prisma) {
    try {
      const records = await prisma.equipment.findMany();
      if (records.length > 0) {
        return records.map((e) => {
          const mem = inMemoryEquipment.find((m) => m.id === e.id) || {};
          return {
            id: e.id,
            name: e.name,
            quantity: e.quantity,
            department: mem.department || "General Lab",
            lab: mem.lab || "Main Lab",
            condition: mem.condition || "GOOD",
            status: mem.status || "available",
            location: mem.location || "Central Storage",
          };
        });
      }
    } catch (e) {
      console.warn("Postgres fetch fallback to synced store:", e.message);
    }
  }
  return inMemoryEquipment;
}

/**
 * Add equipment (POST /equipment)
 */
export async function createEquipment({ id, name, quantity, department, lab }) {
  if (!name || quantity === undefined) {
    throw { status: 400, error: "BAD_REQUEST", message: "name and quantity are required." };
  }

  const generatedId = id || `EQ-${inMemoryEquipment.length + 1}`;
  const record = {
    id: generatedId,
    name,
    quantity: Number(quantity),
    department: department || "General Science",
    lab: lab || "Central Research Facility",
    condition: "EXCELLENT",
    status: "available",
    location: "Station Bay 01",
  };

  if (prisma) {
    try {
      await prisma.equipment.create({
        data: {
          id: record.id,
          name: record.name,
          quantity: record.quantity,
        },
      });
    } catch (e) {
      console.warn("Prisma create equipment error, synced to memory:", e.message);
    }
  }

  inMemoryEquipment.push(record);
  return {
    id: record.id,
    name: record.name,
    quantity: record.quantity,
  };
}

/**
 * List all bookings or filter by equipment_id
 */
export async function getBookings(equipmentId = null) {
  if (prisma) {
    try {
      const where = equipmentId ? { equipmentId } : {};
      const list = await prisma.booking.findMany({ where });
      if (list.length > 0) {
        return list.map((b) => {
          const mem = inMemoryBookings.find((m) => m.id === b.id) || {};
          return {
            id: b.id,
            equipment_id: b.equipmentId,
            user: b.user,
            from: b.from.toISOString(),
            to: b.to.toISOString(),
            status: b.status,
            department: mem.department || "Research Department",
            notes: mem.notes || "",
          };
        });
      }
    } catch (e) {
      console.warn("Prisma booking fetch fallback:", e.message);
    }
  }

  if (equipmentId) {
    return inMemoryBookings.filter((b) => b.equipment_id === equipmentId);
  }
  return inMemoryBookings;
}

/**
 * Request a booking with deterministic conflict detection (POST /bookings)
 */
export async function createBooking({
  equipment_id,
  user,
  from,
  to,
  department,
  notes,
  registration_type,
  team_name,
  team_leader,
  team_members,
}) {
  if (!equipment_id || !user || !from || !to) {
    throw {
      status: 400,
      error: "BAD_REQUEST",
      message: "equipment_id, user, from, and to are required.",
    };
  }

  const newStart = new Date(from);
  const newEnd = new Date(to);

  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    throw {
      status: 400,
      error: "BAD_REQUEST",
      message: "Invalid date format. Expected ISO-8601 timestamps.",
    };
  }

  if (newStart.getTime() >= newEnd.getTime()) {
    throw {
      status: 400,
      error: "BAD_REQUEST",
      message: "The 'from' time must precede the 'to' time.",
    };
  }

  // Fetch all existing bookings for this equipment
  const existingBookings = await getBookings(equipment_id);

  // Deterministic conflict evaluation (Strict Mathematical Rule)
  const conflictResult = findBookingConflict(from, to, existingBookings);

  if (conflictResult.hasConflict) {
    throw {
      status: 409,
      error: "SLOT_CONFLICT",
      message: "This equipment is already booked for the selected time.",
      conflictingBooking: conflictResult.conflictingBooking,
      suggestedSlot: conflictResult.suggestedSlot,
    };
  }

  // Enforce daily booking time limit (applies equally to individual students and teams)
  const allBookings = await getBookings();
  const identityForLimit = team_name || user;
  const dailyLimitResult = checkDailyLimit({
    user: identityForLimit,
    from,
    to,
    existingBookings: allBookings,
    limitHours: DAILY_LIMIT_HOURS,
  });

  if (!dailyLimitResult.allowed) {
    throw {
      status: 400,
      error: "DAILY_LIMIT_EXCEEDED",
      message: dailyLimitResult.message,
      remainingHours: dailyLimitResult.remainingHours,
      usedHours: dailyLimitResult.usedHours,
      requestedHours: dailyLimitResult.requestedHours,
      limitHours: dailyLimitResult.limitHours,
    };
  }

  const newId = `BK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
  const booking = {
    id: newId,
    equipment_id,
    user,
    from: newStart.toISOString(),
    to: newEnd.toISOString(),
    status: "pending",
    department: department || "CSE",
    notes: notes || "",
    registration_type: registration_type || (team_name ? "TEAM" : "INDIVIDUAL"),
    team_name: team_name || null,
    team_leader: team_leader || null,
    team_members: Array.isArray(team_members) ? team_members : [],
  };

  if (prisma) {
    try {
      await prisma.booking.create({
        data: {
          id: booking.id,
          equipmentId: booking.equipment_id,
          user: booking.user,
          from: newStart,
          to: newEnd,
          status: booking.status,
        },
      });
    } catch (e) {
      console.warn("Prisma booking save fallback:", e.message);
    }
  }

  inMemoryBookings.unshift(booking);

  // Add notification
  inMemoryNotifications.unshift({
    id: `NOTIF-${Date.now()}`,
    title: "New Booking Request",
    message: `${user} requested booking for ${equipment_id}.`,
    type: "BOOKING_REQUEST",
    role: "STAFF",
    created_at: new Date().toISOString(),
    read: false,
  });

  return {
    id: booking.id,
    equipment_id: booking.equipment_id,
    user: booking.user,
    from: booking.from,
    to: booking.to,
    status: booking.status,
  };
}

/**
 * Move a booking through the approval / lifecycle state machine
 * Supports workflow: pending -> approved/rejected -> issued -> returned
 */
export async function updateBookingStatus(id, newStatus) {
  let target = inMemoryBookings.find((b) => b.id === id);

  if (prisma) {
    try {
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: newStatus },
      });
      if (updated) {
        if (target) target.status = newStatus;
        return { id: updated.id, status: updated.status };
      }
    } catch (e) {
      console.warn("Prisma status update fallback:", e.message);
    }
  }

  if (!target) {
    throw {
      status: 404,
      error: "NOT_FOUND",
      message: `Booking with ID ${id} not found.`,
    };
  }

  target.status = newStatus;

  // Add notification
  inMemoryNotifications.unshift({
    id: `NOTIF-${Date.now()}`,
    title: `Booking ${newStatus.toUpperCase()}`,
    message: `Reservation ${id} on ${target.equipment_id} is now ${newStatus}.`,
    type: `BOOKING_${newStatus.toUpperCase()}`,
    role: "STUDENT",
    created_at: new Date().toISOString(),
    read: false,
  });

  return {
    id: target.id,
    status: target.status,
  };
}

export async function approveBooking(id) {
  return updateBookingStatus(id, "approved");
}

/**
 * Damage & Maintenance Management
 */
export async function reportDamage({ equipment_id, reported_by, description, severity }) {
  const report = {
    id: `DMG-${Date.now().toString().slice(-4)}`,
    equipment_id,
    reported_by: reported_by || "Anonymous Researcher",
    description,
    severity: severity || "MINOR",
    reported_at: new Date().toISOString(),
    status: "UNDER_REVIEW",
  };
  inMemoryDamageReports.unshift(report);

  // Update equipment status
  const eq = inMemoryEquipment.find((e) => e.id === equipment_id);
  if (eq) {
    eq.condition = "DAMAGED";
    eq.status = "damaged";
  }

  inMemoryNotifications.unshift({
    id: `NOTIF-${Date.now()}`,
    title: "Damage Reported",
    message: `${reported_by} reported damage on ${equipment_id}: ${description}`,
    type: "DAMAGE_ALERT",
    role: "STAFF",
    created_at: new Date().toISOString(),
    read: false,
  });

  return report;
}

export async function getDamageReports() {
  return inMemoryDamageReports;
}

export async function updateEquipmentMaintenance(id, { status, notes }) {
  const eq = inMemoryEquipment.find((e) => e.id === id);
  if (!eq) {
    throw { status: 404, error: "NOT_FOUND", message: `Equipment ${id} not found.` };
  }
  eq.status = status; // available, maintenance, damaged
  if (status === "maintenance") {
    eq.condition = "NEEDS_SERVICE";
  } else if (status === "available") {
    eq.condition = "EXCELLENT";
  }
  return eq;
}

/**
 * Notifications Management
 */
export async function getNotifications(role = null) {
  if (role) {
    return inMemoryNotifications.filter((n) => n.role === role || n.role === "ALL");
  }
  return inMemoryNotifications;
}

/**
 * Calendar Events Management (GET, POST, PUT, DELETE /calendar/events)
 */
export async function getCalendarEvents() {
  return inMemoryCalendarEvents;
}

export async function createCalendarEvent({ title, description, start, end, venue, category, all_day }) {
  if (!title || !start || !end) {
    throw { status: 400, error: "BAD_REQUEST", message: "title, start, and end are required." };
  }

  const newEvent = {
    id: `EVT-${Date.now().toString().slice(-4)}`,
    title,
    description: description || "",
    start,
    end,
    venue: venue || "Main Lab",
    category: category || "GENERAL",
    all_day: Boolean(all_day),
    created_at: new Date().toISOString(),
  };

  inMemoryCalendarEvents.push(newEvent);
  return newEvent;
}

export async function updateCalendarEvent(eventId, eventData) {
  const index = inMemoryCalendarEvents.findIndex((e) => e.id === eventId);
  if (index === -1) {
    throw { status: 404, error: "NOT_FOUND", message: `Event ${eventId} not found.` };
  }

  const existing = inMemoryCalendarEvents[index];
  const updated = {
    ...existing,
    ...eventData,
    id: eventId,
  };

  inMemoryCalendarEvents[index] = updated;
  return updated;
}

export async function deleteCalendarEvent(eventId) {
  const index = inMemoryCalendarEvents.findIndex((e) => e.id === eventId);
  if (index === -1) {
    throw { status: 404, error: "NOT_FOUND", message: `Event ${eventId} not found.` };
  }

  inMemoryCalendarEvents.splice(index, 1);
  return { success: true, eventId };
}
