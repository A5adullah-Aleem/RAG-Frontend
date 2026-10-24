"use client";

export default function AIAssistantView() {
  return (
    <section className="subpage">
      <div className="page-eyebrow">ASK YOUR KNOWLEDGE</div>
      <h1>AI Assistant</h1>
      <p className="subpage-description">
        Ask questions and get answers grounded in your organization’s documents.
      </p>

      <div className="content-card chat-placeholder">
        <div className="chat-symbol">✳</div>
        <h2>Your knowledge assistant</h2>
        <p>
          Once we connect your organization and RAG query endpoint, you’ll be
          able to ask questions and see source citations here.
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
  );
}