import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import ToastViewport from "./components/ToastViewport";
import { ToastsProvider, useToasts } from "./hooks/useToasts";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import { getApiInfoForUi } from "./api/client";
import { healthCheck } from "./api/endpoints";

/**
 * PUBLIC_INTERFACE
 * @returns {JSX.Element}
 */
function App() {
  return (
    <ToastsProvider>
      <BrowserRouter>
        <AppShell />
        <ToastViewport />
      </BrowserRouter>
    </ToastsProvider>
  );
}

/**
 * @returns {JSX.Element}
 */
function AppShell() {
  const { pushToast } = useToasts();
  const [apiInfo] = useState(() => getApiInfoForUi());

  useEffect(() => {
    // Probe backend health in a non-blocking way; UI remains usable even if it fails.
    (async () => {
      try {
        await healthCheck();
      } catch (e) {
        pushToast({
          type: "warning",
          title: "Backend not reachable (yet)",
          message: e?.message || "Health check failed. Ensure the backend is running and REACT_APP_API_BASE_URL is correct."
        });
      }
    })();
  }, [pushToast]);

  return (
    <div className="containerApp">
      <Sidebar apiInfo={apiInfo} />
      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
