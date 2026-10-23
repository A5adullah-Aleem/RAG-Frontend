"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Overview", icon: "◫" },
  { name: "Documents", icon: "▤" },
  { name: "AI Assistant", icon: "✳" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState("Overview");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const frame = requestAnimationFrame(() => {
      setAuthenticated(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  if (!authenticated) {
    return <div className="dashboard-loading">Loading workspace...</div>;
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="/dashboard">
          <span className="dashboard-brand-icon">N</span>
          <span>NeuralDesk</span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <button
          className="workspace-switcher"
          onClick={() => setActiveView("Overview")}
        >
          <span className="workspace-avatar">M</span>
          <span className="workspace-details">
            <strong>My Workspace</strong>
            <small>Personal workspace</small>
          </span>
          <span className="switcher-arrow">⌄</span>
        </button>

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

      <main className="dashboard-main">
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

        <div className="dashboard-content">
          {activeView === "Overview" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="page-eyebrow">YOUR KNOWLEDGE HUB</div>
                  <h1>Good to have you here.</h1>
                  <p>
                    Bring your documents together and get answers powered by
                    your own knowledge.
                  </p>
                </div>

                <button
                  className="primary-action"
                  onClick={() => setActiveView("Documents")}
                >
                  <span>＋</span> Upload documents
                </button>
              </section>

              <section className="welcome-banner">
                <div className="banner-copy">
                  <span className="banner-label">
                    INTRODUCING YOUR AI WORKSPACE
                  </span>
                  <h2>Your documents have answers.</h2>
                  <p>
                    Upload company files, ask questions in natural language, and
                    discover information with source-backed responses.
                  </p>
                  <button
                    className="banner-button"
                    onClick={() => setActiveView("AI Assistant")}
                  >
                    Explore AI assistant <span>→</span>
                  </button>
                </div>

                <div className="banner-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="art-card art-card-back">
                    <span>▤</span>
                    <i />
                    <i />
                  </div>
                  <div className="art-core">✳</div>
                  <div className="art-card art-card-front">
                    <span className="art-check">✓</span>
                    <div>
                      <strong>Knowledge found</strong>
                      <small>Answers with sources</small>
                    </div>
                  </div>
                </div>
              </section>

              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-card-top">
                    <span className="stat-icon lavender">▤</span>
                    <span className="stat-caption">YOUR LIBRARY</span>
                  </div>
                  <div className="stat-value">—</div>
                  <div className="stat-label">Documents uploaded</div>
                  <div className="stat-footnote">
                    Connect your workspace to view documents
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-card-top">
                    <span className="stat-icon mint">✳</span>
                    <span className="stat-caption">AI ASSISTANT</span>
                  </div>
                  <div className="stat-value">Ready</div>
                  <div className="stat-label">Ask your documents</div>
                  <button
                    className="stat-link"
                    onClick={() => setActiveView("AI Assistant")}
                  >
                    Start a conversation →
                  </button>
                </article>

                <article className="stat-card">
                  <div className="stat-card-top">
                    <span className="stat-icon peach">⌘</span>
                    <span className="stat-caption">ORGANIZATION</span>
                  </div>
                  <div className="stat-value">1</div>
                  <div className="stat-label">Workspace selected</div>
                  <div className="stat-footnote">
                    Organization switching will be connected next
                  </div>
                </article>
              </section>

              <section className="content-grid">
                <article className="content-card recent-card">
                  <div className="card-heading">
                    <div>
                      <h2>Recent documents</h2>
                      <p>Your knowledge library at a glance</p>
                    </div>
                    <button
                      className="text-action"
                      onClick={() => setActiveView("Documents")}
                    >
                      View all <span>→</span>
                    </button>
                  </div>

                  <div className="empty-documents">
                    <div className="empty-file-icon">▤</div>
                    <strong>Your library starts here</strong>
                    <p>
                      Upload a PDF, Word document, or text file to make its
                      contents searchable with AI.
                    </p>
                    <button
                      className="secondary-action"
                      onClick={() => setActiveView("Documents")}
                    >
                      Go to documents
                    </button>
                  </div>
                </article>

                <article className="content-card quick-card">
                  <div className="card-heading">
                    <div>
                      <h2>Quick actions</h2>
                      <p>What would you like to do?</p>
                    </div>
                  </div>

                  <button
                    className="quick-action"
                    onClick={() => setActiveView("Documents")}
                  >
                    <span className="quick-icon lavender">＋</span>
                    <span className="quick-copy">
                      <strong>Add documents</strong>
                      <small>Build your knowledge library</small>
                    </span>
                    <span className="quick-arrow">→</span>
                  </button>

                  <button
                    className="quick-action"
                    onClick={() => setActiveView("AI Assistant")}
                  >
                    <span className="quick-icon mint">✳</span>
                    <span className="quick-copy">
                      <strong>Ask AI a question</strong>
                      <small>Find answers in your files</small>
                    </span>
                    <span className="quick-arrow">→</span>
                  </button>

                  <div className="privacy-note">
                    <span>✓</span>
                    Your organization’s documents stay separated by workspace.
                  </div>
                </article>
              </section>
            </>
          )}

          {activeView === "Documents" && (
            <section className="subpage">
              <div className="page-eyebrow">KNOWLEDGE LIBRARY</div>
              <h1>Your documents</h1>
              <p className="subpage-description">
                Upload and manage the files your AI assistant uses to answer
                questions.
              </p>

              <div className="document-toolbar">
                <label className="search-box">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search documents..."
                  />
                </label>
                <button className="primary-action" disabled>
                  ＋ Upload documents
                </button>
              </div>

              <div className="content-card document-empty-state">
                <div className="upload-illustration">↑</div>
                <h2>Connect your document library</h2>
                <p>
                  The documents interface is ready for integration. Next, we’ll
                  connect it to your FastAPI upload and list endpoints.
                </p>
                <span className="supported-formats">
                  PDF <i /> DOCX <i /> TXT
                </span>
              </div>
            </section>
          )}

          {activeView === "AI Assistant" && (
            <section className="subpage">
              <div className="page-eyebrow">ASK YOUR KNOWLEDGE</div>
              <h1>AI Assistant</h1>
              <p className="subpage-description">
                Ask questions and get answers grounded in your organization’s
                documents.
              </p>

              <div className="content-card chat-placeholder">
                <div className="chat-symbol">✳</div>
                <h2>Your knowledge assistant</h2>
                <p>
                  Once we connect your organization and RAG query endpoint,
                  you’ll be able to ask questions and see source citations here.
                </p>
                <div className="suggested-question">
                  “What does our company policy say about notice periods?”
                </div>
                <div className="chat-input-placeholder">
                  <span>Ask a question about your documents...</span>
                  <button disabled aria-label="Send question">
                    ↑
                  </button>
                </div>
              </div>
            </section>
          )}

          <footer className="dashboard-footer">
            <span>NeuralDesk</span>
            <span>Intelligent answers, grounded in your knowledge.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
