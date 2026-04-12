import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, DEV_USER } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ login: "", password: "" });

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
          <h1 className="auth-card-title">Welcome back to Wolfy! 💜</h1>
          <h2 className="auth-card-subtitle">Who are you?</h2>
        </div>

        {/* Bottom: social + form */}
        <div className="auth-bottom-content">
          {/* Social sign-in buttons */}
          <div className="auth-social-btns">
            <button className="auth-social-btn auth-fb" type="button" aria-label="Continue with Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button className="auth-social-btn auth-tw" type="button" aria-label="Continue with Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button className="auth-social-btn auth-discord" type="button" aria-label="Continue with Discord">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
            </button>
            <button className="auth-social-btn auth-google" type="button" aria-label="Continue with Google">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button className="auth-social-btn auth-apple" type="button" aria-label="Continue with Apple">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            </button>
          </div>

          {/* "Or use the manual log in" divider */}
          <div className="auth-social-header">
            <div className="auth-divider-line" />
            <p>Or use the manual log in</p>
            <div className="auth-divider-line" />
          </div>

          {/* Manual login form */}
          <form className="auth-manual-form" onSubmit={handleSubmit} noValidate id="login-form">
            <div className="auth-input-group">
              <img src="/img/icons/user.svg" alt="Identity" className="auth-input-img" />
              <input
                name="login"
                type="text"
                placeholder="Username or email address"
                value={form.login}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
            <div className="auth-input-group">
              <svg className="auth-input-img auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="auth-forgot-group">
              <Link to="/auth/forgot" className="auth-forgot-link">Forgot your password?</Link>
            </div>
            <button type="submit" className="auth-validate-btn">Log in</button>
          </form>

          {/* Dev bypass */}
          <button type="button" className="auth-dev-btn" onClick={devLogin}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            Continue as DevWolf <span className="auth-dev-tag">DEV</span>
          </button>

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
