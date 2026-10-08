import axios from "axios";

const api = axios.create({
  baseURL: typeof window !== "undefined" ? "" : "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;

export async function fetchHealth() {
  const res = await api.get("/health");
  return res.data;
}

export async function fetchEquipment() {
  const res = await api.get("/equipment");
  return res.data;
}

export async function addEquipment(data) {
  const res = await api.post("/equipment", data);
  return res.data;
}

export async function fetchBookings(equipmentId = null) {
  const url = equipmentId ? `/bookings?equipment_id=${equipmentId}` : "/bookings";
  const res = await api.get(url);
  return res.data;
}

export async function requestBooking(payload) {
  try {
    const res = await api.post("/bookings", payload);
    return { success: true, data: res.data };
  } catch (err) {
    const status = err.response?.status;
    const errorData = err.response?.data || {};
    return {
      success: false,
      status,
      error: errorData.error || "UNKNOWN_ERROR",
      message: errorData.message || err.message,
      suggestedSlot: errorData.suggestedSlot || null,
      conflictingBooking: errorData.conflictingBooking || null,
    };
  }
}

export async function approveBookingById(bookingId) {
  const res = await api.post(`/bookings/${bookingId}/approve`);
  return res.data;
}

export async function updateBookingLifecycle(bookingId, status) {
  const res = await api.post(`/api/bookings/${bookingId}/status`, { status });
  return res.data;
}

export async function fetchCalendarEvents() {
  const res = await api.get("/calendar/events");
  return res.data;
}

export async function createCalendarEvent(data) {
  const res = await api.post("/calendar/events", data);
  return res.data;
}

export async function updateCalendarEvent(eventId, data) {
  const res = await api.put(`/calendar/events/${eventId}`, data);
  return res.data;
}

export async function deleteCalendarEvent(eventId) {
  const res = await api.delete(`/calendar/events/${eventId}`);
  return res.data;
}

export async function fetchDamageReports() {
  const res = await api.get("/api/damage");
  return res.data;
}

export async function submitDamageReport(data) {
  const res = await api.post("/api/damage", data);
  return res.data;
}

export async function fetchNotifications(role = null) {
  const url = role ? `/api/notifications?role=${role}` : "/api/notifications";
  const res = await api.get(url);
  return res.data;
}
