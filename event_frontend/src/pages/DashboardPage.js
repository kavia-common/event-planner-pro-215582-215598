import React, { useCallback, useEffect, useMemo, useState } from "react";
import ErrorBanner from "../components/ErrorBanner";
import EventCard from "../components/EventCard";
import EventFormModal from "../components/EventFormModal";
import RsvpModal from "../components/RsvpModal";
import Spinner from "../components/Spinner";
import { createEvent, deleteEvent, listEvents, rsvpToEvent, updateEvent } from "../api/endpoints";
import { useToasts } from "../hooks/useToasts";

/**
 * PUBLIC_INTERFACE
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const { pushToast } = useToasts();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [rsvpOpen, setRsvpOpen] = useState(false);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((e) => {
        const t = new Date(e.start).getTime();
        return !Number.isNaN(t) && t >= now - 6 * 60 * 60 * 1000;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listEvents();
      setEvents(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      setError(e?.message || "Failed to load events. Ensure backend exposes /events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(payload) {
    setBusy(true);
    try {
      await createEvent(payload);
      pushToast({ type: "info", title: "Event created", message: "Your event has been saved." });
      setEventModalOpen(false);
      await refresh();
    } catch (e) {
      pushToast({ type: "error", title: "Create failed", message: e?.message || "Could not create event." });
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(payload) {
    if (!selectedEvent?.id) {
      pushToast({ type: "error", title: "Missing event id", message: "Cannot update event without an id." });
      return;
    }
    setBusy(true);
    try {
      await updateEvent(selectedEvent.id, payload);
      pushToast({ type: "info", title: "Event updated", message: "Changes saved." });
      setEventModalOpen(false);
      await refresh();
    } catch (e) {
      pushToast({ type: "error", title: "Update failed", message: e?.message || "Could not update event." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(ev) {
    if (!ev?.id) {
      pushToast({ type: "error", title: "Missing event id", message: "Cannot delete event without an id." });
      return;
    }
    const ok = window.confirm(`Delete "${ev.title || "this event"}"? This cannot be undone.`);
    if (!ok) return;

    setBusy(true);
    try {
      await deleteEvent(ev.id);
      pushToast({ type: "warning", title: "Event deleted", message: "The event has been removed." });
      await refresh();
    } catch (e) {
      pushToast({ type: "error", title: "Delete failed", message: e?.message || "Could not delete event." });
    } finally {
      setBusy(false);
    }
  }

  async function handleRsvpSubmit(payload) {
    if (!selectedEvent?.id) {
      pushToast({ type: "error", title: "Missing event id", message: "Cannot RSVP without an event id." });
      return;
    }
    setBusy(true);
    try {
      await rsvpToEvent(selectedEvent.id, payload);
      pushToast({ type: "info", title: "RSVP saved", message: `Status: ${payload.status}` });
      setRsvpOpen(false);
      await refresh();
    } catch (e) {
      pushToast({ type: "error", title: "RSVP failed", message: e?.message || "Could not RSVP." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbarTitle">
          <h1 className="h1">Dashboard</h1>
          <div className="subtle">Manage events, RSVP status, and quick actions.</div>
        </div>

        <div className="topbarActions">
          <button
            className="btn btnPrimary"
            type="button"
            onClick={() => {
              setSelectedEvent(null);
              setEventModalMode("create");
              setEventModalOpen(true);
            }}
            disabled={busy}
          >
            + Create event
          </button>
          <button className="btn" type="button" onClick={refresh} disabled={loading || busy}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel">
          <div className="panelBody">
            <Spinner label="Loading events..." />
            <div className="helpText" style={{ marginTop: 10 }}>
              If this keeps spinning, ensure the backend provides <span style={{ fontFamily: "var(--mono)" }}>/events</span>.
            </div>
          </div>
        </div>
      ) : error ? (
        <ErrorBanner message={error} onRetry={refresh} />
      ) : (
        <div className="grid2">
          <div className="panel">
            <div className="panelHeader">
              <h3 className="panelTitle">Upcoming</h3>
              <span className="badge">{upcoming.length} items</span>
            </div>
            <div className="panelBody">
              {upcoming.length === 0 ? (
                <div className="helpText">No upcoming events. Create one to start your neon schedule.</div>
              ) : (
                <div className="eventList">
                  {upcoming.slice(0, 8).map((ev) => (
                    <EventCard
                      key={String(ev.id ?? ev.title ?? Math.random())}
                      event={ev}
                      busy={busy}
                      onEdit={(e) => {
                        setSelectedEvent(e);
                        setEventModalMode("edit");
                        setEventModalOpen(true);
                      }}
                      onDelete={handleDelete}
                      onRsvp={(e) => {
                        setSelectedEvent(e);
                        setRsvpOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panelHeader">
              <h3 className="panelTitle">Stats</h3>
              <span className="badge">Retro telemetry</span>
            </div>
            <div className="panelBody">
              <div className="grid3">
                <div className="kpi">
                  <div className="kpiLabel">Total events</div>
                  <div className="kpiValue">{events.length}</div>
                  <div className="kpiMeta">Synced</div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">Upcoming (8h window)</div>
                  <div className="kpiValue">{upcoming.length}</div>
                  <div className="kpiMeta">Hot</div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">System</div>
                  <div className="kpiValue">OK</div>
                  <div className="kpiMeta">UI ready</div>
                </div>
              </div>

              <div className="helpText" style={{ marginTop: 12 }}>
                Tip: Edit an event to adjust dates for the calendar view.
              </div>
            </div>
          </div>
        </div>
      )}

      <EventFormModal
        open={eventModalOpen}
        mode={eventModalMode}
        initialEvent={selectedEvent}
        busy={busy}
        onClose={() => setEventModalOpen(false)}
        onSubmit={(payload) => (eventModalMode === "edit" ? handleUpdate(payload) : handleCreate(payload))}
      />

      <RsvpModal
        open={rsvpOpen}
        event={selectedEvent}
        busy={busy}
        onClose={() => setRsvpOpen(false)}
        onSubmit={handleRsvpSubmit}
      />
    </>
  );
}
