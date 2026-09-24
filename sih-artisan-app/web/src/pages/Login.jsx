import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, KeyRound, Phone, Mail, Lock, Zap } from "lucide-react";
import { Logo, Button, Field, Tabs, toast, ProductImage } from "../components/ui";
import { useSession } from "../session";
import { BUYER_TYPES } from "../constants";
import * as api from "../api";

const DEMO = {
  artisan: [
    { name: "Radha Devi", phone: "9876543210", note: "Pottery · Khurja" },
    { name: "Sita Devi", phone: "9801122334", note: "Madhubani · Bihar" },
  ],
  buyer: [
    { name: "Rajiv Sharma", phone: "9123456780", note: "Rathi Exports" },
    { name: "Ananya Gupta", phone: "9876500112", note: "Craft Bazaar" },
  ],
};

const SIDE_IMG = "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&auto=format&fit=crop&q=80";

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(params.get("role") || "artisan");
  const [mode, setMode] = useState(params.get("mode") || "login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState({ name: "", companyName: "", buyerType: "Retailer", city: "" });
  const [email, setEmail] = useState("admin@shilpsaathi.gov.in");
  const [password, setPassword] = useState("");
  const { signIn } = useSession(role);
  const next = params.get("next");

  const switchRole = (r) => {
    setRole(r);
    setOtpSent(false);
    setOtp("");
    setError("");
  };

  const finish = (r, user, token) => {
    signIn(r, user, token);
    toast(`Welcome, ${user.name || "Admin"}!`);
    if (r === "artisan") navigate(!user.craft || !user.location ? "/artisan/onboarding" : next || "/artisan");
    else if (r === "buyer") navigate(next || "/market");
    else navigate(next || "/admin");
  };

  const sendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(phone)) return setError("Enter a valid 10-digit mobile number");
    setBusy(true);
    try {
      await api.sendOtp(phone);
      setOtpSent(true);
      toast("OTP sent · Demo OTP is 1234", "blue");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e, ph = phone, code = otp) => {
    e?.preventDefault();
    setError("");
    setBusy(true);
    try {
      const extra = mode === "register" ? Object.fromEntries(Object.entries(details).filter(([, v]) => v)) : {};
      const res = await api.verifyOtp(ph, code, role, extra);
      finish(role, role === "buyer" ? res.buyer : res.artisan, res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const adminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.adminLogin(email, password);
      finish("admin", res.admin, res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const quick = async (d) => {
    setPhone(d.phone);
    await api.sendOtp(d.phone);
    verify(null, d.phone, "1234");
  };

  const tone = role === "buyer" ? "blue" : "primary";

  return (
    <div className="auth-page">
      <div className="auth-side">
        <ProductImage src={SIDE_IMG} className="auth-side-img" alt="" />
        <div className="auth-side-text">
          <h2>{role === "buyer" ? "Discover authentic crafts." : role === "admin" ? "Monitor growth. Enable impact." : "I create, AI helps me share with the world."}</h2>
          <p>{role === "buyer" ? "Buy directly from verified artisans — no middlemen." : "मैं बनाती हूँ, AI दुनिया तक पहुँचाता है।"}</p>
        </div>
      </div>

      <div className="auth-panel">
        <Link to="/" className="back-link"><ArrowLeft size={15} /> Home</Link>
        <Logo />
        <div className="auth-card">
          <h1>{role === "admin" ? "Admin Login" : mode === "register" ? "Create Your Account" : "Welcome back"}</h1>
          <p className="muted">{role === "admin" ? "Platform administration" : mode === "register" ? "अपना खाता बनाएं" : "अपने खाते में लॉगिन करें"}</p>

          <Tabs
            value={role}
            onChange={switchRole}
            tabs={[
              { value: "artisan", label: "Artisan" },
              { value: "buyer", label: "Buyer" },
              { value: "admin", label: "Admin" },
            ]}
          />

          {role === "admin" ? (
            <form onSubmit={adminLogin} className="stack">
              <Field label="Email">
                <div className="input-icon"><Mail size={16} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              </Field>
              <Field label="Password" hint="Demo: admin123">
                <div className="input-icon"><Lock size={16} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" /></div>
              </Field>
              {error && <div className="form-error">{error}</div>}
              <Button type="submit" loading={busy} className="btn-block">Login</Button>
            </form>
          ) : (
            <form onSubmit={otpSent ? verify : sendOtp} className="stack">
              {mode === "register" && !otpSent && (
                <>
                  <Field label="Full name / पूरा नाम">
                    <input value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} placeholder={role === "buyer" ? "Rahul Verma" : "Sita Devi"} />
                  </Field>
                  {role === "buyer" && (
                    <div className="grid-2">
                      <Field label="Company">
                        <input value={details.companyName} onChange={(e) => setDetails({ ...details, companyName: e.target.value })} placeholder="ABC Hotels Pvt. Ltd." />
                      </Field>
                      <Field label="Buyer type">
                        <select value={details.buyerType} onChange={(e) => setDetails({ ...details, buyerType: e.target.value })}>
                          {BUYER_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </Field>
                      <Field label="City" className="span-2">
                        <input value={details.city} onChange={(e) => setDetails({ ...details, city: e.target.value })} placeholder="Mumbai" />
                      </Field>
                    </div>
                  )}
                </>
              )}
              <Field label="Mobile number / मोबाइल नंबर">
                <div className="input-prefix">
                  <span>+91</span>
                  <input inputMode="numeric" maxLength={10} value={phone} disabled={otpSent}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="Enter Mobile Number" autoFocus />
                </div>
              </Field>
              {otpSent && (
                <Field label="Enter OTP" hint={<>Demo OTP: <b>1234</b> · <button type="button" className="link" onClick={() => { setOtpSent(false); setOtp(""); }}>Change number</button></>}>
                  <div className="input-icon"><KeyRound size={16} /><input inputMode="numeric" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="• • • •" autoFocus className="otp-input" /></div>
                </Field>
              )}
              {error && <div className="form-error">{error}</div>}
              <Button type="submit" variant={tone} loading={busy} className="btn-block" icon={otpSent ? null : Phone}>
                {otpSent ? "Verify & Continue" : "Send OTP"}
              </Button>
              <p className="tiny muted center">
                By continuing, you agree to our <a className="link">Terms &amp; Conditions</a>
              </p>
              <p className="center small">
                {mode === "register" ? "Already registered? " : "New here? "}
                <button type="button" className="link" onClick={() => setMode(mode === "register" ? "login" : "register")}>
                  {mode === "register" ? "Login" : "Create an account"}
                </button>
              </p>
            </form>
          )}

          {role !== "admin" && (
            <div className="demo-box">
              <span><Zap size={14} /> 1-click demo login</span>
              <div className="demo-list">
                {DEMO[role].map((d) => (
                  <button key={d.phone} type="button" onClick={() => quick(d)} disabled={busy}>
                    <b>{d.name}</b>
                    <small>{d.note}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
