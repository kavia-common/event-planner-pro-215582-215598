import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { validateEvent } from "../utils/validation";

/**
 * PUBLIC_INTERFACE
 * @param {{
 *  open: boolean,
 *  mode: "create"|"edit",
 *  initialEvent?: any,
 *  busy?: boolean,
 *  onClose: () => void,
 *  onSubmit: (payload: any) => void
 * }} props
 * @returns {JSX.Element}
 */
export default function EventFormModal({ open, mode, initialEvent, busy = false, onClose, onSubmit }) {
  const title = mode === "edit" ? "Edit event" : "Create event";

  const seed = useMemo(() => {
    const now = new Date();
    const plus1 = new Date(now.getTime() + 60 * 60 * 1000);
    const isoLocal = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    return {
      title: initialEvent?.title || "",
      location: initialEvent?.location || "",
      start: initialEvent?.start || isoLocal(now),
      end: initialEvent?.end || isoLocal(plus1),
      description: initialEvent?.description || ""
    };
  }, [initialEvent]);

  const [form, setForm] = useState(seed);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(seed);
      setErrors({});
    }
  }, [open, seed]);

  const footer = (
    <>
      <button className="btn" type="button" onClick={onClose} disabled={busy}>
        Cancel
      </button>
      <button
        className="btn btnPrimary"
        type="button"
        onClick={() => {
          const v = validateEvent(form);
          if (!v.valid) {
            setErrors(v.errors);
            return;
          }
          onSubmit({ ...form });
        }}
        disabled={busy}
      >
        {busy ? "Saving..." : mode === "edit" ? "Save changes" : "Create"}
      </button>
    </>
  );

  return (
    <Modal open={open} title={title} onClose={onClose} footer={footer}>
      <div className="formGrid">
        <div className="fieldRow">
          <div className="label">Title</div>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Synthwave Planning Session"
            maxLength={140}
          />
          {errors.title ? <div className="errorText">{errors.title}</div> : null}
        </div>

        <div className="grid2">
          <div className="fieldRow">
            <div className="label">Start</div>
            <input
              className="input"
              type="datetime-local"
              value={form.start}
              onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))}
            />
            {errors.start ? <div className="errorText">{errors.start}</div> : null}
          </div>

          <div className="fieldRow">
            <div className="label">End</div>
            <input
              className="input"
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))}
            />
            {errors.end ? <div className="errorText">{errors.end}</div> : null}
          </div>
        </div>

        {errors.time ? <div className="errorText">{errors.time}</div> : null}

        <div className="fieldRow">
          <div className="label">Location (optional)</div>
          <input
            className="input"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="e.g. Neon Arcade, Room 2"
            maxLength={200}
          />
          {errors.location ? <div className="errorText">{errors.location}</div> : null}
        </div>

        <div className="fieldRow">
          <div className="label">Description (optional)</div>
          <textarea
            className="textarea"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Add details, agenda, links..."
            maxLength={2000}
          />
          <div className="helpText">{busy ? <Spinner label="Working..." /> : "Your changes are validated locally before saving."}</div>
        </div>
      </div>
    </Modal>
  );
}
