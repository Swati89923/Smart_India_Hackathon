import { NavLink, Navigate, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { LogOut, Repeat, Search, MessageSquare, LayoutDashboard, Store } from "lucide-react";
import { useState } from "react";
import { Logo, OfflinePill, Avatar } from "./ui";
import { useSession } from "../session";

export function RequireRole({ role, children }) {
  const { user } = useSession(role);
  const loc = useLocation();
  if (!user) return <Navigate to={`/login?role=${role}&next=${encodeURIComponent(loc.pathname)}`} replace />;
  return children;
}

function RoleSwitch({ current }) {
  const nav = useNavigate();
  const targets = { artisan: "/artisan", buyer: "/market", admin: "/admin" };
  return (
    <label className="role-switch" title="Switch viewpoint">
      <Repeat size={14} />
      <select value={current} onChange={(e) => nav(targets[e.target.value])} aria-label="Switch role">
        <option value="artisan">Artisan view</option>
        <option value="buyer">Buyer view</option>
        <option value="admin">Admin view</option>
      </select>
    </label>
  );
}

/** Sidebar dashboard used by the Artisan and Admin areas. */
export function DashboardShell({ role, nav, tone = "green" }) {
  const { user, signOut } = useSession(role);
  const navigate = useNavigate();
  const logout = () => {
    signOut();
    navigate("/");
  };
  return (
    <div className={`shell shell-${tone}`}>
      <aside className="sidebar">
        <div className="sidebar-logo"><Logo size="sm" /></div>
        <nav>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `side-link ${isActive ? "active" : ""} ${n.primary ? "side-primary" : ""}`}>
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.hi && <small>{n.hi}</small>}
            </NavLink>
          ))}
        </nav>
        <button className="side-link side-logout" onClick={logout}>
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>
      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-brand"><Logo size="sm" /></div>
          <div className="topbar-right">
            <OfflinePill />
            <RoleSwitch current={role} />
            <div className="topbar-user">
              <Avatar name={user?.name || user?.email} size={34} tone={role === "admin" ? "blue" : "orange"} />
              <span className="hide-sm">
                <b>{user?.name || "Admin"}</b>
                <small>{role === "admin" ? user?.email : user?.location || "Artisan"}</small>
              </span>
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Top-nav marketplace layout for buyers (browsable without login). */
export function BuyerShell() {
  const { user, signOut } = useSession("buyer");
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e) => {
    e.preventDefault();
    navigate(`/market/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };
  return (
    <div className="buyer-shell">
      <header className="buyer-nav">
        <Logo size="sm" to="/market" />
        <nav className="buyer-links">
          <NavLink to="/market" end>Home</NavLink>
          <NavLink to="/market/products">Products</NavLink>
          <NavLink to="/market/artisans">Artisans</NavLink>
          <Link to="/#about">About</Link>
        </nav>
        <form className="nav-search hide-sm" onSubmit={submit}>
          <Search size={15} />
          <input placeholder="Search crafts, artisans…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <div className="topbar-right">
          <OfflinePill />
          <RoleSwitch current="buyer" />
          {user ? (
            <>
              <NavLink to="/buyer/chats" className="icon-btn" title="Chats"><MessageSquare size={18} /></NavLink>
              <NavLink to="/buyer" end className="icon-btn" title="My dashboard"><LayoutDashboard size={18} /></NavLink>
              <button className="icon-btn" title="Logout" onClick={() => { signOut(); navigate("/market"); }}><LogOut size={18} /></button>
            </>
          ) : (
            <Link className="btn btn-blue btn-sm" to="/login?role=buyer">Login</Link>
          )}
        </div>
      </header>
      <main className="buyer-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span><Store size={14} /> Direct from artisans · Zero middlemen · Verified via Pehchan ID</span>
        <span>“Small Hands. Big Heritage. A Larger Tomorrow.”</span>
      </footer>
    </div>
  );
}
