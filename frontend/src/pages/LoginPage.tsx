import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, DEV_USER } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to backend
  };

  function devLogin() {
    login(DEV_USER);
    navigate("/");
  }

  return (
    <section className="auth-page">
      {/* ── Left atmospheric panel ── */}
      <div className="auth-scene">
        <div className="auth-moon">
          <div className="auth-moon-glow" />
          <div className="auth-moon-face" />
        </div>
        <div className="auth-scene-stars" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="auth-star" style={{
              "--x": `${Math.random() * 100}%`,
              "--y": `${Math.random() * 100}%`,
              "--d": `${(Math.random() * 3 + 1).toFixed(2)}s`,
              "--s": `${(Math.random() * 2 + 1).toFixed(1)}px`,
            } as React.CSSProperties} />
          ))}
        </div>
        <div className="auth-scene-content">
          <img src="/img/assets/logo.svg" alt="Wolfy" className="auth-brand-logo" />
          <h1 className="auth-brand-name font-display">Wolfy</h1>
          <p className="auth-brand-tagline">The werewolf game&nbsp;— who do you trust?</p>
        </div>
        <div className="auth-scene-trees" aria-hidden="true">
          <svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 180 L0 120 L20 80 L40 120 L40 90 L60 40 L80 90 L80 75 L100 20 L120 75 L120 110 L140 60 L160 110 L160 180 Z" fill="#0a0917" opacity="0.9"/>
            <path d="M160 180 L160 130 L175 95 L190 130 L190 100 L210 50 L230 100 L230 80 L255 25 L280 80 L280 115 L300 70 L320 115 L320 180 Z" fill="#0a0917" opacity="0.85"/>
            <path d="M300 180 L300 140 L315 105 L330 140 L335 115 L355 65 L375 115 L380 90 L405 30 L430 90 L435 120 L450 80 L465 120 L465 180 Z" fill="#0a0917" opacity="0.9"/>
            <path d="M440 180 L440 145 L455 110 L470 145 L475 120 L495 68 L515 120 L520 100 L545 42 L570 100 L575 130 L600 90 L600 180 Z" fill="#0a0917" opacity="0.85"/>
          </svg>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title font-display">Welcome back</h2>
            <p className="auth-subtitle">Enter the village</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="identifier">Username or email</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  className="auth-input"
                  placeholder="Your username or email"
                  value={form.identifier}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="password">Password</label>
                <a href="/auth/forgot-password" className="auth-forgot">Forgot password?</a>
              </div>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn-primary">
              <span>Enter the game</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button type="button" className="auth-btn-dev" onClick={devLogin}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            <span>Continue as DevWolf <span className="auth-btn-dev-tag">DEV</span></span>
          </button>

          <div className="auth-divider"><span>or sign in with</span></div>

          <div className="auth-socials">
            <button className="auth-social-btn" type="button" aria-label="Continue with Google">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button className="auth-social-btn" type="button" aria-label="Continue with Discord">
              <svg viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              <span>Discord</span>
            </button>
          </div>

          <p className="auth-switch">
            No account yet?{" "}
            <a href="/auth/register" className="auth-switch-link">Create one</a>
          </p>
        </div>
      </div>
    </section>
  );
}
