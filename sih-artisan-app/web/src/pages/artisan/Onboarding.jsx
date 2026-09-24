import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, BadgeCheck } from "lucide-react";
import { Logo, Button, Field, Card, toast } from "../../components/ui";
import { useSession } from "../../session";
import { CRAFTS, STATES, VOICE_LANGUAGES } from "../../constants";
import * as api from "../../api";

/** Minimal-field onboarding (SPEC Feature 2): name → craft → location & Pehchan ID. */
export default function Onboarding() {
  const { user, update } = useSession("artisan");
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    craft: user?.craft || "",
    district: (user?.location || "").split(",")[0] || "",
    state: user?.state || "",
    pehchanId: user?.pehchanId || "",
    language: user?.language || "hi",
    bio: user?.bio || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target ? e.target.value : e });
  const ready = form.name && form.craft && form.district && form.state;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        craft: form.craft,
        location: `${form.district}, ${form.state}`,
        state: form.state,
        pehchanId: form.pehchanId,
        language: form.language,
        bio: form.bio,
      };
      const saved = await api.updateArtisan(user.id, payload);
      update(saved);
      toast(saved.kycVerified ? "Profile saved · Verified badge unlocked" : "Profile saved");
      navigate("/artisan");
    } catch (err) {
      toast(err.message, "red");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="onboard-page">
      <Logo />
      <Card className="onboard-card">
        <h1>Tell us about your craft</h1>
        <p className="muted">अपनी कला के बारे में बताइए — only 3 quick things.</p>
        <form onSubmit={save} className="stack">
          <Field label="1 · Your name / आपका नाम">
            <input value={form.name} onChange={set("name")} placeholder="Sita Devi" required />
          </Field>

          <div className="field">
            <span className="field-label">2 · Your craft / आपकी कला</span>
            <div className="craft-grid">
              {CRAFTS.map((c) => (
                <button type="button" key={c.key} className={`craft-tile ${form.craft === c.key ? "active" : ""}`} onClick={() => set("craft")(c.key)}>
                  <span className="craft-emoji">{c.emoji}</span>
                  <b>{c.en}</b>
                  <small>{c.hi}</small>
                  {form.craft === c.key && <Check size={14} className="craft-check" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <Field label="3 · Village / District">
              <input value={form.district} onChange={set("district")} placeholder="Madhubani" required />
            </Field>
            <Field label="State / राज्य">
              <select value={form.state} onChange={set("state")} required>
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Pehchan ID (optional)" hint="Ministry of Textiles artisan card">
              <input value={form.pehchanId} onChange={set("pehchanId")} placeholder="PEHCHAN-BR-XXXXX" />
            </Field>
            <Field label="Preferred language">
              <select value={form.language} onChange={set("language")}>
                {VOICE_LANGUAGES.map((l) => <option key={l.code} value={l.code.slice(0, 2)}>{l.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Your story (optional)">
            <textarea rows={2} value={form.bio} onChange={set("bio")} placeholder="Traditional artisan since 20 years…" />
          </Field>
          <div className="note-green"><BadgeCheck size={16} /> Name, craft and location together unlock the <b>Verified</b> badge buyers trust.</div>
          <Button type="submit" size="lg" loading={busy} disabled={!ready} className="btn-block">Save & Continue</Button>
        </form>
      </Card>
    </div>
  );
}
