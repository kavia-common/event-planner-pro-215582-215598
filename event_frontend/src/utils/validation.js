/**
 * Client-side validation helpers.
 */

/**
 * PUBLIC_INTERFACE
 * @param {{title?: string, start?: string, end?: string, location?: string}} event
 * @returns {{valid: boolean, errors: Record<string,string>}}
 */
export function validateEvent(event) {
  const errors = {};

  const title = (event.title || "").trim();
  if (!title) errors.title = "Title is required.";
  if (title.length > 120) errors.title = "Title is too long (max 120 chars).";

  if (!event.start) errors.start = "Start date/time is required.";
  if (!event.end) errors.end = "End date/time is required.";

  if (event.start && event.end) {
    const start = new Date(event.start).getTime();
    const end = new Date(event.end).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) {
      errors.time = "Start/end must be valid date/time values.";
    } else if (end <= start) {
      errors.time = "End must be after start.";
    }
  }

  const loc = (event.location || "").trim();
  if (loc.length > 160) errors.location = "Location is too long (max 160 chars).";

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * PUBLIC_INTERFACE
 * @param {{displayName?: string, email?: string}} profile
 * @returns {{valid: boolean, errors: Record<string,string>}}
 */
export function validateProfile(profile) {
  const errors = {};
  const displayName = (profile.displayName || "").trim();
  const email = (profile.email || "").trim();

  if (!displayName) errors.displayName = "Display name is required.";
  if (displayName.length > 60) errors.displayName = "Display name is too long (max 60 chars).";

  if (!email) errors.email = "Email is required.";
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Email looks invalid.";

  return { valid: Object.keys(errors).length === 0, errors };
}
