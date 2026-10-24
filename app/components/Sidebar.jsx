"use client";

const navigation = [
  { name: "Overview", icon: "◫" },
  { name: "Documents", icon: "▤" },
  { name: "AI Assistant", icon: "✳" },
];

export default function Sidebar({
  activeView,
  setActiveView,
  organizations,
  selectedOrganizationId,
  setSelectedOrganizationId,
  organizationsLoading,
  showWorkspaceOptions,
  setShowWorkspaceOptions,
  handleSignOut,
}) {
  const selectedOrg = organizations.find(
    (org) => String(org.id) === String(selectedOrganizationId)
  );

  return (
    <aside className="dashboard-sidebar">
      <a className="dashboard-brand" href="/dashboard">
        <span className="dashboard-brand-icon">N</span>
        <span>NeuralDesk</span>
      </a>

      <div className="workspace-label">WORKSPACE</div>

      <button
        className="workspace-switcher"
        onClick={() => {
          if (organizations.length > 1) {
            setShowWorkspaceOptions((previous) => !previous);
          } else {
            setActiveView("Overview");
          }
        }}
        disabled={organizationsLoading}
      >
        <span className="workspace-avatar">
          {selectedOrg?.name?.charAt(0)?.toUpperCase() || "W"}
        </span>
        <span className="workspace-details">
          <strong>
            {organizationsLoading
              ? "Loading workspaces..."
              : selectedOrg?.name || "No Workspace"}
          </strong>
          <small>
            {selectedOrg?.role || "Create a workspace to get started"}
          </small>
        </span>
        <span className="switcher-arrow">⌄</span>
      </button>

      {showWorkspaceOptions && organizations.length > 1 && (
        <div className="workspace-options">
          {organizations.map((organization) => (
            <button
              key={organization.id}
              className="workspace-option"
              onClick={() => {
                setSelectedOrganizationId(String(organization.id));
                localStorage.setItem(
                  "selected_organization_id",
                  String(organization.id)
                );
                setShowWorkspaceOptions(false);
                setActiveView("Overview");
              }}
            >
              <span className="workspace-avatar">
                {organization.name.charAt(0).toUpperCase()}
              </span>

              <span className="workspace-details">
                <strong>{organization.name}</strong>
                <small>{organization.role}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-section-label">MENU</div>

      <nav className="dashboard-nav">
        {navigation.map((item) => (
          <button
            key={item.name}
            className={`nav-item ${activeView === item.name ? "active" : ""}`}
            onClick={() => setActiveView(item.name)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.name}</span>
            {item.name === "AI Assistant" && (
              <span className="nav-new">AI</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon">✦</div>
          <strong>Your knowledge, connected.</strong>
          <p>Upload your documents to start asking questions with AI.</p>
          <button onClick={() => setActiveView("Documents")}>
            Explore documents →
          </button>
        </div>

        <button className="profile-button" onClick={handleSignOut}>
          <span className="profile-avatar">U</span>
          <span className="profile-details">
            <strong>Your account</strong>
            <small>Sign out of NeuralDesk</small>
          </span>
          <span className="profile-exit">↗</span>
        </button>
      </div>
    </aside>
  );
}