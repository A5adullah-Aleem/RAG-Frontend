"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import OverviewView from "../components/OverviewView";
import DocumentsView from "../components/DocumentsView";
import AIAssistantView from "../components/AIAssistantView";
import MembersView from "../components/MembersView";

export default function DashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState("Overview");
  const [search, setSearch] = useState("");

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [organizationsError, setOrganizationsError] = useState("");
  const [showWorkspaceOptions, setShowWorkspaceOptions] = useState(false);

  const [showCreateOrganizationModal, setShowCreateOrganizationModal] =
    useState(false);

  const [newOrganizationName, setNewOrganizationName] = useState("");

  const [creatingOrganization, setCreatingOrganization] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processingDocumentId, setProcessingDocumentId] = useState(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [documentMessage, setDocumentMessage] = useState("");

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

  useEffect(() => {
    if (!authenticated) return;

    async function loadOrganizations() {
      setOrganizationsLoading(true);
      setOrganizationsError("");

      try {
        const data = await apiRequest("/organizations/");
        console.log("Organizations API response:", data);

        setOrganizations(data);

        const savedId = localStorage.getItem("selected_organization_id");
        const savedExists = data.some(
          (org) => String(org.id) === String(savedId),
        );

        const organizationId = savedExists
          ? String(savedId)
          : data.length > 0
            ? String(data[0].id)
            : "";

        setSelectedOrganizationId(organizationId);

        if (organizationId) {
          localStorage.setItem("selected_organization_id", organizationId);
        } else {
          localStorage.removeItem("selected_organization_id");
        }
      } catch (error) {
        console.error("Organizations loading failed:", error);
        setOrganizationsError(error.message);
      } finally {
        setOrganizationsLoading(false);
      }
    }

    loadOrganizations();
  }, [authenticated]);

  async function loadDocuments(organizationId = selectedOrganizationId) {
    if (!organizationId) {
      setDocuments([]);
      return;
    }

    setDocumentsLoading(true);
    setDocumentsError("");

    try {
      const data = await apiRequest(
        `/organizations/${organizationId}/documents`,
      );
      setDocuments(data);
    } catch (error) {
      setDocumentsError(error.message);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }

  useEffect(() => {
    if (!authenticated || !selectedOrganizationId) {
      setDocuments([]);
      return;
    }

    let cancelled = false;

    async function fetchDocuments() {
      setDocumentsLoading(true);
      setDocumentsError("");

      try {
        const data = await apiRequest(
          `/organizations/${selectedOrganizationId}/documents`,
        );

        if (!cancelled) {
          setDocuments(data);
        }
      } catch (error) {
        if (!cancelled) {
          setDocumentsError(error.message);
          setDocuments([]);
        }
      } finally {
        if (!cancelled) {
          setDocumentsLoading(false);
        }
      }
    }

    fetchDocuments();

    return () => {
      cancelled = true;
    };
  }, [authenticated, selectedOrganizationId]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file || !selectedOrganizationId) return;

    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setDocumentMessage("Only PDF, DOCX, and TXT files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setDocumentMessage("Maximum file size is 10 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setDocumentMessage("");

    try {
      await apiRequest(`/organizations/${selectedOrganizationId}/documents`, {
        method: "POST",
        body: formData,
      });

      setDocumentMessage("Document uploaded successfully.");
      await loadDocuments();
    } catch (error) {
      setDocumentMessage(error.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleProcessDocument(documentId) {
    if (!selectedOrganizationId) return;

    setProcessingDocumentId(documentId);
    setDocumentMessage("");

    try {
      const result = await apiRequest(
        `/organizations/${selectedOrganizationId}/documents/${documentId}/process`,
        { method: "POST" },
      );

      setDocumentMessage(
        `Processing complete. ${result.total_chunks} chunks and ${result.embeddings_generated} embeddings generated.`,
      );

      await loadDocuments();
    } catch (error) {
      setDocumentMessage(error.message);
    } finally {
      setProcessingDocumentId(null);
    }
  }

  async function handleCreateOrganization(event) {
    event.preventDefault();

    const name = newOrganizationName.trim();

    if (!name) {
      setOrganizationsError("Organization name cannot be empty.");
      return;
    }

    setCreatingOrganization(true);
    setOrganizationsError("");

    try {
      const organization = await apiRequest("/organizations/", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      // Add the new organization to the sidebar list.
      setOrganizations((previous) => {
        const alreadyExists = previous.some(
          (org) => String(org.id) === String(organization.id),
        );

        return alreadyExists ? previous : [...previous, organization];
      });

      // Automatically select the newly created organization.
      const newOrganizationId = String(organization.id);

      setSelectedOrganizationId(newOrganizationId);

      localStorage.setItem("selected_organization_id", newOrganizationId);

      setShowWorkspaceOptions(false);
      setShowCreateOrganizationModal(false);
      setNewOrganizationName("");
      setActiveView("Overview");
    } catch (error) {
      setOrganizationsError(error.message || "Failed to create organization.");
    } finally {
      setCreatingOrganization(false);
    }
  }

  async function handleDeleteDocument(documentId) {
    if (!selectedOrganizationId) return;

    setDeletingDocumentId(documentId);
    setDocumentMessage("");

    try {
      await apiRequest(
        `/organizations/${selectedOrganizationId}/documents/${documentId}`,
        { method: "DELETE" },
      );

      setDocuments((previous) =>
        previous.filter((document) => document.id !== documentId),
      );

      setDocumentMessage("Document deleted successfully.");
    } catch (error) {
      setDocumentMessage(error.message);
      throw error;
    } finally {
      setDeletingDocumentId(null);
    }
  }

  function handleSignOut() {
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  if (!authenticated) {
    return <div className="dashboard-loading">Loading workspace...</div>;
  }

  return (
    <div className="dashboard-shell">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        organizations={organizations}
        selectedOrganizationId={selectedOrganizationId}
        setSelectedOrganizationId={setSelectedOrganizationId}
        organizationsLoading={organizationsLoading}
        showWorkspaceOptions={showWorkspaceOptions}
        setShowWorkspaceOptions={setShowWorkspaceOptions}
        handleSignOut={handleSignOut}
        onCreateOrganization={() => {
          setOrganizationsError("");
          setNewOrganizationName("");
          setShowCreateOrganizationModal(true);
        }}
      />

      <main className="dashboard-main">
        <Topbar activeView={activeView} handleSignOut={handleSignOut} />

        <div className="dashboard-content">
          {activeView === "Overview" && (
            <OverviewView setActiveView={setActiveView} />
          )}

          {activeView === "Documents" && (
            <DocumentsView
              search={search}
              setSearch={setSearch}
              selectedOrganizationId={selectedOrganizationId}
              uploading={uploading}
              handleUpload={handleUpload}
              documentMessage={documentMessage}
              documentsError={documentsError}
              documentsLoading={documentsLoading}
              documents={documents}
              processingDocumentId={processingDocumentId}
              handleProcessDocument={handleProcessDocument}
              deletingDocumentId={deletingDocumentId}
              handleDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeView === "AI Assistant" && (
            <AIAssistantView organizationId={selectedOrganizationId} />
          )}
          {activeView === "Members" && (
            <MembersView
              organizationId={selectedOrganizationId}
              organizationRole={
                organizations.find(
                  (org) => String(org.id) === String(selectedOrganizationId),
                )?.role
              }
            />
          )}

          <footer className="dashboard-footer">
            <span>NeuralDesk</span>
            <span>Intelligent answers, grounded in your knowledge.</span>
          </footer>
        </div>
      </main>
      {showCreateOrganizationModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => {
            if (!creatingOrganization) {
              setShowCreateOrganizationModal(false);
              setOrganizationsError("");
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-organization-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="create-organization-title">Create Organization</h2>

            <p>
              Create a workspace to organize your documents and AI
              conversations.
            </p>

            <form onSubmit={handleCreateOrganization}>
              <label
                htmlFor="organization-name"
                style={{
                  display: "block",
                  marginTop: "20px",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                Organization Name
              </label>

              <input
                id="organization-name"
                type="text"
                value={newOrganizationName}
                onChange={(event) => {
                  setNewOrganizationName(event.target.value);
                  setOrganizationsError("");
                }}
                placeholder="e.g. My Company"
                maxLength={255}
                autoFocus
                required
                disabled={creatingOrganization}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  border: "1px solid var(--border-color, #d1d5db)",
                  borderRadius: "8px",
                  font: "inherit",
                }}
              />

              {organizationsError && (
                <div
                  className="document-message document-error"
                  role="alert"
                  style={{ marginTop: "12px" }}
                >
                  {organizationsError}
                </div>
              )}

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="delete-modal-cancel"
                  disabled={creatingOrganization}
                  onClick={() => {
                    setShowCreateOrganizationModal(false);
                    setOrganizationsError("");
                    setNewOrganizationName("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="delete-modal-confirm"
                  disabled={creatingOrganization || !newOrganizationName.trim()}
                >
                  {creatingOrganization ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
