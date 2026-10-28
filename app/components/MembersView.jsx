"use client";

import { useCallback, useEffect, useState } from "react";

export default function MembersView({ organizationId, organizationRole }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [adding, setAdding] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const canManage = ["owner", "admin"].includes(
    String(organizationRole || "").toLowerCase(),
  );

  const loadMembers = useCallback(async () => {
    if (!organizationId) {
      setMembers([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${organizationId}/members`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to load members.");
      }

      setMembers(await response.json());
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, token]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  async function handleAddMember(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter the member's email.");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${organizationId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ email: email.trim(), role }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to add member.");
      }

      const newMember = await response.json();

      setMembers((previous) => [
        ...previous.filter((member) => member.user_id !== newMember.user_id),
        newMember,
      ]);
      setEmail("");
      setRole("member");
      setShowAddModal(false);
      setSuccess("Member added successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setAdding(false);
    }
  }

  if (!organizationId) {
    return (
      <section className="members-view">
        <h1>Members</h1>
        <p>Please create or select a workspace first.</p>
      </section>
    );
  }

  return (
    <section className="members-view">
      <div className="members-header">
        <div>
          <h1>Organization Members</h1>
          <p>Manage the people who have access to this workspace.</p>
        </div>

        {canManage && (
          <button
            type="button"
            className="members-add-button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowAddModal(true);
            }}
          >
            + Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="document-message document-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="document-message" role="status">
          {success}
        </div>
      )}

      <div className="members-card">
        {loading ? (
          <p className="members-empty">Loading members...</p>
        ) : error && members.length === 0 ? (
          <p className="members-empty">Unable to load members.</p>
        ) : members.length === 0 ? (
          <p className="members-empty">No members found.</p>
        ) : (
          <div className="members-table-wrapper">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.user_id}>
                    <td>
                      <div className="member-name-cell">
                        <span className="member-avatar">
                          {member.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                        <strong>{member.full_name}</strong>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span
                        className={`member-role member-role-${member.role}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td>
                      {member.joined_at
                        ? new Date(member.joined_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => {
            if (!adding) setShowAddModal(false);
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-member-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="add-member-title">Add Organization Member</h2>
            <p>The user must already have an account in NeuralDesk.</p>

            <form onSubmit={handleAddMember}>
              <label className="members-form-label" htmlFor="member-email">
                Email Address
              </label>
              <input
                id="member-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="member@example.com"
                required
                disabled={adding}
                className="members-form-input"
              />

              <label className="members-form-label" htmlFor="member-role">
                Role
              </label>
              <select
                id="member-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                disabled={adding}
                className="members-form-input"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                {String(organizationRole).toLowerCase() === "owner" && (
                  <option value="owner">Owner</option>
                )}
              </select>

              {error && (
                <div className="document-message document-error" role="alert">
                  {error}
                </div>
              )}

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="delete-modal-cancel"
                  disabled={adding}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="delete-modal-confirm"
                  disabled={adding || !email.trim()}
                >
                  {adding ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
