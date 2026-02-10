import React, { useEffect, useState } from "react";
import Modal from "./Modal";

/**
 * PUBLIC_INTERFACE
 * @param {{
 *  open: boolean,
 *  event?: any,
 *  busy?: boolean,
 *  onClose: () => void,
 *  onSubmit: (payload: {status: "going"|"maybe"|"not_going", note?: string}) => void
 * }} props
 * @returns {JSX.Element}
 */
export default function RsvpModal({ open, event, busy = false, onClose, onSubmit }) {
  const [status, setStatus] = useState("going");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStatus("going");
      setNote("");
      setError("");
    }
  }, [open]);

  const footer = (
    <>
      <button className="btn" type="button" onClick={onClose} disabled={busy}>
        Cancel
      </button>
      <button
        className="btn btnPrimary"
        type="button"
        onClick={() => {
          if (!["going", "maybe", "not_going"].includes(status)) {
            setError("Pick a valid RSVP status.");
            return;
          }
          onSubmit({ status, note: note.trim() || undefined });
        }}
        disabled={busy}
      >
        {busy ? "Submitting..." : "Submit RSVP"}
      </button>
    </>
  );

  return (
    <Modal open={open} title={event ? `RSVP — ${event.title || "Event"}` : "RSVP"} onClose={onClose} footer={footer}>
      <div className="formGrid">
        <div className="fieldRow">
          <div className="label">Status</div>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} disabled={busy}>
            <option value="going">Going</option>
            <option value="maybe">Maybe</option>
            <option value="not_going">Not going</option>
          </select>
        </div>

        <div className="fieldRow">
          <div className="label">Note (optional)</div>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. I'll arrive 10 mins late"
            maxLength={220}
            disabled={busy}
          />
          <div className="helpText">This is stored with your RSVP (if supported by backend).</div>
        </div>

        {error ? <div className="errorText">{error}</div> : null}
      </div>
    </Modal>
  );
}
