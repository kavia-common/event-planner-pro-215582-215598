import { apiRequest } from "./client";

/**
 * NOTE:
 * The downloaded OpenAPI spec currently only contains GET / (health check).
 * This file implements the expected REST endpoints for the Event Planner Pro app.
 * If backend routes differ, update these paths to match /openapi.json once backend is expanded.
 */

// PUBLIC_INTERFACE
export async function healthCheck() {
  /** @type {any} */
  const data = await apiRequest("/", { method: "GET" });
  return data;
}

// PUBLIC_INTERFACE
export async function listEvents(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/events${qs ? `?${qs}` : ""}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createEvent(payload) {
  return apiRequest("/events", { method: "POST", json: payload });
}

// PUBLIC_INTERFACE
export async function updateEvent(eventId, payload) {
  return apiRequest(`/events/${encodeURIComponent(eventId)}`, { method: "PUT", json: payload });
}

// PUBLIC_INTERFACE
export async function deleteEvent(eventId) {
  return apiRequest(`/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
}

// PUBLIC_INTERFACE
export async function rsvpToEvent(eventId, payload) {
  return apiRequest(`/events/${encodeURIComponent(eventId)}/rsvp`, { method: "POST", json: payload });
}

// PUBLIC_INTERFACE
export async function listNotifications() {
  return apiRequest("/notifications", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function markNotificationRead(notificationId) {
  return apiRequest(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: "POST" });
}

// PUBLIC_INTERFACE
export async function getProfile() {
  return apiRequest("/profile", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function updateProfile(payload) {
  return apiRequest("/profile", { method: "PUT", json: payload });
}
