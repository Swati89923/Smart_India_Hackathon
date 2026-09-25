import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAudioRecorder, useAudioRecorderState, requestRecordingPermissionsAsync, setAudioModeAsync } from "expo-audio";
import { C, shadow } from "../../theme";
import { Screen, H2, H3, Muted, Body, Card, Row, Button, Badge, Chip, Field, Note, ProductImage, useToast } from "../../ui";
import { useSession } from "../../session";
import { CRAFTS, VOICE_LANGUAGES, DEFAULT_DAILY_WAGE, inr, craftLabel } from "../../constants";
import { pickPhoto, prepareImage, RECORDING_OPTIONS, recordingMime, readAudioBase64 } from "../../media";
import * as api from "../../api";

const STEPS = [["Photo", "फ़ोटो"], ["Enhance", "सुधार"], ["Voice", "आवाज़"], ["Details", "विवरण"], ["Price", "मूल्य"], ["Publish", "प्रकाशित"]];
const SAMPLE_PHOTOS = {
  pottery: "photo-1578749556568-bc2c40e68b61", weaving: "photo-1594040226829-7f251ab46d80",
  painting: "photo-1565193566173-7a0ee3dbe261", jewelry: "photo-1601121141461-9d6647bca1ed",
  woodwork: "photo-1611486212557-88be5ff6f941", embroidery: "photo-1616627561950-9f746e330187",
};
const TAG_LABEL = {
  background_removed: "Background removed", cropped_to_product: "Cropped to product",
  lighting_fixed: "Lighting corrected", square_marketplace_format: "1:1 marketplace format",
  cropped_to_market_format: "Marketplace format",
};
const MAX_SECONDS = 180;
const VOICE_OPTIONS = [{ code: "hi-en", label: "Hindi + English" }, ...VOICE_LANGUAGES.slice(0, 6)];

function Stepper({ step }) {
  return (
    <View style={st.stepper}>
      {STEPS.map(([en, hi], i) => (
        <View key={en} style={st.stepItem}>
          <View style={[st.dot, i < step && st.dotDone, i === step && st.dotNow]}>
            {i < step ? <Feather name="check" size={13} color={C.green} /> : <Text style={[st.dotText, i === step && { color: C.white }]}>{i + 1}</Text>}
          </View>
          <Text style={[st.stepLabel, i === step && { color: C.greenDark }]}>{en}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------- Step 1: photo ---------- */
function PhotoStep({ craft, setCraft, onPhoto }) {
  const toast = useToast();
  const take = async (source) => {
    try {
      const p = await pickPhoto(source);
      if (p) onPhoto(p);
    } catch (e) {
      toast(e.message, "red");
    }
  };
  const sample = async () => {
    try {
      onPhoto(await prepareImage(`https://images.unsplash.com/${SAMPLE_PHOTOS[craft]}?w=1200&auto=format&fit=crop&q=85`));
    } catch {
      toast("Could not load the sample photo", "red");
    }
  };
  return (
    <Card>
      <H2>Add New Product</H2>
      <Muted>नया उत्पाद जोड़ें · What did you make?</Muted>
      <View style={st.wrap}>
        {CRAFTS.map((c) => <Chip key={c.key} label={`${c.emoji} ${c.en}`} active={craft === c.key} onPress={() => setCraft(c.key)} />)}
      </View>
      <View style={st.drop}>
        <View style={st.dropIcon}><Feather name="camera" size={30} color={C.ink} /></View>
        <H3>Take a Photo or Upload</H3>
        <Muted style={{ textAlign: "center" }}>We will automatically enhance it · हम फ़ोटो को अपने-आप सुधार देंगे</Muted>
        <Row style={{ marginTop: 6 }}>
          <Button icon="camera" title="Take Photo" onPress={() => take("camera")} />
          <Button variant="outline" icon="image" title="Gallery" onPress={() => take("library")} />
        </Row>
        <Pressable onPress={sample} style={{ marginTop: 6 }}>
          <Text style={st.link}>No photo handy? Use a sample {craftLabel(craft).toLowerCase()} photo</Text>
        </Pressable>
      </View>
    </Card>
  );
}

/* ---------- Step 2: enhance ---------- */
function EnhanceStep({ photo, enhanced, analysis, busy, craft, onUseCraft, onRetake, onNext }) {
  const tags = [...new Set((analysis?.tags?.length ? analysis.tags : []).map((t) => TAG_LABEL[t] || t))];
  return (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <H2>Image Enhancement</H2>
        {analysis?.source ? <Badge tone={analysis.source === "local-filter" ? "gray" : "green"}>{analysis.source === "local-filter" ? "Basic" : "AI"}</Badge> : null}
      </Row>
      <Row style={{ alignItems: "flex-start" }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={st.caption}>Original</Text>
          <Image source={{ uri: photo.uri }} style={st.compareImg} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[st.caption, { color: C.green }]}>✨ AI Enhanced</Text>
          {busy || !enhanced ? (
            <View style={[st.compareImg, st.working]}><Feather name="loader" size={22} color={C.green} /><Muted style={{ textAlign: "center" }}>Removing background…</Muted></View>
          ) : (
            <Image source={{ uri: enhanced }} style={[st.compareImg, { backgroundColor: "#F7F4EF" }]} resizeMode="contain" />
          )}
        </View>
      </Row>
      {!busy && (
        <>
          <View style={st.wrap}>
            {tags.map((t) => <Badge key={t} tone="green">✓ {t}</Badge>)}
            {analysis?.lighting ? <Badge tone="blue">Light: {analysis.lighting}</Badge> : null}
          </View>
          {analysis?.identified ? (
            <Note tone="blue" icon="star">AI ne pehchana: {analysis.identified}{analysis.identifiedHi ? ` · ${analysis.identifiedHi}` : ""}</Note>
          ) : null}
          {analysis?.detectedCraft && analysis.detectedCraft !== craft ? (
            <Button size="sm" variant="outline-blue" title={`Set craft to ${craftLabel(analysis.detectedCraft)}?`} onPress={() => onUseCraft(analysis.detectedCraft)} />
          ) : null}
          {analysis?.isProductPhoto === false ? <Note tone="red" icon="alert-triangle">This doesn't look like a product photo — please retake.</Note> : null}
          {analysis?.artisanTip ? <Note icon="camera">{analysis.artisanTip}</Note> : null}
        </>
      )}
      <Row>
        <Button style={{ flex: 1 }} variant="outline" icon="rotate-ccw" title="Retake" onPress={onRetake} />
        <Button style={{ flex: 1.4 }} icon="check-circle" title="Use Enhanced" disabled={busy || !enhanced} onPress={onNext} />
      </Row>
    </Card>
  );
}

/* ---------- Step 3: voice ---------- */
function VoiceStep({ craft, voice, setVoice, onNext }) {
  const toast = useToast();
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const state = useAudioRecorderState(recorder, 150);
  const [lang, setLang] = useState("hi-en");
  const [processing, setProcessing] = useState(false);
  const [bars, setBars] = useState(() => Array(30).fill(0.1));
  const recording = state.isRecording;
  const seconds = Math.floor((state.durationMillis || 0) / 1000);

  useEffect(() => {
    if (!recording) return;
    // metering is in dBFS (≈ -60 silent … 0 loud)
    const level = state.metering != null ? Math.max(0.06, Math.min(1, (state.metering + 60) / 60)) : 0.3 + Math.random() * 0.4;
    setBars((b) => [...b.slice(1), level]);
    if (seconds >= MAX_SECONDS) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.durationMillis]);

  const start = async () => {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) return toast("Microphone permission denied — you can type instead", "red");
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      toast("Could not start recording: " + e.message, "red");
    }
  };

  const stop = async () => {
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch { /* already stopped */ }
    const uri = recorder.uri;
    if (!uri || seconds < 1) return toast("Recording too short — speak a little longer", "red");
    setProcessing(true);
    try {
      const audioBase64 = await readAudioBase64(uri);
      const hint = lang === "hi-en" ? "Hindi and English mixed (Hinglish)" : lang;
      const res = await api.transcribeVoice(craft, { audioBase64, mimeType: recordingMime(), languageHint: hint });
      if (res.empty || !(res.transcript || res.transcriptHi)) return toast("Kuch sunai nahi diya — dobara bolkar dekhiye", "red");
      setVoice({ transcript: res.transcript || res.transcriptHi, english: res.english || "", language: res.language, source: res.source });
      if (res.source === "demo-sample") toast("AI transcription unavailable — showing a demo sample", "gray");
    } catch (e) {
      toast("Transcription failed: " + e.message, "red");
    } finally {
      setProcessing(false);
    }
  };

  const mmss = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

  return (
    <Card>
      <H2>Describe Your Product</H2>
      <Muted>अपने उत्पाद के बारे में बताइए — speak freely in Hindi, English or both. AI will listen to all of it.</Muted>
      <View style={st.voiceBox}>
        <Pressable onPress={recording ? stop : start} disabled={processing} style={[st.mic, recording && { backgroundColor: C.red }]} accessibilityLabel={recording ? "Stop recording" : "Start recording"}>
          <Feather name={recording ? "square" : "mic"} size={34} color={C.white} />
        </Pressable>
        <Text style={st.timer}>{mmss(seconds)}{recording ? ` / ${mmss(MAX_SECONDS)}` : ""}</Text>
        <View style={st.wave}>
          {bars.map((b, i) => <View key={i} style={[st.bar, { height: 4 + b * 30, backgroundColor: recording ? C.red : "#B9CDEE" }]} />)}
        </View>
        {!recording && !processing && (
          <View style={st.wrap}>
            {VOICE_OPTIONS.map((l) => <Chip key={l.code} tone="blue" label={l.label} active={lang === l.code} onPress={() => setLang(l.code)} />)}
          </View>
        )}
        {recording ? <Muted style={{ textAlign: "center" }}>Listening… सुन रहे हैं… bolte rahiye, poori baat record ho rahi hai</Muted> : null}
        {processing ? <Muted style={{ textAlign: "center" }}>✨ AI aapki poori baat sun raha hai… (up to 30 seconds)</Muted> : null}
        <Button variant="blue" style={{ alignSelf: "stretch" }} loading={processing} icon={recording ? "square" : "mic"}
          title={processing ? "Transcribing…" : recording ? "Stop & Process" : voice ? "Record again" : "Start Speaking"} onPress={recording ? stop : start} />
      </View>
      <Field label={`What we heard (edit if needed)${voice?.language ? ` · ${voice.language}` : ""}`} multiline value={voice?.transcript || ""}
        onChangeText={(v) => setVoice({ ...(voice || {}), transcript: v })} placeholder="Or type your description here…" />
      <Field label="English translation" multiline value={voice?.english || ""} onChangeText={(v) => setVoice({ ...(voice || {}), english: v })} placeholder="Auto-translated after you speak" />
      <Button icon="arrow-right" title="Generate Details with AI" disabled={!voice?.transcript?.trim() || processing || recording} onPress={onNext} />
    </Card>
  );
}

/* ---------- Step 4: details ---------- */
function DetailsStep({ details, setDetails, busy, onRegenerate, onNext }) {
  const set = (k) => (v) => setDetails({ ...details, [k]: v });
  if (busy || !details)
    return (
      <Card style={{ alignItems: "center", paddingVertical: 36 }}>
        <Feather name="star" size={30} color={C.green} />
        <H2>Writing your catalogue…</H2>
        <Muted style={{ textAlign: "center" }}>AI is reading your photo and voice note to create a bilingual listing.</Muted>
      </Card>
    );
  return (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <H2>Product Details</H2>
        <Badge tone={details.source?.startsWith("gemini") ? "green" : "gray"}>{details.source?.startsWith("gemini") ? "Gemini AI" : "Template"}</Badge>
      </Row>
      <Field label="Title" value={details.title} onChangeText={set("title")} />
      <Field label="Title (Hindi)" value={details.titleHi} onChangeText={set("titleHi")} />
      <Field label="Category" value={details.category} onChangeText={set("category")} />
      <Field label="Material" value={details.materials} onChangeText={set("materials")} />
      <Field label="Description (Hindi)" multiline value={details.descriptionHi} onChangeText={set("descriptionHi")} />
      <Field label="Description (English)" multiline value={details.description} onChangeText={set("description")} />
      {details.tags?.length ? <View style={st.wrap}>{details.tags.map((t) => <Badge key={t} tone="orange">#{t}</Badge>)}</View> : null}
      <Row>
        <Button style={{ flex: 1 }} variant="outline" icon="refresh-cw" title="Regenerate" onPress={onRegenerate} />
        <Button style={{ flex: 1.2 }} icon="arrow-right" title="Next: Pricing" disabled={!details.title} onPress={onNext} />
      </Row>
    </Card>
  );
}

/* ---------- Step 5: price ---------- */
function PriceStep({ craft, pricing, setPricing, onNext }) {
  const [busy, setBusy] = useState(false);
  const { raw, days, wage, other } = pricing.inputs;
  const cost = Number(raw || 0) + Number(days || 0) * Number(wage || 0) + Number(other || 0);
  const setIn = (k) => (v) => setPricing((p) => ({ ...p, inputs: { ...p.inputs, [k]: v.replace(/\D/g, "") } }));

  useEffect(() => {
    if (!cost) return;
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const s = await api.recommendPrice(cost, craft);
        setPricing((p) => ({ ...p, suggestion: s, from: String(s.recommended), to: String(s.max) }));
      } finally {
        setBusy(false);
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost, craft]);

  const s = pricing.suggestion;
  return (
    <Card>
      <H2>Pricing Details</H2>
      <Muted>मूल्य निर्धारण</Muted>
      <Field label="Raw Material Cost (₹)" keyboardType="number-pad" value={String(raw)} onChangeText={setIn("raw")} />
      <Row>
        <Field style={{ flex: 1 }} label="Labour / Days" keyboardType="number-pad" value={String(days)} onChangeText={setIn("days")} />
        <Field style={{ flex: 1 }} label="Daily wage (₹)" keyboardType="number-pad" value={String(wage)} onChangeText={setIn("wage")} />
      </Row>
      <Field label="Other Expenses (₹)" hint="Packing, transport, tools" keyboardType="number-pad" value={String(other)} onChangeText={setIn("other")} />
      <View style={st.priceBox}>
        <Muted>Suggested Price Range</Muted>
        <Text style={st.priceBig}>{busy && !s ? "…" : s ? `${inr(s.min)} – ${inr(s.max)}` : "—"}</Text>
        <Row style={{ justifyContent: "space-between" }}><Body>Estimated Production Cost</Body><Body style={st.bold}>{inr(cost)}</Body></Row>
        <Row style={{ justifyContent: "space-between" }}><Body>AI recommended price</Body><Body style={st.bold}>{s ? inr(s.recommended) : "—"}</Body></Row>
        <Row style={{ justifyContent: "space-between" }}><Body>Suggested Margin</Body><Body style={st.bold}>{s ? `${inr(Math.max(0, s.min - cost))} – ${inr(Math.max(0, s.max - cost))}` : "—"}</Body></Row>
        {s?.basis ? <Muted style={{ fontSize: 12 }}>{s.basis}</Muted> : null}
      </View>
      <Row>
        <Field style={{ flex: 1 }} label="Your price from (₹)" keyboardType="number-pad" value={pricing.from ?? ""} onChangeText={(v) => setPricing({ ...pricing, from: v.replace(/\D/g, "") })} />
        <Field style={{ flex: 1 }} label="Up to (₹)" keyboardType="number-pad" value={pricing.to ?? ""} onChangeText={(v) => setPricing({ ...pricing, to: v.replace(/\D/g, "") })} />
      </Row>
      <Muted style={{ fontSize: 12 }}>You can edit the price as per your choice · आप कीमत बदल सकते हैं</Muted>
      {s && Number(pricing.from) < cost ? <Note tone="red" icon="alert-triangle">Your price is below your production cost — you would lose money on each piece.</Note> : null}
      <Button icon="arrow-right" title="Review & Publish" disabled={!Number(pricing.from)} onPress={onNext} />
    </Card>
  );
}

/* ---------- Step 6: review ---------- */
function ReviewStep({ image, details, pricing, craft, onEdit, onPublish, publishing }) {
  const from = Number(pricing.from);
  const to = Number(pricing.to) > from ? Number(pricing.to) : null;
  const checks = [
    ["Product details verified", !!(details?.title && details?.description)],
    ["Images look good", !!image],
    ["Price is set", from > 0],
  ];
  const ready = checks.every(([, ok]) => ok);
  return (
    <Card>
      <H2>Review & Confirm</H2>
      <Muted>जाँचें और पुष्टि करें</Muted>
      <ProductImage uri={image} style={st.reviewImg} />
      <H3>{details?.title}</H3>
      <Muted>{details?.titleHi}</Muted>
      <Text style={st.priceBig}>{inr(from)}{to ? ` – ${inr(to)}` : ""}</Text>
      <View style={st.wrap}>
        <Badge tone="green">{craftLabel(craft)}</Badge>
        {details?.category ? <Badge tone="green">{details.category}</Badge> : null}
        <Badge tone="green">Handmade</Badge>
      </View>
      <Body>{details?.description}</Body>
      {[...checks, ["Ready to publish!", ready]].map(([label, ok]) => (
        <Row key={label}><Feather name={ok ? "check-circle" : "circle"} size={18} color={ok ? C.green : C.muted} /><Body style={!ok && { color: C.muted }}>{label}</Body></Row>
      ))}
      <Row>
        <Button style={{ flex: 1 }} variant="outline" title="Edit" onPress={onEdit} />
        <Button style={{ flex: 1.5 }} icon="shopping-bag" title="Publish Product" loading={publishing} disabled={!ready} onPress={onPublish} />
      </Row>
    </Card>
  );
}

/* ---------- wizard ---------- */
export default function AddProductScreen({ navigation }) {
  const { user } = useSession("artisan");
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [craft, setCraft] = useState(user.craft || "pottery");
  const [photo, setPhoto] = useState(null);
  const [enhanced, setEnhanced] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [enhancing, setEnhancing] = useState(false);
  const [voice, setVoice] = useState(null);
  const [details, setDetails] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [pricing, setPricing] = useState({ inputs: { raw: "300", days: "3", wage: String(DEFAULT_DAILY_WAGE), other: "200" }, suggestion: null, from: null, to: null });
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(null);
  const run = useRef(0);

  const onPhoto = async (p) => {
    const id = ++run.current;
    setPhoto(p);
    setEnhanced(null);
    setAnalysis(null);
    setStep(1);
    setEnhancing(true);
    api.identifyProduct(craft, p.base64).then((a) => {
      if (id === run.current && a && a.source !== "unavailable") setAnalysis((x) => ({ ...(x || {}), ...a }));
    }).catch(() => {});
    try {
      const res = await api.enhanceImage(craft, p.base64, { identify: false });
      if (id !== run.current) return;
      setEnhanced(res.enhancedImageUrl || p.uri); // offline: keep the original
      setAnalysis((x) => ({ ...res, ...(x || {}), tags: res.tags, source: res.source }));
    } finally {
      if (id === run.current) setEnhancing(false);
    }
  };

  const generate = async () => {
    setStep(3);
    setGenerating(true);
    try {
      const transcript = [voice?.transcript, voice?.english && voice.english !== voice.transcript ? `(English: ${voice.english})` : ""].join(" ").trim();
      const res = await api.generateCatalogue(craft, photo?.base64, transcript);
      if (res.source === "local-template" && voice?.transcript) {
        res.descriptionHi = voice.transcript;
        if (voice.english) res.description = voice.english;
      }
      if (res.craft && res.craft !== craft && CRAFTS.some((c) => c.key === res.craft)) setCraft(res.craft);
      setDetails(res);
    } finally {
      setGenerating(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const from = Number(pricing.from);
      const to = Number(pricing.to) > from ? Number(pricing.to) : from;
      const prod = await api.publishProduct({
        artisanId: user.id, title: details.title, titleHi: details.titleHi, description: details.description, descriptionHi: details.descriptionHi,
        craft, category: details.category, material: details.materials, price: from, priceMin: from, priceMax: to,
        imageUrl: enhanced?.startsWith("http") || enhanced?.startsWith("data:") ? enhanced : `data:image/jpeg;base64,${photo.base64}`,
      });
      setPublished(prod);
      toast("Product published! 🎉");
    } catch (e) {
      toast(e.message, "red");
    } finally {
      setPublishing(false);
    }
  };

  const back = () => {
    if (step === 0 || published) return navigation.goBack();
    Alert.alert("Leave this product?", "Your progress on this product will be lost.", [
      { text: "Stay", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: () => navigation.goBack() },
    ]);
  };

  useEffect(() => navigation.setOptions({ headerLeft: () => <Pressable onPress={back} hitSlop={10}><Feather name="x" size={22} color={C.ink} /></Pressable> }));

  if (published)
    return (
      <Screen bg={C.bgWarm}>
        <Card style={{ alignItems: "center", paddingVertical: 28 }}>
          <Text style={{ fontSize: 44 }}>🎉</Text>
          <H2>Your product is live!</H2>
          <Muted>आपका उत्पाद अब लाइव है</Muted>
          <Body style={{ textAlign: "center" }}>“{published.title}” is on your storefront and discoverable by verified buyers across India.</Body>
          <Note icon="users">Bulk buyers can now enquire and negotiate. The AI copilot will suggest fair counter-offers — you decide.</Note>
          <Button style={{ alignSelf: "stretch" }} variant="outline" title="View as Buyer" onPress={() => navigation.replace("ProductDetail", { id: published.id })} />
          <Button style={{ alignSelf: "stretch" }} variant="outline" title="My Products" onPress={() => navigation.navigate("ArtisanTabs", { screen: "Products" })} />
          <Button style={{ alignSelf: "stretch" }} icon="camera" title="Add Another" onPress={() => navigation.replace("AddProduct")} />
        </Card>
      </Screen>
    );

  return (
    <Screen bg={C.bgWarm} edges={["bottom"]}>
      <Stepper step={step} />
      {step > 0 && step < 5 && (
        <Pressable onPress={() => setStep(step - 1)}><Text style={st.link}>← Back to {STEPS[step - 1][0]}</Text></Pressable>
      )}
      {step === 0 && <PhotoStep craft={craft} setCraft={setCraft} onPhoto={onPhoto} />}
      {step === 1 && photo && (
        <EnhanceStep photo={photo} enhanced={enhanced} analysis={analysis} busy={enhancing} craft={craft}
          onUseCraft={(c) => { setCraft(c); toast(`Craft set to ${craftLabel(c)}`); }}
          onRetake={() => setStep(0)} onNext={() => setStep(2)} />
      )}
      {step === 2 && <VoiceStep craft={craft} voice={voice} setVoice={setVoice} onNext={generate} />}
      {step === 3 && <DetailsStep details={details} setDetails={setDetails} busy={generating} onRegenerate={generate} onNext={() => setStep(4)} />}
      {step === 4 && <PriceStep craft={craft} pricing={pricing} setPricing={setPricing} onNext={() => setStep(5)} />}
      {step === 5 && <ReviewStep image={enhanced || photo?.uri} details={details} pricing={pricing} craft={craft} onEdit={() => setStep(3)} onPublish={publish} publishing={publishing} />}
    </Screen>
  );
}

const st = StyleSheet.create({
  stepper: { flexDirection: "row", justifyContent: "space-between", backgroundColor: C.white, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.border, ...shadow },
  stepItem: { alignItems: "center", gap: 3, flex: 1 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: C.borderStrong, alignItems: "center", justifyContent: "center", backgroundColor: C.white },
  dotDone: { borderColor: C.green, backgroundColor: C.greenSoft },
  dotNow: { borderColor: C.green, backgroundColor: C.green },
  dotText: { fontWeight: "800", fontSize: 12, color: C.muted },
  stepLabel: { fontSize: 10.5, fontWeight: "700", color: C.muted },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  drop: { alignItems: "center", gap: 6, padding: 20, borderWidth: 2, borderStyle: "dashed", borderColor: C.borderStrong, borderRadius: 14, backgroundColor: "#FCFAF7" },
  dropIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  link: { color: C.blue, fontWeight: "700", textAlign: "center" },
  caption: { textAlign: "center", fontWeight: "700", fontSize: 13, color: C.ink },
  compareImg: { width: "100%", aspectRatio: 1, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  working: { alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#F1EDE6", padding: 8 },
  voiceBox: { alignItems: "center", gap: 12, padding: 16, borderRadius: 14, backgroundColor: "#F6F9FF", borderWidth: 1, borderColor: "#E0E9F7" },
  mic: { width: 90, height: 90, borderRadius: 45, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", ...shadow, elevation: 5 },
  timer: { fontWeight: "800", fontSize: 16, color: C.navy, fontVariant: ["tabular-nums"] },
  wave: { flexDirection: "row", alignItems: "center", gap: 3, height: 36 },
  bar: { width: 4, borderRadius: 2 },
  priceBox: { backgroundColor: C.greenSoft, borderRadius: 12, borderWidth: 1, borderColor: "#C9E3D1", padding: 14, gap: 6 },
  priceBig: { fontSize: 26, fontWeight: "800", color: C.green },
  bold: { fontWeight: "800" },
  reviewImg: { width: "100%", aspectRatio: 1, borderRadius: 12 },
});
