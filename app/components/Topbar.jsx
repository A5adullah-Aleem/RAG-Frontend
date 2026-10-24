"use client";

export default function Topbar({ activeView, handleSignOut }) {
  return (
    <header className="dashboard-topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-separator">/</span>
        <strong>{activeView}</strong>
      </div>

      <div className="topbar-right">
        <span className="connection-indicator">
          <span className="status-dot" />
          Workspace
        </span>
        <button
          className="topbar-avatar"
          title="Sign out"
          onClick={handleSignOut}
        >
          U
        </button>
      </div>
    </header>
  );
}
