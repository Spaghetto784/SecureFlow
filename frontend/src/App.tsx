import {
  Activity,
  AlertTriangle,
  Box,
  CheckCircle2,
  Cloud,
  Code2,
  Container,
  Database,
  GitBranch,
  KeyRound,
  Lock,
  LogOut,
  Radar,
  ShieldCheck,
  Siren,
  UserPlus,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { AuthMode, User, authenticate, fetchCurrentUser, healthCheck } from "./api";

type ServiceHealth = {
  status: string;
  service: string;
  environment: string;
};

type ScanStatus = "passed" | "running" | "attention";

type Scan = {
  name: string;
  description: string;
  status: ScanStatus;
  findings: number;
  icon: typeof ShieldCheck;
};

const scans: Scan[] = [
  {
    name: "Semgrep SAST",
    description: "Static analysis for insecure code patterns",
    status: "passed",
    findings: 0,
    icon: Code2,
  },
  {
    name: "Gitleaks",
    description: "Repository secret detection",
    status: "passed",
    findings: 0,
    icon: KeyRound,
  },
  {
    name: "Dependency Scan",
    description: "Python and frontend dependency review",
    status: "running",
    findings: 1,
    icon: Radar,
  },
  {
    name: "Trivy Container",
    description: "Container image vulnerability scan",
    status: "passed",
    findings: 0,
    icon: Container,
  },
  {
    name: "OWASP ZAP",
    description: "Dynamic application security test",
    status: "attention",
    findings: 3,
    icon: Siren,
  },
  {
    name: "Terraform Checks",
    description: "Infrastructure-as-code validation",
    status: "running",
    findings: 0,
    icon: Cloud,
  },
];

const timeline = [
  "Code pushed to GitHub",
  "Backend tests passed",
  "Docker image built",
  "Security scans executed",
  "Deployment gate awaiting approval",
];

function App() {
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [healthError, setHealthError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("demo@secureflow.local");
  const [password, setPassword] = useState("correct-horse-battery");
  const [token, setToken] = useState(() => localStorage.getItem("secureflow_token") ?? "");
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    healthCheck()
      .then(setHealth)
      .catch((error: Error) => setHealthError(error.message));
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchCurrentUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("secureflow_token");
        setToken("");
        setUser(null);
      });
  }, [token]);

  const riskScore = useMemo(() => {
    const findings = scans.reduce((total, scan) => total + scan.findings, 0);
    return Math.max(0, 100 - findings * 9);
  }, []);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    try {
      const nextToken = await authenticate(authMode, email, password);
      localStorage.setItem("secureflow_token", nextToken);
      setToken(nextToken);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("secureflow_token");
    setToken("");
    setUser(null);
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={24} />
          </div>
          <div>
            <strong>SecureFlow</strong>
            <span>DevSecOps CI/CD</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Dashboard sections">
          <a className="active" href="#overview">
            <Activity size={18} />
            Overview
          </a>
          <a href="#security">
            <Lock size={18} />
            Security scans
          </a>
          <a href="#pipeline">
            <GitBranch size={18} />
            Pipeline
          </a>
          <a href="#runtime">
            <Database size={18} />
            Runtime
          </a>
        </nav>

        <div className="sidebar-status">
          <span className={health?.status === "ok" ? "pulse ok" : "pulse warn"} />
          <div>
            <strong>{health?.service ?? "API status"}</strong>
            <span>{health ? `${health.environment} environment` : healthError || "Checking API"}</span>
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Security delivery dashboard</p>
            <h1>Application security posture</h1>
          </div>

          {user ? (
            <div className="user-menu">
              <div>
                <strong>{user.email}</strong>
                <span>{user.role}</span>
              </div>
              <button className="icon-button" onClick={handleLogout} aria-label="Log out">
                <LogOut size={18} />
              </button>
            </div>
          ) : null}
        </header>

        {!user ? (
          <section className="auth-panel" aria-label="Authentication">
            <div className="auth-copy">
              <p className="eyebrow">Protected workspace</p>
              <h2>Sign in to inspect the SecureFlow pipeline</h2>
              <p>
                The dashboard uses the FastAPI auth flow, PostgreSQL user storage, Argon2 password
                hashing, and JWT Bearer tokens.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleAuth}>
              <div className="segmented" aria-label="Authentication mode">
                <button
                  type="button"
                  className={authMode === "login" ? "selected" : ""}
                  onClick={() => setAuthMode("login")}
                >
                  <Lock size={16} />
                  Login
                </button>
                <button
                  type="button"
                  className={authMode === "register" ? "selected" : ""}
                  onClick={() => setAuthMode("register")}
                >
                  <UserPlus size={16} />
                  Register
                </button>
              </div>

              <label>
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {authError ? <p className="form-error">{authError}</p> : null}

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {authMode === "register" ? <UserPlus size={18} /> : <Lock size={18} />}
                {isSubmitting ? "Processing..." : authMode === "register" ? "Create account" : "Login"}
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="metrics-grid" id="overview">
              <Metric title="Risk score" value={`${riskScore}%`} detail="Current secure delivery score" />
              <Metric title="Critical findings" value="0" detail="Blocking production release" />
              <Metric title="Checks passed" value="4/6" detail="Automated controls completed" />
              <Metric title="Runtime" value={health?.status ?? "unknown"} detail="FastAPI container health" />
            </section>

            <section className="section-band" id="security">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Automated security controls</p>
                  <h2>Scan coverage</h2>
                </div>
                <span className="badge">CI/CD gated</span>
              </div>

              <div className="scan-grid">
                {scans.map((scan) => (
                  <ScanCard key={scan.name} scan={scan} />
                ))}
              </div>
            </section>

            <section className="two-column">
              <div className="section-band" id="pipeline">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">GitHub Actions</p>
                    <h2>Pipeline activity</h2>
                  </div>
                </div>
                <ol className="timeline">
                  {timeline.map((item, index) => (
                    <li key={item}>
                      <span>{index + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="section-band" id="runtime">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Runtime inventory</p>
                    <h2>Platform</h2>
                  </div>
                </div>
                <div className="runtime-list">
                  <RuntimeItem icon={Box} label="API" value="FastAPI" />
                  <RuntimeItem icon={Database} label="Database" value="PostgreSQL" />
                  <RuntimeItem icon={Container} label="Packaging" value="Docker Compose" />
                  <RuntimeItem icon={Cloud} label="Deployment target" value="AWS ready" />
                </div>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="metric">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function ScanCard({ scan }: { scan: Scan }) {
  const Icon = scan.icon;
  const StatusIcon = scan.status === "attention" ? AlertTriangle : CheckCircle2;

  return (
    <article className={`scan-card ${scan.status}`}>
      <div className="scan-top">
        <Icon size={22} />
        <StatusIcon size={18} />
      </div>
      <h3>{scan.name}</h3>
      <p>{scan.description}</p>
      <div className="scan-footer">
        <span>{scan.status}</span>
        <strong>{scan.findings} findings</strong>
      </div>
    </article>
  );
}

function RuntimeItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="runtime-item">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
