import React, { useCallback, useEffect, useState } from "react";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { listNotifications, markNotificationRead } from "../api/endpoints";
import { useToasts } from "../hooks/useToasts";

/**
 * PUBLIC_INTERFACE
 * @returns {JSX.Element}
 */
export default function NotificationsPage() {
  const { pushToast } = useToasts();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listNotifications();
      setItems(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      setError(e?.message || "Failed to load notifications. Ensure backend exposes /notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function markRead(id) {
    if (!id) return;
    setBusyId(String(id));
    try {
      await markNotificationRead(id);
      pushToast({ type: "info", title: "Marked read", message: "Notification updated." });
      await refresh();
    } catch (e) {
      pushToast({ type: "error", title: "Update failed", message: e?.message || "Could not mark as read." });
    } finally {
      setBusyId("");
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbarTitle">
          <h1 className="h1">Notifications</h1>
          <div className="subtle">Backend-driven alerts (RSVP changes, reminders, updates).</div>
        </div>

        <div className="topbarActions">
          <button className="btn" type="button" onClick={refresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel">
          <div className="panelBody">
            <Spinner label="Loading notifications..." />
          </div>
        </div>
      ) : error ? (
        <ErrorBanner message={error} onRetry={refresh} />
      ) : (
        <div className="panel">
          <div className="panelHeader">
            <h3 className="panelTitle">Inbox</h3>
            <span className="badge">{items.length} items</span>
          </div>
          <div className="panelBody">
            {items.length === 0 ? (
              <div className="helpText">
                No notifications yet. Once the backend emits reminders/RSVP updates, they’ll appear here.
              </div>
            ) : (
              <div className="eventList">
                {items.map((n) => (
                  <div key={String(n.id ?? Math.random())} className="eventCard">
                    <div className="eventCardTop">
                      <div>
                        <h4 className="eventTitle">{n.title || "Notification"}</h4>
                        <div className="eventMeta">
                          {n.createdAt ? <div>{new Date(n.createdAt).toLocaleString()}</div> : null}
                          {n.type ? <div>Type: {n.type}</div> : null}
                        </div>
                      </div>
                      <span className="badge">{n.read ? "Read" : "Unread"}</span>
                    </div>

                    {n.message ? <div className="helpText">{n.message}</div> : null}

                    <div className="eventActions">
                      {!n.read ? (
                        <button
                          className="btn btnPrimary"
                          type="button"
                          onClick={() => markRead(n.id)}
                          disabled={busyId === String(n.id)}
                        >
                          {busyId === String(n.id) ? "Working..." : "Mark as read"}
                        </button>
                      ) : (
                        <button className="btn" type="button" disabled>
                          Already read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
