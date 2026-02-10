import React from "react";
import { NavLink } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * @param {{apiInfo: string}} props
 * @returns {JSX.Element}
 */
export default function Sidebar({ apiInfo }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark" aria-hidden="true" />
        <div className="brandTitle">
          <strong>Event Planner Pro</strong>
          <span>Retro dashboard</span>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        <NavItem to="/" icon="D1" label="Dashboard" end />
        <NavItem to="/calendar" icon="C4" label="Calendar" />
        <NavItem to="/notifications" icon="N!" label="Notifications" />
        <NavItem to="/profile" icon="P0" label="Profile" />
      </nav>

      <div className="sidebarFooter">
        <div className="smallText">
          API: <span style={{ fontFamily: "var(--mono)" }}>{apiInfo}</span>
        </div>
        <div className="smallText">
          Tip: Use <span style={{ fontFamily: "var(--mono)" }}>Esc</span> to close modals.
        </div>
      </div>
    </aside>
  );
}

/**
 * @param {{to: string, icon: string, label: string, end?: boolean}} props
 * @returns {JSX.Element}
 */
function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
    >
      <div className="navIcon" aria-hidden="true">
        {icon}
      </div>
      <div>{label}</div>
    </NavLink>
  );
}
