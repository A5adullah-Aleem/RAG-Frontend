"use client";

import { useState } from "react";

export default function DocumentsView({
  search,
  setSearch,
  selectedOrganizationId,
  uploading,
  handleUpload,
  documentMessage,
  documentsError,
  documentsLoading,
  documents,
  processingDocumentId,
  handleProcessDocument,
  deletingDocumentId,
  handleDeleteDocument,
}) {
  const filteredDocuments = documents.filter((document) =>
    document.filename?.toLowerCase().includes(search.toLowerCase()),
  );

  const [documentToDelete, setDocumentToDelete] = useState(null);

  return (
    <section className="subpage">
      <div className="page-eyebrow">KNOWLEDGE LIBRARY</div>
      <h1>Your documents</h1>
      <p className="subpage-description">
        Upload and manage the files your AI assistant uses to answer questions.
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

        <label className="primary-action upload-button">
          {uploading ? "Uploading..." : "+ Upload documents"}
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleUpload}
            disabled={uploading || !selectedOrganizationId}
            hidden
          />
        </label>
      </div>

      {documentMessage && (
        <div className="document-message" role="status">
          {documentMessage}
        </div>
      )}

      {documentsError && (
        <div className="document-message document-error" role="alert">
          {documentsError}
        </div>
      )}

      <div className="content-card documents-list-card">
        {documentsLoading ? (
          <div className="document-empty-state">
            <h2>Loading documents...</h2>
            <p>Fetching documents from your workspace.</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="document-empty-state">
            <div className="upload-illustration">↑</div>
            <h2>{search ? "No matching documents" : "No documents yet"}</h2>
            <p>
              {search
                ? "Try another search term."
                : "Upload a PDF, DOCX, or TXT file to start building your knowledge library."}
            </p>
            <span className="supported-formats">
              PDF <i /> DOCX <i /> TXT
            </span>
          </div>
        ) : (
          <div className="documents-list">
            {filteredDocuments.map((document) => (
              <div className="document-row" key={document.id}>
                <div className="document-file-icon">
                  {document.filename?.split(".").pop()?.toUpperCase() || "FILE"}
                </div>

                <div className="document-info">
                  <strong>{document.filename}</strong>
                  <small>
                    {document.status || "uploaded"}
                    {document.created_at
                      ? ` · ${new Date(document.created_at).toLocaleDateString()}`
                      : ""}
                  </small>
                </div>

                <div className="document-actions">
                  {document.status !== "processed" && (
                    <button
                      type="button"
                      className="document-action-button"
                      disabled={processingDocumentId === document.id}
                      onClick={() => handleProcessDocument(document.id)}
                    >
                      {processingDocumentId === document.id
                        ? "Processing..."
                        : "Process"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="document-action-button delete-action"
                    disabled={deletingDocumentId === document.id}
                    onClick={() => setDocumentToDelete(document)}
                  >
                    {deletingDocumentId === document.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {documentToDelete && (
        <div
          className="delete-modal-overlay"
          onClick={() => {
            if (!deletingDocumentId) {
              setDocumentToDelete(null);
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-document-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">!</div>

            <h2 id="delete-document-modal-title">Delete document?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{documentToDelete.filename}</strong>? This action cannot
              be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-cancel"
                disabled={deletingDocumentId === documentToDelete.id}
                onClick={() => setDocumentToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-modal-confirm"
                disabled={deletingDocumentId === documentToDelete.id}
                onClick={async () => {
                  await handleDeleteDocument(documentToDelete.id);
                  setDocumentToDelete(null);
                }}
              >
                {deletingDocumentId === documentToDelete.id
                  ? "Deleting..."
                  : "Delete Document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
