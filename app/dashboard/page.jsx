"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import OverviewView from "../components/OverviewView";
import DocumentsView from "../components/DocumentsView";
import AIAssistantView from "../components/AIAssistantView";

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

          <footer className="dashboard-footer">
            <span>NeuralDesk</span>
            <span>Intelligent answers, grounded in your knowledge.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
