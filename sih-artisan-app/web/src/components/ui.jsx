import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { X, WifiOff, Loader2, ImageOff, BadgeCheck } from "lucide-react";
import { onConnectivity, isOffline } from "../api";
import { initials } from "../constants";

export function Logo({ size = "md", to = "/", light = false }) {
  return (
    <Link to={to} className={`logo logo-${size} ${light ? "logo-light" : ""}`}>
      <img src="/logo.svg" alt="" />
      <span>
        <b>ShilpSaathi</b>
        <small>शिल्प साथी · Crafting a Brighter Tomorrow</small>
      </span>
    </Link>
  );
}

export function Button({ variant = "primary", size, icon: Icon, loading, children, className = "", as, ...rest }) {
  const cls = `btn btn-${variant} ${size ? `btn-${size}` : ""} ${className}`;
  const inner = (
    <>
      {loading ? <Loader2 size={16} className="spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </>
  );
  if (as === "link") return <Link className={cls} {...rest}>{inner}</Link>;
  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {inner}
    </button>
  );
}

export const Card = ({ className = "", children, ...rest }) => (
  <div className={`card ${className}`} {...rest}>{children}</div>
);

export const Badge = ({ tone = "gray", children, icon: Icon }) => (
  <span className={`badge badge-${tone}`}>
    {Icon && <Icon size={12} />}
    {children}
  </span>
);

export const Verified = () => <Badge tone="green" icon={BadgeCheck}>Verified</Badge>;

export function Stat({ value, label, tone = "green", icon: Icon }) {
  return (
    <div className={`stat stat-${tone}`}>
      {Icon && <span className="stat-icon"><Icon size={18} /></span>}
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export function ProductImage({ src, alt = "", className = "" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  if (!src || failed)
    return (
      <div className={`img-fallback ${className}`}>
        <ImageOff size={22} />
      </div>
    );
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export const Avatar = ({ name, size = 40, tone = "orange" }) => (
  <span className={`avatar avatar-${tone}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
    {initials(name)}
  </span>
);

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`field ${className}`}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" style={{ maxWidth: width }} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.value} role="tab" aria-selected={value === t.value} className={value === t.value ? "active" : ""} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export const Empty = ({ icon: Icon, title, children }) => (
  <div className="empty">
    {Icon && <Icon size={34} />}
    <b>{title}</b>
    {children && <p>{children}</p>}
  </div>
);

export const Spinner = ({ label = "Loading…" }) => (
  <div className="spinner-wrap"><Loader2 className="spin" size={22} /> {label}</div>
);

export function OfflinePill() {
  const [off, setOff] = useState(isOffline());
  useEffect(() => {
    const off = onConnectivity(setOff);
    return () => {
      off();
    };
  }, []);
  if (!off) return null;
  return (
    <span className="offline-pill" title="Backend unreachable — running on local demo data">
      <WifiOff size={13} /> Offline demo
    </span>
  );
}

// Tiny data-loading hook: const { data, loading, error, reload, setData } = useAsync(fn, deps)
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    return Promise.resolve(fnRef.current())
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);
  return { ...state, reload: run, setData: (data) => setState((s) => ({ ...s, data: typeof data === "function" ? data(s.data) : data })) };
}

// Toasts
let pushToast = () => {};
export const toast = (msg, tone = "green") => pushToast({ msg, tone, id: Date.now() + Math.random() });

export function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    pushToast = (t) => {
      setItems((xs) => [...xs, t]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== t.id)), 3200);
    };
  }, []);
  return (
    <div className="toaster" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>{t.msg}</div>
      ))}
    </div>
  );
}
