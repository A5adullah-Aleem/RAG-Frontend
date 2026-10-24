"use client";

export default function OverviewView({ setActiveView }) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="page-eyebrow">YOUR KNOWLEDGE HUB</div>
          <h1>Good to have you here.</h1>
          <p>
            Bring your documents together and get answers powered by your own
            knowledge.
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
          <span className="banner-label">INTRODUCING YOUR AI WORKSPACE</span>
          <h2>Your documents have answers.</h2>
          <p>
            Upload company files, ask questions in natural language, and discover
            information with source-backed responses.
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
              Upload a PDF, Word document, or text file to make its contents
              searchable with AI.
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
  );
}