import React, { useCallback, useEffect, useMemo, useState } from "react";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { listEvents } from "../api/endpoints";
import { useToasts } from "../hooks/useToasts";

/**
 * PUBLIC_INTERFACE
 * @returns {JSX.Element}
 */
export default function CalendarPage() {
  const { pushToast } = useToasts();

  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

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

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const eventByDayKey = useMemo(() => {
    /** @type {Record<string, number>} */
    const map = {};
    for (const ev of events) {
      if (!ev?.start) continue;
      const d = new Date(ev.start);
      if (Number.isNaN(d.getTime())) continue;
      const k = dayKey(d);
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }, [events]);

  return (
    <>
      <div className="topbar">
        <div className="topbarTitle">
          <h1 className="h1">Calendar</h1>
          <div className="subtle">A synthwave month grid with event signals per day.</div>
        </div>

        <div className="topbarActions">
          <button className="btn" type="button" onClick={() => setCursor(new Date())}>
            Today
          </button>
          <button className="btn" type="button" onClick={refresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel">
          <div className="panelBody">
            <Spinner label="Loading calendar..." />
          </div>
        </div>
      ) : error ? (
        <ErrorBanner message={error} onRetry={refresh} />
      ) : (
        <div className="panel">
          <div className="panelHeader">
            <h3 className="panelTitle">
              {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </h3>
            <div className="topbarActions">
              <button className="btn" type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}>
                ← Prev
              </button>
              <button className="btn" type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}>
                Next →
              </button>
              <button
                className="btn btnPrimary"
                type="button"
                onClick={() => pushToast({ type: "info", title: "Tip", message: "Create/edit events from the Dashboard." })}
              >
                Help
              </button>
            </div>
          </div>

          <div className="panelBody">
            <div className="calendar">
              <div className="calendarGrid" aria-label="Calendar grid">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="calendarDow">
                    {d}
                  </div>
                ))}
                {grid.map((cell) => {
                  const k = dayKey(cell.date);
                  const count = eventByDayKey[k] || 0;
                  const today = isSameDay(cell.date, new Date());

                  const cls = [
                    "calendarCell",
                    cell.inMonth ? "" : "calendarCellMuted",
                    today ? "calendarCellToday" : ""
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div key={k} className={cls}>
                      <div className="calendarCellTop">
                        <div className="dayNum">{cell.date.getDate()}</div>
                        {count > 0 ? <div className="cellPill">{count} event{count === 1 ? "" : "s"}</div> : null}
                      </div>
                      <div className="helpText">
                        {count > 0 ? "Signals detected." : cell.inMonth ? "Quiet day." : "Outside month."}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** @param {Date} d */
function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** @param {Date} a @param {Date} b */
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * @param {number} year
 * @param {number} monthZero
 * @returns {{date: Date, inMonth: boolean}[]}
 */
function buildMonthGrid(year, monthZero) {
  const first = new Date(year, monthZero, 1);
  const last = new Date(year, monthZero + 1, 0);

  // We want Monday-based weeks.
  const firstDow = (first.getDay() + 6) % 7; // 0=Mon...6=Sun
  const daysInMonth = last.getDate();

  const cells = [];
  // leading
  for (let i = 0; i < firstDow; i++) {
    const d = new Date(year, monthZero, 1 - (firstDow - i));
    cells.push({ date: d, inMonth: false });
  }
  // month days
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, monthZero, day), inMonth: true });
  }
  // trailing to complete 6 weeks (42 cells)
  while (cells.length < 42) {
    const lastCell = cells[cells.length - 1].date;
    const next = new Date(lastCell);
    next.setDate(lastCell.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  return cells;
}
