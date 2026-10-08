/**
 * Handwritten deterministic conflict detection and slot suggestion engine
 * Follows strict mathematical rule:
 * newStart < existingEnd && newEnd > existingStart
 * NEVER uses AI/LLM for scheduling logic.
 */

/**
 * Checks whether two time intervals overlap.
 * @param {Date|string|number} startA 
 * @param {Date|string|number} endA 
 * @param {Date|string|number} startB 
 * @param {Date|string|number} endB 
 * @returns {boolean} true if intervals conflict
 */
export function isTimeConflict(startA, endA, startB, endB) {
  const newStart = new Date(startA).getTime();
  const newEnd = new Date(endA).getTime();
  const existingStart = new Date(startB).getTime();
  const existingEnd = new Date(endB).getTime();

  if (isNaN(newStart) || isNaN(newEnd) || isNaN(existingStart) || isNaN(existingEnd)) {
    throw new Error("Invalid date provided for conflict detection");
  }

  if (newStart >= newEnd) {
    throw new Error("Booking start time must be before end time");
  }

  // Exact deterministic formula specified in contract:
  return newStart < existingEnd && newEnd > existingStart;
}

/**
 * Validates a new booking against a list of existing active bookings for an equipment item.
 * @param {Date|string} newStart 
 * @param {Date|string} newEnd 
 * @param {Array<{id: string, from: string|Date, to: string|Date, startTime?: string|Date, endTime?: string|Date, status: string}>} existingBookings 
 * @returns {{hasConflict: boolean, conflictingBooking?: Object, suggestedSlot?: {from: string, to: string}}}
 */
export function findBookingConflict(newStart, newEnd, existingBookings = []) {
  const nStart = new Date(newStart).getTime();
  const nEnd = new Date(newEnd).getTime();

  if (isNaN(nStart) || isNaN(nEnd)) {
    throw new Error("Invalid date format provided");
  }

  if (nStart >= nEnd) {
    throw new Error("Start time must be strictly before end time");
  }

  const durationMs = nEnd - nStart;

  // Filter only active reservations (pending and approved are active reservations in OpenAPI)
  const activeBookings = existingBookings.filter((b) => {
    const st = (b.status || "").toLowerCase();
    return st === "pending" || st === "approved" || st === "active";
  });

  // Check each booking using deterministic formula
  let conflictingBooking = null;
  for (const b of activeBookings) {
    const bStart = new Date(b.from || b.startTime).getTime();
    const bEnd = new Date(b.to || b.endTime).getTime();

    if (nStart < bEnd && nEnd > bStart) {
      conflictingBooking = b;
      break;
    }
  }

  if (!conflictingBooking) {
    return {
      hasConflict: false,
    };
  }

  // Conflict exists! Automatically calculate the next available free time slot.
  const suggestedSlot = findNextAvailableSlot(nStart, durationMs, activeBookings);

  return {
    hasConflict: true,
    conflictingBooking,
    message: "This equipment is already booked for the selected time.",
    suggestedSlot,
  };
}

/**
 * Deterministically finds the earliest contiguous free time slot of length `durationMs`
 * starting on or after the requested start time.
 * @param {number} searchStartTimeMs 
 * @param {number} durationMs 
 * @param {Array} activeBookings 
 * @returns {{from: string, to: string}}
 */
export function findNextAvailableSlot(searchStartTimeMs, durationMs, activeBookings = []) {
  // Normalize and sort existing intervals by start time
  const intervals = activeBookings
    .map((b) => ({
      start: new Date(b.from || b.startTime).getTime(),
      end: new Date(b.to || b.endTime).getTime(),
    }))
    .filter((iv) => !isNaN(iv.start) && !isNaN(iv.end))
    .sort((a, b) => a.start - b.start);

  let candidateStart = searchStartTimeMs;

  // Search forward through intervals to find a gap >= durationMs
  let found = false;
  let iterations = 0;
  const maxIterations = 200;

  while (!found && iterations < maxIterations) {
    iterations++;
    const candidateEnd = candidateStart + durationMs;
    let collision = null;

    // Check if candidate [candidateStart, candidateEnd] overlaps any existing interval
    for (const iv of intervals) {
      if (candidateStart < iv.end && candidateEnd > iv.start) {
        collision = iv;
        break;
      }
    }

    if (!collision) {
      found = true;
    } else {
      // Jump candidateStart immediately to the end of the colliding interval
      candidateStart = collision.end;
    }
  }

  const slotStart = new Date(candidateStart);
  const slotEnd = new Date(candidateStart + durationMs);

  return {
    from: slotStart.toISOString(),
    to: slotEnd.toISOString(),
    formattedFrom: slotStart.toLocaleString(),
    formattedTo: slotEnd.toLocaleString(),
    localInputFrom: toDateTimeLocal(slotStart),
    localInputTo: toDateTimeLocal(slotEnd),
  };
}

/**
 * Helper to convert Date to YYYY-MM-DDTHH:mm format for datetime-local input
 */
function toDateTimeLocal(d) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const DAILY_LIMIT_HOURS = 4;

/**
 * Checks whether a booking belongs to a given student or team identifier
 */
export function matchesUserOrTeam(booking, identifier) {
  if (!identifier || !booking) return false;
  const target = String(identifier).trim().toLowerCase();
  const bUser = String(booking.user || "").toLowerCase();
  const bTeam = String(booking.team_name || "").toLowerCase();
  const bLead = String(booking.team_leader || "").toLowerCase();

  if (bUser === target || bTeam === target) return true;
  if (bUser.includes(target) || target.includes(bUser)) return true;
  if (bTeam && (bTeam.includes(target) || target.includes(bTeam))) return true;
  if (bLead && (bLead.includes(target) || target.includes(bLead))) return true;
  return false;
}

/**
 * Calculates already used booking hours on a specific date for a student or team.
 * @param {string} userIdentifier
 * @param {string|Date} targetDate
 * @param {Array} bookings
 * @returns {number} Hours already booked on that day
 */
export function getDailyBookedHours(userIdentifier, targetDate, bookings = []) {
  if (!userIdentifier || !targetDate) return 0;
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return 0;

  const targetDateStr = target.toISOString().slice(0, 10); // YYYY-MM-DD

  // Active bookings for this student or team
  const userBookings = bookings.filter((b) => {
    const st = (b.status || "").toLowerCase();
    const isActive = st === "pending" || st === "approved" || st === "issued" || st === "active";
    if (!isActive) return false;
    return matchesUserOrTeam(b, userIdentifier);
  });

  let totalMs = 0;
  for (const b of userBookings) {
    const bStart = new Date(b.from || b.startTime);
    const bEnd = new Date(b.to || b.endTime);
    if (isNaN(bStart.getTime()) || isNaN(bEnd.getTime())) continue;

    const bStartDateStr = bStart.toISOString().slice(0, 10);
    // If on same calendar day
    if (bStartDateStr === targetDateStr) {
      totalMs += Math.max(0, bEnd.getTime() - bStart.getTime());
    }
  }

  return Number((totalMs / (1000 * 60 * 60)).toFixed(2));
}

/**
 * Evaluates whether a requested booking exceeds the allowed daily limit.
 */
export function checkDailyLimit({ user, from, to, existingBookings = [], limitHours = DAILY_LIMIT_HOURS }) {
  const start = new Date(from);
  const end = new Date(to);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return {
      allowed: true,
      usedHours: 0,
      requestedHours: 0,
      remainingHours: limitHours,
      limitHours,
    };
  }

  const requestedHours = Number(((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2));
  const usedHours = getDailyBookedHours(user, from, existingBookings);
  const remainingHours = Number(Math.max(0, limitHours - usedHours).toFixed(2));
  const totalAfter = Number((usedHours + requestedHours).toFixed(2));

  if (totalAfter > limitHours) {
    return {
      allowed: false,
      usedHours,
      requestedHours,
      remainingHours,
      limitHours,
      message: `Daily limit exceeded: Maximum ${limitHours} hours allowed per student/team per day. You have already booked ${usedHours}h on this date (Remaining: ${remainingHours}h, Requested: ${requestedHours}h).`,
    };
  }

  return {
    allowed: true,
    usedHours,
    requestedHours,
    remainingHours,
    limitHours,
  };
}
