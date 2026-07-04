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
  Play,
  Radar,
  ShieldCheck,
  Siren,
  UserPlus,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  AuthMode,
  SecurityFinding,
  SecurityReport,
  User,
  authenticate,
  fetchCurrentUser,
  fetchSecurityFindings,
  fetchSecurityReports,
  healthCheck,
  runSecurityScan,
} from "./api";

type ServiceHealth = {
  status: string;
  service: string;
  environment: string;
};

const timeline = [
  "Code pushed to GitHub",
  "Backend tests passed",
  "Docker image built",
  "Security scans executed",
  "Deployment gate awaiting approval",
];

const scanIcons: Record<string, typeof ShieldCheck> = {
  "Semgrep SAST": Code2,
  Gitleaks: KeyRound,
  "Dependency Scan": Radar,
  "Trivy Container": Container,
  "OWASP ZAP": Siren,
  "Terraform Checks": Cloud,
  "Manual Security Scan": ShieldCheck,
};

function App() {
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [healthError, setHealthError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("demo@secureflow.local");
  const [password, setPassword] = useState("correct-horse-battery");
  const [token, setToken] = useState(() => localStorage.getItem("secureflow_token") ?? "");
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [authError, setAuthError] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningScan, setIsRunningScan] = useState(false);

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

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    Promise.all([fetchSecurityReports(token), fetchSecurityFindings(token)])
      .then(([nextReports, nextFindings]) => {
        setReports(nextReports);
        setFindings(nextFindings);
        setDashboardError("");
      })
      .catch((error: Error) => setDashboardError(error.message));
  }, [token, user]);

  const riskScore = useMemo(() => {
    const penalty = findings.reduce((total, finding) => {
      const weights = { info: 1, low: 3, medium: 8, high: 18, critical: 30 };
      return total + weights[finding.severity];
    }, 0);
    return Math.max(0, 100 - penalty);
  }, [findings]);

  const criticalFindings = findings.filter((finding) => finding.severity === "critical").length;
  const passedReports = reports.filter((report) => report.status === "passed").length;

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
    setReports([]);
    setFindings([]);
  }

  async function handleRunScan() {
    if (!token) {
      return;
    }

    setDashboardError("");
    setIsRunningScan(true);
    try {
      await runSecurityScan(token);
      const [nextReports, nextFindings] = await Promise.all([
        fetchSecurityReports(token),
        fetchSecurityFindings(token),
      ]);
      setReports(nextReports);
      setFindings(nextFindings);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Unable to run scan");
    } finally {
      setIsRunningScan(false);
    }
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
              <Metric
                title="Critical findings"
                value={`${criticalFindings}`}
                detail="Blocking production release"
              />
              <Metric
                title="Checks passed"
                value={`${passedReports}/${reports.length || 0}`}
                detail="Automated controls completed"
              />
              <Metric title="Runtime" value={health?.status ?? "unknown"} detail="FastAPI container health" />
            </section>

            <section className="section-band" id="security">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Automated security controls</p>
                  <h2>Scan coverage</h2>
                </div>
                <button className="secondary-button" onClick={handleRunScan} disabled={isRunningScan}>
                  <Play size={16} />
                  {isRunningScan ? "Running..." : "Run scan"}
                </button>
              </div>

              {dashboardError ? <p className="form-error">{dashboardError}</p> : null}

              <div className="scan-grid">
                {reports.map((report) => (
                  <ScanCard key={report.id} report={report} />
                ))}
              </div>
            </section>

            <section className="section-band" id="findings">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Security reports</p>
                  <h2>Open findings</h2>
                </div>
                <span className="badge">{findings.length} tracked</span>
              </div>
              <div className="findings-list">
                {findings.map((finding) => (
                  <FindingRow key={finding.id} finding={finding} />
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

function ScanCard({ report }: { report: SecurityReport }) {
  const Icon = scanIcons[report.tool] ?? ShieldCheck;
  const StatusIcon = report.status === "attention" || report.status === "failed" ? AlertTriangle : CheckCircle2;

  return (
    <article className={`scan-card ${report.status}`}>
      <div className="scan-top">
        <Icon size={22} />
        <StatusIcon size={18} />
      </div>
      <h3>{report.tool}</h3>
      <p>{report.summary}</p>
      <div className="scan-footer">
        <span>{report.status}</span>
        <strong>{report.findings_count} findings</strong>
      </div>
    </article>
  );
}

function FindingRow({ finding }: { finding: SecurityFinding }) {
  return (
    <article className="finding-row">
      <div>
        <span className={`severity ${finding.severity}`}>{finding.severity}</span>
      </div>
      <div>
        <h3>{finding.title}</h3>
        <p>{finding.description}</p>
        <small>{finding.recommendation}</small>
      </div>
      <div className="finding-meta">
        <strong>{finding.status}</strong>
        <span>{finding.target}</span>
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
