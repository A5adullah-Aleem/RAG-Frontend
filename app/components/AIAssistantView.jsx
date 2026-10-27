"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import ReactMarkdown from "react-markdown";

const suggestedQuestions = [
  "What does our company policy say about notice periods?",
  "Summarize the main points in our documents.",
  "What are the key requirements mentioned in our policies?",
];

export default function AIAssistantView({ organizationId }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [renaming, setRenaming] = useState(false);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  // Load messages of a selected conversation
  const loadMessages = useCallback(
    async (conversationId) => {
      if (!organizationId || !conversationId) return;

      const data = await apiRequest(
        `/organizations/${organizationId}/conversations/${conversationId}/messages`,
        { method: "GET" },
      );

      setMessages(Array.isArray(data) ? data : []);
    },
    [organizationId],
  );

  // Load conversation history whenever organization changes
  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      setMessages([]);
      setConversations([]);
      setActiveConversationId(null);
      setError("");

      if (!organizationId) return;

      setHistoryLoading(true);

      try {
        const data = await apiRequest(
          `/organizations/${organizationId}/conversations`,
          { method: "GET" },
        );

        if (cancelled) return;

        const history = Array.isArray(data) ? data : [];

        setConversations(history);

        // Open the most recent conversation returned by the backend.
        if (history.length > 0) {
          const latestConversation = history[0];

          setActiveConversationId(latestConversation.id);

          const messageData = await apiRequest(
            `/organizations/${organizationId}/conversations/${latestConversation.id}/messages`,
            { method: "GET" },
          );

          if (!cancelled) {
            setMessages(Array.isArray(messageData) ? messageData : []);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load chat history.");
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  // Create a new conversation
  async function handleNewChat() {
    if (!organizationId || loading) return;

    setError("");
    setLoading(true);

    try {
      const conversation = await apiRequest(
        `/organizations/${organizationId}/conversations`,
        {
          method: "POST",
          body: JSON.stringify({
            title: "New Chat",
          }),
        },
      );

      setConversations((previous) => [
        conversation,
        ...previous.filter((item) => item.id !== conversation.id),
      ]);

      setActiveConversationId(conversation.id);
      setMessages([]);
      setQuestion("");
    } catch (err) {
      setError(err.message || "Unable to create a new chat.");
    } finally {
      setLoading(false);
    }
  }

  // Open an existing conversation
  async function handleSelectConversation(conversationId) {
    if (loading || historyLoading) return;

    setError("");
    setActiveConversationId(conversationId);
    setMessages([]);

    try {
      await loadMessages(conversationId);
    } catch (err) {
      setError(err.message || "Unable to load conversation messages.");
    }
  }

  // Delete a conversation
  async function handleDeleteConversation() {
    if (!chatToDelete || deleting) return;

    setError("");
    setDeleting(true);

    const conversationId = chatToDelete.id;

    try {
      await apiRequest(
        `/organizations/${organizationId}/conversations/${conversationId}`,
        { method: "DELETE" },
      );

      const remaining = conversations.filter(
        (conversation) => conversation.id !== conversationId,
      );

      setConversations(remaining);

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);

        if (remaining.length > 0) {
          await handleSelectConversation(remaining[0].id);
        }
      }

      setChatToDelete(null);
    } catch (err) {
      setError(err.message || "Unable to delete conversation.");
    } finally {
      setDeleting(false);
    }
  }
  // Send a question and receive the saved user + assistant messages
  async function handleAsk(event, suggestedQuestion) {
    event?.preventDefault();

    const userQuestion = (suggestedQuestion ?? question).trim();

    if (!userQuestion || loading) return;

    if (!organizationId) {
      setError("Please select an organization first.");
      return;
    }

    setError("");
    setQuestion("");
    setLoading(true);

    try {
      let conversationId = activeConversationId;

      // Create a conversation automatically if none is selected.
      if (!conversationId) {
        const conversation = await apiRequest(
          `/organizations/${organizationId}/conversations`,
          {
            method: "POST",
            body: JSON.stringify({
              title: "New Chat",
            }),
          },
        );

        conversationId = conversation.id;

        setActiveConversationId(conversationId);

        setConversations((previous) => [
          conversation,
          ...previous.filter((item) => item.id !== conversationId),
        ]);
      }

      // This endpoint saves the question and AI response in the database.
      const response = await apiRequest(
        `/organizations/${organizationId}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            question: userQuestion,
          }),
        },
      );

      // The backend returns [user_message, assistant_message].
      if (Array.isArray(response)) {
        setMessages((previous) => [...previous, ...response]);
      } else {
        // Fallback: reload saved messages if the response shape differs.
        await loadMessages(conversationId);
      }

      // Refresh history so the generated conversation title is displayed.
      const history = await apiRequest(
        `/organizations/${organizationId}/conversations`,
        { method: "GET" },
      );

      if (Array.isArray(history)) {
        setConversations(history);
      }
    } catch (err) {
      setError(err.message || "Unable to send your message.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRenameConversation(conversationId) {
    const title = editingTitle.trim();

    if (!title) {
      setError("Chat title cannot be empty.");
      return;
    }

    const conversation = conversations.find(
      (item) => item.id === conversationId,
    );

    if (!conversation || title === conversation.title) {
      setEditingConversationId(null);
      setEditingTitle("");
      return;
    }

    setRenaming(true);
    setError("");

    try {
      const updatedConversation = await apiRequest(
        `/organizations/${organizationId}/conversations/${conversationId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title }),
        },
      );

      setConversations((previous) =>
        previous.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                ...updatedConversation,
                title: updatedConversation.title ?? title,
              }
            : item,
        ),
      );

      setEditingConversationId(null);
      setEditingTitle("");
    } catch (error) {
      setError(error.message || "Failed to rename conversation.");
    } finally {
      setRenaming(false);
    }
  }

  return (
    <section className="subpage">
      <div className="page-eyebrow">ASK YOUR KNOWLEDGE</div>

      <h1>AI Assistant</h1>

      <p className="subpage-description">
        Ask questions and get answers grounded in your organizations documents.
      </p>

      {!organizationId && (
        <div className="document-message document-error">
          Please select an organization to start chatting.
        </div>
      )}

      <div
        className="content-card"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 240px) minmax(0, 1fr)",
          gap: "20px",
          minHeight: "500px",
        }}
      >
        {/* Conversation history sidebar */}
        <aside
          style={{
            borderRight: "1px solid var(--border-color, #e5e7eb)",
            paddingRight: "16px",
            minWidth: 0,
          }}
        >
          <button
            type="button"
            onClick={handleNewChat}
            disabled={!organizationId || loading}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              cursor: "pointer",
            }}
          >
            + New Chat
          </button>

          <h3>Chat History</h3>

          {historyLoading && <p>Loading history...</p>}

          {!historyLoading && conversations.length === 0 && (
            <p>No previous conversations.</p>
          )}

          <div>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  if (editingConversationId !== conversation.id) {
                    handleSelectConversation(conversation.id);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px",
                  marginBottom: "6px",
                  borderRadius: "8px",
                  cursor:
                    editingConversationId === conversation.id
                      ? "default"
                      : "pointer",
                  background:
                    activeConversationId === conversation.id
                      ? "var(--active-chat-bg, #f0f4ff)"
                      : "transparent",
                }}
              >
                {editingConversationId === conversation.id ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleRenameConversation(conversation.id);
                    }}
                    style={{
                      display: "flex",
                      flex: 1,
                      minWidth: 0,
                      gap: "4px",
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      autoFocus
                      value={editingTitle}
                      maxLength={255}
                      disabled={renaming}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setEditingConversationId(null);
                          setEditingTitle("");
                        }
                      }}
                      aria-label="Rename conversation"
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "5px",
                      }}
                    />

                    <button
                      type="submit"
                      title="Save title"
                      aria-label="Save title"
                      disabled={renaming || !editingTitle.trim()}
                      style={{ cursor: "pointer" }}
                    >
                      {renaming ? "…" : "✓"}
                    </button>

                    <button
                      type="button"
                      title="Cancel rename"
                      aria-label="Cancel rename"
                      disabled={renaming}
                      onClick={() => {
                        setEditingConversationId(null);
                        setEditingTitle("");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </form>
                ) : (
                  <>
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={conversation.title}
                    >
                      {conversation.title || "New Chat"}
                    </span>

                    <button
                      type="button"
                      className="chat-history-rename"
                      title="Rename chat"
                      aria-label={`Rename ${conversation.title || "chat"}`}
                      disabled={loading || deleting || renaming}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        setEditingConversationId(conversation.id);
                        setEditingTitle(conversation.title || "");
                        setError("");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      className="chat-history-delete"
                      aria-label={`Delete ${conversation.title || "chat"}`}
                      title="Delete chat"
                      disabled={loading || deleting || renaming}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setChatToDelete(conversation);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main chat area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div className="chat-symbol">✳</div>

          <h2>Your knowledge assistant</h2>

          <p>
            Ask questions about your uploaded documents and get context-based
            answers.
          </p>

          {messages.length === 0 && !loading && (
            <div className="assistant-suggestions">
              <p>Try asking:</p>

              {suggestedQuestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="suggested-question"
                  disabled={!organizationId || loading || historyLoading}
                  onClick={(event) => handleAsk(event, suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div
            className="assistant-messages"
            aria-live="polite"
            style={{ flex: 1 }}
          >
            {messages.map((message) => (
              <div
                className={`assistant-message ${message.role}`}
                key={message.id}
              >
                <strong>
                  {message.role === "user" ? "You" : "NeuralDesk AI"}
                </strong>

                <div className="assistant-message-content">
                  {message.role === "assistant" ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>

                {message.sources?.length > 0 && (
                  <div className="assistant-sources">
                    <strong>Sources</strong>

                    {message.sources.map((source, index) => (
                      <div
                        key={`${source.document_id}-${source.chunk_index}-${index}`}
                      >
                        {typeof source === "string"
                          ? source
                          : (source.filename ??
                            source.document_name ??
                            source.title ??
                            JSON.stringify(source))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="assistant-message assistant">
                <strong>NeuralDesk AI</strong>
                <p>Searching documents and generating an answer...</p>
              </div>
            )}
          </div>

          {error && (
            <div className="document-message document-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="chat-input-placeholder"
            onSubmit={(event) => handleAsk(event)}
          >
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question about your documents..."
              disabled={!organizationId || loading || historyLoading}
              aria-label="Ask a question"
            />

            <button
              type="submit"
              disabled={
                !organizationId || loading || historyLoading || !question.trim()
              }
              aria-label="Send question"
            >
              {loading ? "…" : "↑"}
            </button>
          </form>
        </div>
      </div>
      {chatToDelete && (
        <div
          className="delete-modal-overlay"
          onClick={() => {
            if (!deleting) setChatToDelete(null);
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">!</div>

            <h2 id="delete-modal-title">Delete conversation?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{chatToDelete.title || "this chat"}</strong>? All messages
              in this conversation will be permanently deleted.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-cancel"
                disabled={deleting}
                onClick={() => setChatToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-modal-confirm"
                disabled={deleting}
                onClick={handleDeleteConversation}
              >
                {deleting ? "Deleting..." : "Delete Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
