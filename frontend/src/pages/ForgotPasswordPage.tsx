import { useState } from "react";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to backend
    setSubmitted(true);
  };

  return (
    <section
      className="auth-page"
      style={{
        backgroundImage: "url(/img/assets/scene_elements/scene_night-special_plain.svg)",
        backgroundPosition: "50% 80%",
        backgroundSize: "cover",
      }}
    >
      {/* Gradient overlay */}
      <div className="auth-gradient-bg" />

      {/* Centered card */}
      <div className="auth-main-block">
        {/* Top: logo + title + subtitle */}
        <div className="auth-top-content">
          <div className="auth-logo-wrap">
            <img src="/img/assets/logo_background.svg" alt="Wolfy logo" />
          </div>
          <h1 className="auth-card-title">Forgot your password?</h1>
          <h2 className="auth-card-subtitle">No worries, we'll help you access your account.</h2>
        </div>

        {/* Bottom: form */}
        <div className="auth-bottom-content">
          {submitted ? (
            <div className="auth-forgot-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p>A link to reset your password has been sent.</p>
            </div>
          ) : (
            <>
              <div className="auth-social-header">
                <div className="auth-divider-line" />
                <p>Enter your email address</p>
              </div>

              <form className="auth-manual-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-input-group">
                  <img src="/img/icons/user.svg" alt="Identity" className="auth-input-img" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <button type="submit" className="auth-validate-btn">Validate</button>
              </form>
            </>
          )}

          <div className="auth-no-account">
            No account? <Link to="/auth/register" className="auth-register-link">Register</Link>
          </div>
        </div>
      </div>

      {/* Floating skin character */}
      <div className="auth-skin-block" aria-hidden="true">
        <div className="avatar-container">
          <div
            className="avatar-platform"
            style={{ backgroundImage: "url(/img/assets/plateform.svg)" }}
          />
          <img
            src="/img/assets/skin-top1.svg"
            alt="Skin"
            className="avatar-skin-render"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
