import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { C, TONES, shadow } from "../theme";
import { Screen, H1, H2, H3, Muted, Body, Button, Field, Card, Row, Tabs, Note, Chip, useToast, OfflinePill } from "../ui";
import { useSession } from "../session";
import { CRAFTS, STATES, BUYER_TYPES } from "../constants";
import * as api from "../api";

const HERO = "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=900&auto=format&fit=crop&q=75";

const STEPS = [
  ["camera", "Capture"], ["zap", "Enhance"], ["mic", "Speak"], ["file-text", "Catalogue"],
  ["tag", "Price"], ["shopping-bag", "Publish"], ["users", "Connect"],
];

export function WelcomeScreen({ navigation }) {
  return (
    <Screen bg={C.bgWarm}>
      <Row style={{ justifyContent: "space-between" }}>
        <Logo />
        <OfflinePill />
      </Row>
      <View style={st.heroWrap}>
        <Image source={{ uri: HERO }} style={st.hero} />
        <View style={[st.float, { top: 14, left: 14 }]}><Feather name="zap" size={14} color={C.green} /><Text style={st.floatText}>AI Enhanced photo</Text></View>
        <View style={[st.float, { bottom: 14, right: 14 }]}><Feather name="tag" size={14} color={C.green} /><Text style={st.floatText}>Suggested ₹700 – ₹950</Text></View>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={st.badge}>Smart India Hackathon 2026 · SIH26090</Text>
        <H1 style={{ fontSize: 30 }}>Traditional Crafts,</H1>
        <H1 style={{ fontSize: 30, color: C.orange }}>Global Opportunities</H1>
        <Text style={{ color: C.brown, fontWeight: "700", fontSize: 16 }}>परंपरा से दुनिया तक — आसानी से</Text>
        <Muted style={{ fontSize: 14.5, marginTop: 4 }}>
          Click a photo and speak in your language — ShilpSaathi writes the catalogue, suggests a fair price and connects you with verified buyers.
        </Muted>
      </View>

      <Persona icon="heart" tone="orange" title="I am an Artisan" hi="मैं कारीगर हूँ" quote="I create, AI helps me share with the world." onPress={() => navigation.navigate("Login", { role: "artisan" })} />
      <Persona icon="globe" tone="blue" title="I am a Buyer" hi="मैं खरीदार हूँ" quote="Discover authentic crafts. Support real artisans." onPress={() => navigation.navigate("Login", { role: "buyer" })} />

      <Card>
        <H3>From workshop to world in 7 steps</H3>
        <View style={st.steps}>
          {STEPS.map(([icon, label], i) => (
            <View key={label} style={st.step}>
              <View style={st.stepIcon}><Feather name={icon} size={16} color={C.green} /></View>
              <Text style={st.stepText}>{i + 1}. {label}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Muted style={{ textAlign: "center", fontStyle: "italic", color: C.navy }}>“Small Hands. Big Heritage. A Larger Tomorrow.”</Muted>
    </Screen>
  );
}

export function Logo({ small }) {
  return (
    <Row gap={8}>
      <View style={st.logoMark}><Text style={{ fontSize: small ? 16 : 20 }}>🪔</Text></View>
      <View>
        <Text style={[st.logo, small && { fontSize: 18 }]}>ShilpSaathi</Text>
        {!small && <Text style={st.logoSub}>शिल्प साथी · Crafting a Brighter Tomorrow</Text>}
      </View>
    </Row>
  );
}

function Persona({ icon, tone, title, hi, quote, onPress }) {
  const t = TONES[tone];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.persona, pressed && { opacity: 0.85 }]}>
      <View style={[st.personaIcon, { backgroundColor: t.bg }]}><Feather name={icon} size={22} color={t.fg} /></View>
      <View style={{ flex: 1 }}>
        <Text style={[st.personaTitle, { color: t.fg }]}>{title} <Text style={{ fontSize: 12, color: C.muted }}>{hi}</Text></Text>
        <Muted style={{ fontStyle: "italic" }}>“{quote}”</Muted>
      </View>
      <Feather name="chevron-right" size={20} color={t.fg} />
    </Pressable>
  );
}

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

export function LoginScreen({ navigation, route }) {
  const [role, setRole] = useState(route.params?.role || "artisan");
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState({ name: "", companyName: "", buyerType: "Retailer", city: "" });
  const { signIn } = useSession(role);
  const toast = useToast();
  const tone = role === "buyer" ? "blue" : "primary";

  const reset = (r) => { setRole(r); setSent(false); setOtp(""); setError(""); };

  const sendOtp = async () => {
    setError("");
    if (!/^\d{10}$/.test(phone)) return setError("Enter a valid 10-digit mobile number");
    setBusy(true);
    try {
      await api.sendOtp(phone);
      setSent(true);
      toast("OTP sent · Demo OTP is 1234", "blue");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (ph = phone, code = otp) => {
    setError("");
    setBusy(true);
    try {
      const extra = mode === "register" ? Object.fromEntries(Object.entries(details).filter(([, v]) => v)) : {};
      const res = await api.verifyOtp(ph, code, role, extra);
      const user = role === "buyer" ? res.buyer : res.artisan;
      signIn(role, user, res.token);
      toast(`Welcome, ${user.name || "friend"}!`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const quick = async (d) => {
    setPhone(d.phone);
    await api.sendOtp(d.phone);
    verify(d.phone, "1234");
  };

  return (
    <Screen bg={C.bgWarm}>
      <Row>
        {navigation.canGoBack() && <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Feather name="arrow-left" size={22} color={C.ink} /></Pressable>}
        <Logo small />
      </Row>
      <Card style={{ gap: 14 }}>
        <View style={{ alignItems: "center" }}>
          <H2>{mode === "register" ? "Create Your Account" : "Welcome back"}</H2>
          <Muted>{mode === "register" ? "अपना खाता बनाएं" : "अपने खाते में लॉगिन करें"}</Muted>
        </View>
        <Tabs tone={role === "buyer" ? "blue" : "green"} value={role} onChange={reset} tabs={[{ value: "artisan", label: "Artisan" }, { value: "buyer", label: "Buyer" }]} />

        {mode === "register" && !sent && (
          <>
            <Field label="Full name / पूरा नाम" value={details.name} onChangeText={(v) => setDetails({ ...details, name: v })} placeholder={role === "buyer" ? "Rahul Verma" : "Sita Devi"} />
            {role === "buyer" && (
              <>
                <Field label="Company" value={details.companyName} onChangeText={(v) => setDetails({ ...details, companyName: v })} placeholder="ABC Hotels Pvt. Ltd." />
                <Text style={st.label}>Buyer type</Text>
                <View style={st.wrap}>
                  {BUYER_TYPES.map((b) => <Chip key={b} tone="blue" label={b} active={details.buyerType === b} onPress={() => setDetails({ ...details, buyerType: b })} />)}
                </View>
                <Field label="City" value={details.city} onChangeText={(v) => setDetails({ ...details, city: v })} placeholder="Mumbai" />
              </>
            )}
          </>
        )}

        <View style={{ gap: 6 }}>
          <Text style={st.label}>Mobile number / मोबाइल नंबर</Text>
          <Row gap={0}>
            <View style={st.prefix}><Text style={{ fontWeight: "700", color: C.muted }}>+91</Text></View>
            <Field style={{ flex: 1 }} value={phone} editable={!sent} onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
              keyboardType="number-pad" placeholder="Enter Mobile Number" />
          </Row>
        </View>
        {sent && (
          <Field label="Enter OTP" hint="Demo OTP: 1234" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad" placeholder="• • • •" autoFocus />
        )}
        {error ? <Note tone="red" icon="alert-circle">{error}</Note> : null}
        <Button variant={tone} size="lg" loading={busy} icon={sent ? "check" : "phone"} title={sent ? "Verify & Continue" : "Send OTP"} onPress={sent ? () => verify() : sendOtp} />
        {sent && <Button variant="ghost" size="sm" title="Change number" onPress={() => { setSent(false); setOtp(""); }} />}
        <Pressable onPress={() => setMode(mode === "register" ? "login" : "register")}>
          <Muted style={{ textAlign: "center" }}>
            {mode === "register" ? "Already registered? " : "New here? "}
            <Text style={{ color: C.blue, fontWeight: "700" }}>{mode === "register" ? "Login" : "Create an account"}</Text>
          </Muted>
        </Pressable>

        <View style={st.demo}>
          <Text style={{ color: C.orange, fontWeight: "800", fontSize: 12.5 }}>⚡ 1-click demo login</Text>
          <Row>
            {DEMO[role].map((d) => (
              <Pressable key={d.phone} onPress={() => quick(d)} disabled={busy} style={st.demoBtn}>
                <Text style={{ fontWeight: "700", color: C.ink }}>{d.name}</Text>
                <Muted style={{ fontSize: 12 }}>{d.note}</Muted>
              </Pressable>
            ))}
          </Row>
        </View>
      </Card>
      <Muted style={{ textAlign: "center", fontSize: 12 }}>Admin panel is available on the web app.</Muted>
    </Screen>
  );
}

/** Minimal-field onboarding: name → craft → location & Pehchan ID. */
export function OnboardingScreen({ navigation }) {
  const { user, update } = useSession("artisan");
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    craft: user?.craft || "",
    district: (user?.location || "").split(",")[0] || "",
    state: user?.state || "",
    pehchanId: user?.pehchanId || "",
    bio: user?.bio || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const ready = form.name && form.craft && form.district && form.state;

  const save = async () => {
    setBusy(true);
    try {
      const saved = await api.updateArtisan(user.id, {
        name: form.name, craft: form.craft, location: `${form.district}, ${form.state}`, state: form.state, pehchanId: form.pehchanId, bio: form.bio,
      });
      update(saved);
      toast(saved.kycVerified ? "Profile saved · Verified badge unlocked" : "Profile saved");
      if (navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      toast(e.message, "red");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen bg={C.bgWarm}>
      <Logo small />
      <H2>Tell us about your craft</H2>
      <Muted>अपनी कला के बारे में बताइए — only 3 quick things.</Muted>
      <Card style={{ gap: 14 }}>
        <Field label="1 · Your name / आपका नाम" value={form.name} onChangeText={set("name")} placeholder="Sita Devi" />
        <Text style={st.label}>2 · Your craft / आपकी कला</Text>
        <View style={st.craftGrid}>
          {CRAFTS.map((c) => (
            <Pressable key={c.key} onPress={() => set("craft")(c.key)} style={[st.craft, form.craft === c.key && st.craftOn]}>
              <Text style={{ fontSize: 26 }}>{c.emoji}</Text>
              <Text style={{ fontWeight: "700", color: C.ink }}>{c.en}</Text>
              <Muted style={{ fontSize: 11.5 }}>{c.hi}</Muted>
            </Pressable>
          ))}
        </View>
        <Field label="3 · Village / District" value={form.district} onChangeText={set("district")} placeholder="Madhubani" />
        <Text style={st.label}>State / राज्य</Text>
        <View style={st.wrap}>
          {STATES.map((x) => <Chip key={x} label={x} active={form.state === x} onPress={() => set("state")(x)} />)}
        </View>
        <Field label="Pehchan ID (optional)" hint="Ministry of Textiles artisan card" value={form.pehchanId} onChangeText={set("pehchanId")} placeholder="PEHCHAN-BR-XXXXX" autoCapitalize="characters" />
        <Field label="Your story (optional)" value={form.bio} onChangeText={set("bio")} multiline placeholder="Traditional artisan for 20 years…" />
        <Note icon="award">Name, craft and location together unlock the Verified badge buyers trust.</Note>
        <Button size="lg" title="Save & Continue" loading={busy} disabled={!ready} onPress={save} />
      </Card>
    </Screen>
  );
}

const st = StyleSheet.create({
  heroWrap: { borderRadius: 20, overflow: "hidden", ...shadow },
  hero: { width: "100%", height: 220 },
  float: { position: "absolute", flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, ...shadow },
  floatText: { fontWeight: "700", fontSize: 12.5, color: C.ink },
  badge: { alignSelf: "flex-start", backgroundColor: C.white, color: C.brown, fontWeight: "700", fontSize: 11.5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "#F1D7B8", marginBottom: 6 },
  persona: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, ...shadow },
  personaIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  personaTitle: { fontSize: 16.5, fontWeight: "800" },
  steps: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  step: { width: "31%", alignItems: "center", gap: 4, backgroundColor: C.bg, paddingVertical: 10, borderRadius: 12 },
  stepIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.greenSoft, alignItems: "center", justifyContent: "center" },
  stepText: { fontSize: 12, fontWeight: "700", color: C.ink },
  logoMark: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.orangeSoft, alignItems: "center", justifyContent: "center" },
  logo: { fontSize: 22, fontWeight: "800", color: C.navy, fontFamily: "serif" },
  logoSub: { fontSize: 11, color: C.muted },
  label: { fontSize: 13, fontWeight: "700", color: "#3F4A55" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  prefix: { paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderRightWidth: 0, borderColor: C.borderStrong, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, backgroundColor: "#F7F4EF" },
  demo: { borderTopWidth: 1, borderStyle: "dashed", borderTopColor: C.borderStrong, paddingTop: 12, gap: 8 },
  demoBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  craftGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  craft: { width: "31%", alignItems: "center", gap: 2, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  craftOn: { borderColor: C.green, backgroundColor: C.greenSoft },
});
