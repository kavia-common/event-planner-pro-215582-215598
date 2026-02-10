import React, { useCallback, useEffect, useState } from "react";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { getProfile, updateProfile } from "../api/endpoints";
import { useToasts } from "../hooks/useToasts";
import { validateProfile } from "../utils/validation";

/**
 * PUBLIC_INTERFACE
 * @returns {JSX.Element}
 */
export default function ProfilePage() {
  const { pushToast } = useToasts();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ displayName: "", email: "" });
  const [errors, setErrors] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProfile();
      setForm({
        displayName: data?.displayName || data?.name || "",
        email: data?.email || ""
      });
      setErrors({});
    } catch (e) {
      setError(e?.message || "Failed to load profile. Ensure backend exposes /profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function save() {
    const v = validateProfile(form);
    if (!v.valid) {
      setErrors(v.errors);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ ...form });
      pushToast({ type: "info", title: "Profile saved", message: "Your changes have been updated." });
      setErrors({});
    } catch (e) {
      pushToast({ type: "error", title: "Save failed", message: e?.message || "Could not update profile." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbarTitle">
          <h1 className="h1">Profile</h1>
          <div className="subtle">Your identity settings for RSVPs and notifications.</div>
        </div>

        <div className="topbarActions">
          <button className="btn" type="button" onClick={refresh} disabled={loading || saving}>
            Refresh
          </button>
          <button className="btn btnPrimary" type="button" onClick={save} disabled={loading || saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel">
          <div className="panelBody">
            <Spinner label="Loading profile..." />
          </div>
        </div>
      ) : error ? (
        <ErrorBanner message={error} onRetry={refresh} />
      ) : (
        <div className="panel">
          <div className="panelHeader">
            <h3 className="panelTitle">Account</h3>
            <span className="badge">Local validation enabled</span>
          </div>
          <div className="panelBody">
            <div className="formGrid">
              <div className="fieldRow">
                <div className="label">Display name</div>
                <input
                  className="input"
                  value={form.displayName}
                  onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="e.g. Neon Navigator"
                  maxLength={80}
                  disabled={saving}
                />
                {errors.displayName ? <div className="errorText">{errors.displayName}</div> : null}
              </div>

              <div className="fieldRow">
                <div className="label">Email</div>
                <input
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  maxLength={120}
                  disabled={saving}
                />
                {errors.email ? <div className="errorText">{errors.email}</div> : null}
              </div>

              <div className="helpText">
                These fields are used by the backend to personalize notifications and RSVP identity.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
