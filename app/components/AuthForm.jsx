"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!API_URL) {
      setError("Backend URL is not configured.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      const payload = isLogin
        ? {
            email: form.email,
            password: form.password,
          }
        : {
            full_name: form.full_name,
            email: form.email,
            password: form.password,
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.detail)
          ? data.detail.map((item) => item.msg).join(", ")
          : data.detail;

        throw new Error(message || "Something went wrong. Please try again.");
      }

      if (isLogin) {
        localStorage.setItem("access_token", data.access_token);

        router.push("/dashboard");
      } else {
        setSuccess("Account created successfully! You can now log in.");

        setForm({
          full_name: "",
          email: "",
          password: "",
        });
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the server. Check that your backend is running.",
        );
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <Link href="/" className="brand-logo">
          <span className="brand-icon">N</span>
          <span>NeuralDesk</span>
        </Link>

        <div className="brand-content">
          <span className="eyebrow">YOUR AI KNOWLEDGE WORKSPACE</span>

          <h1>
            Your documents.
            <br />
            Your knowledge.
            <br />
            <span>One intelligent workspace.</span>
          </h1>

          <p>
            Bring your company knowledge together and get reliable,
            context-aware answers from your documents with AI-powered search.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-check">✓</span>
              Search your documents using natural language
            </div>

            <div className="feature-item">
              <span className="feature-check">✓</span>
              Get answers with source references
            </div>

            <div className="feature-item">
              <span className="feature-check">✓</span>
              Keep organization knowledge separated
            </div>
          </div>
        </div>

        <p className="brand-footer">
          Intelligent answers, grounded in your knowledge.
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrapper">
          <div className="mobile-brand">
            <span className="brand-icon">N</span>
            NeuralDesk
          </div>

          <div className="form-heading">
            <span className="form-label">
              {isLogin ? "WELCOME BACK" : "GET STARTED"}
            </span>

            <h2>
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>

            <p>
              {isLogin
                ? "Enter your details to access your workspace."
                : "Create an account to start building your AI workspace."}
            </p>
          </div>

          {error && (
            <div className="form-alert error-alert" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="form-alert success-alert" role="status">
              {success} <Link href="/login">Sign in</Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="full_name">Full name</label>

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                  minLength={1}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
            </div>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}

              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link href={isLogin ? "/signup" : "/login"}>
              {isLogin ? "Create account" : "Sign in"}
            </Link>
          </p>

          <p className="form-terms">
            By continuing, you agree to use your workspace in accordance with
            your organizations policies.
          </p>
        </div>
      </section>
    </main>
  );
}
