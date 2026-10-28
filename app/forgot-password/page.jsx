"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!API_URL) {
      setError("Backend URL is not configured.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to process your request.");
      }

      setMessage(
        "If an account exists for this email, a reset link will be sent. Check your inbox.",
      );
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-form-wrapper">
          <div className="form-heading">
            <span className="form-label">ACCOUNT RECOVERY</span>
            <h2>Forgot your password?</h2>
            <p>
              Enter your registered email address and we’ll send you a password
              reset link.
            </p>
          </div>

          {error && (
            <div className="form-alert error-alert" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="form-alert success-alert" role="status">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Please wait..." : "Send reset link"}
            </button>
          </form>

          <p className="auth-switch">
            Remember your password? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
