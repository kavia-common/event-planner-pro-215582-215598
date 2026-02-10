import React from "react";

/**
 * PUBLIC_INTERFACE
 * @param {{
 *  event: any,
 *  onEdit: (event: any) => void,
 *  onDelete: (event: any) => void,
 *  onRsvp: (event: any) => void,
 *  busy?: boolean
 * }} props
 * @returns {JSX.Element}
 */
export default function EventCard({ event, onEdit, onDelete, onRsvp, busy = false }) {
  const when = formatRange(event?.start, event?.end);

  return (
    <div className="eventCard">
      <div className="eventCardTop">
        <div>
          <h4 className="eventTitle">{event?.title || "Untitled event"}</h4>
          <div className="eventMeta">
            <div>{when}</div>
            {event?.location ? <div>📍 {event.location}</div> : null}
          </div>
        </div>
        <div className="badge" title="Event ID">
          <span style={{ fontFamily: "var(--mono)" }}>{String(event?.id ?? "—")}</span>
        </div>
      </div>

      {event?.description ? <div className="helpText">{event.description}</div> : null}

      <div className="eventActions">
        <button className="btn" type="button" onClick={() => onRsvp(event)} disabled={busy}>
          RSVP
        </button>
        <button className="btn btnPrimary" type="button" onClick={() => onEdit(event)} disabled={busy}>
          Edit
        </button>
        <button className="btn btnDanger" type="button" onClick={() => onDelete(event)} disabled={busy}>
          Delete
        </button>
      </div>
    </div>
  );
}

/** @param {string|undefined} start @param {string|undefined} end */
function formatRange(start, end) {
  if (!start || !end) return "Time TBD";
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "Invalid time";

  const opts = { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return `${s.toLocaleString(undefined, opts)} → ${e.toLocaleString(undefined, opts)}`;
}
