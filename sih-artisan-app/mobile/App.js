import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, StyleSheet, ActivityIndicator, StatusBar, Platform, Alert,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";

import { COLORS as C, CRAFTS, STEP_CONFIG } from "./src/theme";
import * as api from "./src/api";
import {
  RoleSwitcher,
  BuyerMarketScreen,
  BuyerProductModal,
  BuyerEnquiriesScreen,
  BuyerNegotiationScreen,
  BuyerProfileScreen,
  BuyerBottomNav,
} from "./src/BuyerScreens";

/* ------------------------------------------------------------------
   ShilpSaathi (शिल्प साथी) — React Native mobile app
   Talks to the Node.js/Express backend in /backend for every AI step.
-------------------------------------------------------------------*/

/* --------------------------- shared bits --------------------------- */

function Badge({ children, tone = "indigo" }) {
  const map = {
    indigo: { bg: "#EAF0F5", fg: C.indigo },
    terracotta: { bg: "#F6E6DE", fg: C.terracottaDeep },
    leaf: { bg: "#E7F0E8", fg: C.leaf },
    turmeric: { bg: "#FBF0DA", fg: "#8A5F16" },
  };
  const t = map[tone];
  return (
    <View style={{ backgroundColor: t.bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ color: t.fg, fontSize: 11.5, fontWeight: "700" }}>{children}</Text>
    </View>
  );
}

function PrimaryButton({ children, onPress, icon, disabled, loading }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.primaryBtn, (disabled || loading) && { backgroundColor: "#D8CBB8" }]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon && <Feather name={icon} size={18} color="#fff" style={{ marginRight: 8 }} />}
          <Text style={styles.primaryBtnText}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function GhostButton({ children, onPress, icon }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.ghostBtn}>
      {icon && <Feather name={icon} size={17} color={C.indigo} style={{ marginRight: 8 }} />}
      <Text style={styles.ghostBtnText}>{children}</Text>
    </TouchableOpacity>
  );
}

function ScreenHeader({ title, hi, onBack, right }) {
  return (
    <View style={styles.headerRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={16} color={C.ink} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.h1}>{title}</Text>
          {hi ? <Text style={styles.subtle}>{hi}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

function CraftIcon({ name, size = 24, color = C.indigo }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

/* --------------------------- Splash / Login --------------------------- */

function SplashScreen({ onNext }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 24 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="auto-fix" size={38} color="#fff" />
        </View>
        <Text style={styles.brandHi}>शिल्प साथी</Text>
        <Text style={styles.brandEn}>ShilpSaathi</Text>
        <Text style={styles.tagline}>Just Click. Just Speak. AI Handles the Rest.</Text>
      </View>
      <View style={{ paddingBottom: 34 }}>
        <Text style={styles.smallLabel}>भाषा चुनें · Choose your language</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <TouchableOpacity style={styles.langBtn} onPress={onNext}>
            <Text style={styles.langBtnHi}>हिंदी</Text>
            <Text style={styles.subtle}>Hindi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.langBtn} onPress={onNext}>
            <Text style={styles.langBtnHi}>English</Text>
            <Text style={styles.subtle}>अंग्रेज़ी</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function LoginScreen({ onNext, setArtisan, setBuyer, setUserRole }) {
  const [role, setRole] = useState("artisan"); // "artisan" | "buyer"
  const [phone, setPhone] = useState("9876543210");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setPhone(newRole === "artisan" ? "9876543210" : "9123456780");
    setSent(false);
    setOtp("");
  };

  const sendOtp = async () => {
    setBusy(true);
    await api.sendOtp(phone);
    setBusy(false);
    setSent(true);
  };

  const verifyAndProceed = async (code) => {
    const finalOtp = code || otp;
    if (finalOtp.length !== 4) return;
    setBusy(true);
    const res = await api.verifyOtp(phone, finalOtp, role);
    setUserRole(role);
    if (role === "buyer") {
      if (setBuyer) setBuyer(res.buyer);
      setBusy(false);
      onNext(res.buyer, "buyer");
    } else {
      if (setArtisan) setArtisan(res.artisan);
      setBusy(false);
      onNext(res.artisan, "artisan");
    }
  };

  useEffect(() => {
    if (otp.length === 4) {
      verifyAndProceed(otp);
    }
  }, [otp]);

  const quickDemoArtisan = async () => {
    setBusy(true);
    setUserRole("artisan");
    await api.sendOtp("9876543210");
    const res = await api.verifyOtp("9876543210", "1234", "artisan");
    if (setArtisan) setArtisan(res.artisan);
    setBusy(false);
    onNext(res.artisan, "artisan");
  };

  const quickDemoBuyer = async () => {
    setBusy(true);
    setUserRole("buyer");
    await api.sendOtp("9123456780");
    const res = await api.verifyOtp("9123456780", "1234", "buyer", {
      name: "Rajiv Sharma",
      companyName: "Rathi Exports Pvt Ltd",
      buyerType: "Exporter",
      city: "New Delhi",
    });
    if (setBuyer) setBuyer(res.buyer);
    setBusy(false);
    onNext(res.buyer, "buyer");
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 26 }}>
      {/* Brand Header */}
      <View style={{ alignItems: "center", marginBottom: 14 }}>
        <View style={[styles.logoCircle, { backgroundColor: role === "artisan" ? C.terracotta : C.indigo, width: 50, height: 50, borderRadius: 14, marginBottom: 8 }]}>
          <MaterialCommunityIcons name={role === "artisan" ? "hammer" : "shopping"} size={26} color="#fff" />
        </View>
        <Text style={styles.h1}>शिल्प साथी · ShilpSaathi</Text>
        <Text style={[styles.subtle, { textAlign: "center" }]}>
          AI-Powered Digital Business Manager & Artisan Marketplace
        </Text>
      </View>

      {/* Role Selection Tabs */}
      <View style={{ backgroundColor: "#E2D7BE", borderRadius: 12, padding: 4, flexDirection: "row", marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => handleRoleChange("artisan")}
          style={[{ flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" }, role === "artisan" && { backgroundColor: C.terracotta }]}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: role === "artisan" ? "#fff" : C.ink }}>
            🎨 कारीगर (Artisan)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleRoleChange("buyer")}
          style={[{ flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" }, role === "buyer" && { backgroundColor: C.indigo }]}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: role === "buyer" ? "#fff" : C.ink }}>
            🛍️ खरीदार (Buyer)
          </Text>
        </TouchableOpacity>
      </View>

      {!sent ? (
        <>
          <Text style={styles.smallLabel}>
            {role === "artisan" ? "Artisan Mobile Number · कारीगर मोबाइल" : "Buyer Mobile Number · खरीदार मोबाइल"}
          </Text>
          <View style={styles.inputRow}>
            <Text style={{ color: C.inkSoft, fontWeight: "700", fontSize: 15, marginRight: 6 }}>+91</Text>
            <TextInput
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
              placeholder="98765 43210"
              keyboardType="number-pad"
              style={{ flex: 1, fontSize: 16, color: C.ink }}
            />
          </View>

          <PrimaryButton disabled={phone.length !== 10} loading={busy} onPress={sendOtp}>
            Send OTP · ओटीपी भेजें
          </PrimaryButton>

          {/* Quick Demo Buttons */}
          <View style={{ marginTop: 18, gap: 8 }}>
            <Text style={{ fontSize: 11.5, fontWeight: "700", color: C.inkSoft, textAlign: "center" }}>
              INSTANT 1-CLICK DEMO LOGIN (डेमो लॉगिन)
            </Text>

            <TouchableOpacity
              onPress={quickDemoArtisan}
              style={{ backgroundColor: "#F6E6DE", borderWidth: 1.5, borderColor: "#E6C9BC", borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}
            >
              <MaterialCommunityIcons name="palette" size={18} color={C.terracottaDeep} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: C.terracottaDeep }}>
                  Login as Artisan: Radha Devi (Pottery)
                </Text>
                <Text style={{ fontSize: 11, color: C.inkSoft }}>View craft studio, 7-step AI wizard, AI negotiation</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={quickDemoBuyer}
              style={{ backgroundColor: "#EAF0F5", borderWidth: 1.5, borderColor: "#C8D8E6", borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}
            >
              <MaterialCommunityIcons name="store-search" size={18} color={C.indigo} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: C.indigo }}>
                  Login as Buyer: Rajiv Sharma (Rathi Exports)
                </Text>
                <Text style={{ fontSize: 11, color: C.inkSoft }}>Explore marketplace, instant buy, make wholesale offers</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 13, color: C.inkSoft, marginBottom: 8 }}>
            OTP sent to +91 {phone} ({role}). Demo code: <Text style={{ fontWeight: "700", color: C.terracotta }}>1234</Text>
          </Text>

          <TouchableOpacity
            onPress={() => { setOtp("1234"); verifyAndProceed("1234"); }}
            style={{ backgroundColor: "#F6E6DE", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignSelf: "flex-start", marginBottom: 16, flexDirection: "row", alignItems: "center" }}
          >
            <Feather name="zap" size={14} color={C.terracottaDeep} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 12.5, fontWeight: "700", color: C.terracottaDeep }}>Tap to Auto-fill "1234" · 1234 स्वतः भरें</Text>
          </TouchableOpacity>

          <Text style={styles.smallLabel}>Enter OTP · ओटीपी डालें</Text>
          <TextInput
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 4))}
            placeholder="1234"
            keyboardType="number-pad"
            style={[styles.otpInput]}
            autoFocus
          />
          <PrimaryButton disabled={otp.length !== 4} loading={busy} onPress={() => verifyAndProceed(otp)}>
            Verify & Continue as {role === "artisan" ? "Artisan" : "Buyer"} · आगे बढ़ें
          </PrimaryButton>
        </>
      )}
    </View>
  );
}

/* --------------------------- Onboarding --------------------------- */

function OnboardingScreen({ artisan, setArtisan, onNext }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(artisan.name || "");
  const [craft, setCraft] = useState(artisan.craft || "");
  const [location, setLocation] = useState(artisan.location || "");
  const [pehchanId, setPehchanId] = useState(artisan.pehchanId || "");
  const [busy, setBusy] = useState(false);

  const canNext = step === 0 ? name.trim().length > 1 : step === 1 ? !!craft : location.trim().length > 1;

  const finish = async () => {
    setBusy(true);
    const updated = await api.updateArtisan(artisan.id, { name, craft, location, pehchanId });
    setArtisan({ ...artisan, ...updated });
    setBusy(false);
    onNext();
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28 }}>
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 26 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 4, backgroundColor: i <= step ? C.terracotta : C.border }} />
        ))}
      </View>

      {step === 0 && (
        <>
          <Text style={styles.h1}>आपका नाम? · Your name</Text>
          <Text style={[styles.subtle, { marginBottom: 20 }]}>So buyers know who made this beautiful work.</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Radha Devi" style={styles.textField} autoFocus />

          <Text style={[styles.smallLabel, { marginTop: 18 }]}>Pehchan ID (optional) · पहचान आईडी</Text>
          <TextInput value={pehchanId} onChangeText={setPehchanId} placeholder="e.g. PEHCHAN-UP-88213" style={styles.textField} />
        </>
      )}

      {step === 1 && (
        <>
          <Text style={styles.h1}>आपकी कला? · Your craft</Text>
          <Text style={[styles.subtle, { marginBottom: 20 }]}>Tap the icon that matches your work.</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {CRAFTS.map((c) => {
              const active = craft === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setCraft(c.key)}
                  style={[styles.craftCard, active && { borderColor: C.terracotta, backgroundColor: "#F6E6DE" }]}
                >
                  <CraftIcon name={c.icon} size={26} color={active ? C.terracottaDeep : C.indigo} />
                  <Text style={styles.craftEn}>{c.en}</Text>
                  <Text style={styles.subtle}>{c.hi}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.h1}>आप कहाँ से हैं? · Your location</Text>
          <Text style={[styles.subtle, { marginBottom: 20 }]}>District & state helps buyers find local craft clusters.</Text>
          <View style={styles.inputRow}>
            <Feather name="map-pin" size={18} color={C.inkSoft} style={{ marginRight: 8 }} />
            <TextInput value={location} onChangeText={setLocation} placeholder="e.g. Khurja, Uttar Pradesh" style={{ flex: 1, fontSize: 15, color: C.ink }} />
          </View>
        </>
      )}

      <View style={{ flex: 1 }} />
      <PrimaryButton disabled={!canNext} loading={busy} icon={step === 2 ? "check" : "chevron-right"} onPress={() => (step < 2 ? setStep(step + 1) : finish())}>
        {step === 2 ? "Get Started · शुरू करें" : "Continue"}
      </PrimaryButton>
    </View>
  );
}

/* --------------------------- Home --------------------------- */

function StatCard({ icon, label, value, tone }) {
  return (
    <View style={styles.statCard}>
      <Feather name={icon} size={17} color={tone} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.subtle}>{label}</Text>
    </View>
  );
}

function HomeScreen({ artisan, products, enquiries, onAdd, onShop, onEnquiries }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View>
          <Text style={styles.subtle}>नमस्ते 👋</Text>
          <Text style={styles.h1}>{artisan.name || "Artisan"} जी</Text>
        </View>
        <View style={[styles.avatar]}>
          <Feather name="user" size={19} color="#fff" />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
        <StatCard icon="package" label="Products" value={products.length} tone={C.indigo} />
        <StatCard icon="eye" label="Views (mo)" value={647} tone={C.terracotta} />
        <StatCard icon="message-circle" label="Enquiries" value={enquiries.length} tone={C.leaf} />
      </View>

      <TouchableOpacity onPress={onAdd} activeOpacity={0.9} style={styles.addProductCta}>
        <View style={styles.addProductIconWrap}>
          <Feather name="camera" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>Add New Product</Text>
          <Text style={styles.ctaSub}>नया उत्पाद जोड़ें · Just click, just speak</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.sectionRow}>
        <Text style={styles.h2}>My Shop</Text>
        <TouchableOpacity onPress={onShop}><Text style={styles.link}>View all</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((p) => (
          <View key={p.id} style={styles.miniProductCard}>
            <Image source={{ uri: p.imageUrl }} style={styles.miniProductImg} />
            <View style={{ padding: 8 }}>
              <Text numberOfLines={1} style={styles.miniProductTitle}>{p.title}</Text>
              <Text style={styles.miniProductPrice}>₹{p.price}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.h2}>Buyer Enquiries</Text>
        <TouchableOpacity onPress={onEnquiries}><Text style={styles.link}>View all</Text></TouchableOpacity>
      </View>
      {enquiries.slice(0, 2).map((e) => (
        <View key={e.id} style={styles.enquiryPreview}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.enquiryName}>{e.buyerName}</Text>
            <Badge tone="indigo">{e.buyerType}</Badge>
          </View>
          <Text style={styles.subtle}>Re: {e.productTitle} · Qty {e.quantity}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* --------------------------- Add Product Flow --------------------------- */

function Stepper({ current }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 4 }}>
      {STEP_CONFIG.map((s, i) => {
        const active = s.id === current;
        const done = s.id < current;
        return (
          <React.Fragment key={s.id}>
            <View style={[styles.stepDot, done && { backgroundColor: C.leaf }, active && { backgroundColor: C.terracotta, borderWidth: 2, borderColor: C.terracottaDeep }]}>
              {done ? <Feather name="check" size={12} color="#fff" /> : <MaterialCommunityIcons name={s.icon} size={12} color={active ? "#fff" : C.inkSoft} />}
            </View>
            {i < STEP_CONFIG.length - 1 && <View style={[styles.stepLine, done && { backgroundColor: C.leaf }]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function CaptureScreen({ onDone }) {
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [busy, setBusy] = useState(false);

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Camera permission needed", "Please allow camera access to photograph your product.");
        return;
      }
      setBusy(true);
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true });
      setBusy(false);
      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64);
      }
    } catch (e) {
      setBusy(false);
      pickFromGallery();
    }
  };

  const pickFromGallery = async () => {
    try {
      setBusy(true);
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: true });
      setBusy(false);
      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64);
      }
    } catch (e) {
      setBusy(false);
    }
  };

  return (
    <View style={styles.stepScreen}>
      <Text style={styles.h2}>Capture Product</Text>
      <Text style={[styles.subtle, { marginBottom: 12 }]}>फोटो लें · Frame it well, AI will clean it up</Text>

      <View style={styles.viewfinder}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%", borderRadius: 20 }} resizeMode="cover" />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Feather name="camera" size={36} color="rgba(255,255,255,0.4)" style={{ marginBottom: 8 }} />
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Tap below to click photo or select</Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 22 }}>
        {!photoUri ? (
          <View style={{ alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={takePhoto} disabled={busy} style={styles.shutterBtn}>
              {busy ? <ActivityIndicator color="#fff" /> : null}
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFromGallery} style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="image" size={14} color={C.indigo} />
              <Text style={[styles.link, { marginLeft: 6 }]}>Choose from Gallery · गैलरी से चुनें</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}><GhostButton icon="refresh-cw" onPress={() => { setPhotoUri(null); setPhotoBase64(null); }}>Retake</GhostButton></View>
            <View style={{ flex: 1 }}><PrimaryButton icon="chevron-right" onPress={() => onDone({ uri: photoUri, base64: photoBase64 })}>Use Photo</PrimaryButton></View>
          </View>
        )}
      </View>
    </View>
  );
}

function EnhanceScreen({ photoUri, photoBase64, craft, onDone }) {
  const [phase, setPhase] = useState("processing");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await api.enhanceImage(craft, photoBase64);
      setAnalysis(res);
      setTimeout(() => setPhase("done"), 1200);
    })();
  }, []);

  return (
    <View style={styles.stepScreen}>
      <Text style={styles.h2}>Enhance Image</Text>
      <Text style={[styles.subtle, { marginBottom: 12 }]}>सुधारें · AI cleans background & lighting</Text>

      <View style={[styles.viewfinder, { backgroundColor: "#eee" }]}>
        {photoUri && <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%", borderRadius: 20, opacity: phase === "done" ? 1 : 0.55 }} resizeMode="cover" />}
        {phase === "processing" && (
          <View style={styles.processingBanner}>
            <MaterialCommunityIcons name="auto-fix" size={15} color={C.turmeric} />
            <Text style={{ color: "#fff", fontSize: 12.5, marginLeft: 8 }}>Removing background, fixing lighting…</Text>
          </View>
        )}
        {phase === "done" && (
          <View style={{ position: "absolute", top: 10, left: 10 }}>
            <Badge tone="leaf">✓ Background removed</Badge>
          </View>
        )}
      </View>

      {phase === "done" && (
        <View style={{ gap: 8, marginTop: 12 }}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="turmeric">Lighting fixed</Badge>
            <Badge tone="indigo">Cropped to market format</Badge>
            {analysis?.source === "gemini-1.5-flash" && <Badge tone="leaf">AI Inspected</Badge>}
          </View>
          {!!analysis?.artisanTip && (
            <View style={{ backgroundColor: "#F7F5EE", borderRadius: 8, padding: 8, marginTop: 4, flexDirection: "row", alignItems: "center" }}>
              <Feather name="info" size={13} color={C.terracotta} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 11.5, color: C.inkSoft, flex: 1 }}>{analysis.artisanTip}</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <PrimaryButton disabled={phase !== "done"} icon="chevron-right" onPress={onDone}>
          {phase === "done" ? "Looks Good" : "Enhancing…"}
        </PrimaryButton>
      </View>
    </View>
  );
}

function VoiceScreen({ craft, onDone }) {
  const [phase, setPhase] = useState("idle"); // idle -> recording -> transcribing -> done
  const [showEnglish, setShowEnglish] = useState(false);
  const [hiText, setHiText] = useState("");
  const [enText, setEnText] = useState("");
  const recordingRef = useRef(null);

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Microphone permission needed", "Please allow microphone access to describe your product by voice.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setPhase("recording");
    } catch (e) {
      // Fall back to a simulated recording if mic isn't available (e.g. web preview)
      setPhase("recording");
    }
  };

  const stopRecording = async () => {
    setPhase("transcribing");
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }
    } catch (e) {}
    const res = await api.transcribeVoice(craft);
    setHiText(res.transcriptHi);
    const tr = await api.translateText(res.transcriptHi, craft);
    setEnText(tr.translatedText);
    setPhase("done");
  };

  return (
    <View style={styles.stepScreen}>
      <Text style={styles.h2}>Describe by Voice</Text>
      <Text style={[styles.subtle, { marginBottom: 12 }]}>अपनी भाषा में बोलें · Speak in your own language</Text>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }}>
        {phase !== "done" && (
          <>
            <TouchableOpacity
              onPress={phase === "idle" ? startRecording : phase === "recording" ? stopRecording : undefined}
              style={[styles.micBtn, phase === "recording" && { backgroundColor: C.terracotta }]}
            >
              {phase === "transcribing" ? <ActivityIndicator color="#fff" /> : <Feather name="mic" size={38} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.recordHint}>
              {phase === "idle" && "टैप करके बोलना शुरू करें · Tap to start speaking"}
              {phase === "recording" && "सुन रहा हूँ… दोबारा टैप करें रोकने के लिए · Tap again to stop"}
              {phase === "transcribing" && "लिख रहा हूँ… · Transcribing…"}
            </Text>
          </>
        )}

        {phase === "done" && (
          <View style={{ width: "100%" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Feather name="volume-2" size={16} color={C.leaf} />
              <Text style={{ fontSize: 12.5, fontWeight: "700", color: C.leaf, marginLeft: 8 }}>Transcribed successfully</Text>
            </View>
            <View style={styles.transcriptCard}>
              <Text style={{ fontSize: 14.5, color: C.ink, lineHeight: 21 }}>{showEnglish ? enText : hiText}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowEnglish(!showEnglish)} style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
              <Feather name="globe" size={14} color={C.indigo} />
              <Text style={styles.link}> {showEnglish ? "Show Hindi original" : "Show English translation"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <PrimaryButton disabled={phase !== "done"} icon="chevron-right" onPress={() => onDone({ hiText, enText })}>
        Confirm & Continue
      </PrimaryButton>
    </View>
  );
}

function CatalogueScreen({ craft, photoBase64, voiceTranscript, onDone }) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [materials, setMaterials] = useState("");
  const [tags, setTags] = useState([]);
  const [source, setSource] = useState("");

  useEffect(() => {
    (async () => {
      const c = await api.generateCatalogue(craft, photoBase64, voiceTranscript);
      setTitle(c.title || "");
      setTitleHi(c.titleHi || "");
      const fullDesc = c.descriptionHi && c.descriptionHi !== c.description
        ? `${c.description}\n\n${c.descriptionHi}`
        : c.description || "";
      setDesc(fullDesc);
      setCategory(c.category || "Handicraft");
      setMaterials(c.materials || "");
      setTags(c.tags || []);
      setSource(c.source || "");
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.stepScreen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={C.terracotta} size="large" />
        <Text style={[styles.subtle, { marginTop: 12 }]}>Generating bilingual catalogue with AI…</Text>
        <Text style={{ color: C.inkSoft, fontSize: 12, marginTop: 4 }}>Analyzing craft, materials & story</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.stepScreen} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.h2}>Generated Catalogue</Text>
        {source === "gemini-1.5-flash" ? (
          <Badge tone="leaf">✨ Gemini 1.5 Flash</Badge>
        ) : (
          <Badge tone="turmeric">Craft AI</Badge>
        )}
      </View>
      <Text style={[styles.subtle, { marginBottom: 12 }]}>विवरण · AI-written, fully editable</Text>

      <Text style={styles.smallLabel}>Title · शीर्षक</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.textField} />

      {!!titleHi && (
        <>
          <Text style={[styles.smallLabel, { marginTop: 10 }]}>Hindi Title · हिंदी शीर्षक</Text>
          <TextInput value={titleHi} onChangeText={setTitleHi} style={styles.textField} />
        </>
      )}

      <Text style={[styles.smallLabel, { marginTop: 14 }]}>Description (Bilingual) · विवरण व सांस्कृतिक कथा</Text>
      <TextInput value={desc} onChangeText={setDesc} multiline numberOfLines={4} style={[styles.textField, { height: 110, textAlignVertical: "top" }]} />

      {!!materials && (
        <>
          <Text style={[styles.smallLabel, { marginTop: 14 }]}>Materials · सामग्री</Text>
          <TextInput value={materials} onChangeText={setMaterials} style={styles.textField} />
        </>
      )}

      <View style={{ flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <Badge tone="turmeric">Category: {category}</Badge>
        <Badge tone="indigo">Craft: {craft}</Badge>
        {tags.slice(0, 4).map((t, idx) => (
          <Badge key={idx} tone="leaf">#{t}</Badge>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <PrimaryButton icon="chevron-right" onPress={() => onDone({ title, titleHi, description: desc, category, materials, tags })}>
          Looks Right, Continue
        </PrimaryButton>
      </View>
    </ScrollView>
  );
}


function PriceScreen({ craft, onDone }) {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ min: 450, recommended: 650, max: 850, basis: "" });
  const [price, setPrice] = useState(650);
  const [cost, setCost] = useState("300");

  const fetchPrice = async (c) => {
    setLoading(true);
    const r = await api.recommendPrice(Number(c) || 300, craft);
    setRange(r);
    setPrice(r.recommended);
    setLoading(false);
  };

  useEffect(() => { fetchPrice(cost); }, []);

  return (
    <View style={styles.stepScreen}>
      <Text style={styles.h2}>Recommended Price</Text>
      <Text style={[styles.subtle, { marginBottom: 12 }]}>मूल्य · Based on cost & market trends — you decide</Text>

      <Text style={styles.smallLabel}>Your production cost (₹) · लागत</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={cost}
          onChangeText={setCost}
          keyboardType="number-pad"
          style={[styles.textField, { flex: 1 }]}
        />
        <TouchableOpacity style={styles.recalcBtn} onPress={() => fetchPrice(cost)}>
          <Feather name="refresh-cw" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.priceCard}>
        {loading ? (
          <ActivityIndicator color={C.terracotta} />
        ) : (
          <>
            <Text style={styles.subtle}>Suggested range</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 6, marginBottom: 12 }}>
              <MaterialCommunityIcons name="currency-inr" size={20} color={C.terracottaDeep} />
              <Text style={styles.priceValue}>{price}</Text>
              <Text style={[styles.subtle, { marginLeft: 6, marginBottom: 4 }]}>/ piece</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {[range.min, range.recommended, range.max].map((p, i) => (
                <TouchableOpacity key={i} onPress={() => setPrice(p)} style={[styles.priceChip, price === p && styles.priceChipActive]}>
                  <Text style={[styles.priceChipText, price === p && { color: "#fff" }]}>₹{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      {!!range.basis && (
        <View style={styles.insightBox}>
          <Feather name="trending-up" size={16} color={C.terracottaDeep} />
          <Text style={styles.insightText}>{range.basis}</Text>
        </View>
      )}

      <View style={{ flex: 1 }} />
      <PrimaryButton icon="chevron-right" onPress={() => onDone(price)}>Set This Price</PrimaryButton>
    </View>
  );
}

function PublishScreen({ photoUri, catalogue, price, artisanId, craft, onDone, onPublished }) {
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    setBusy(true);
    const product = await api.publishProduct({
      artisanId,
      title: catalogue.title,
      titleHi: catalogue.titleHi,
      description: catalogue.description,
      craft,
      category: catalogue.category,
      price,
      imageUrl: photoUri || "https://picsum.photos/seed/newitem/600/450",
    });
    onPublished(product);
    setBusy(false);
    setPublished(true);
  };

  return (
    <View style={styles.stepScreen}>
      <Text style={styles.h2}>Publish to Store</Text>
      <Text style={[styles.subtle, { marginBottom: 12 }]}>प्रकाशित करें · This is exactly how buyers will see it</Text>

      <View style={styles.publishCard}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ height: 150, width: "100%" }} resizeMode="cover" />
        ) : (
          <View style={{ height: 150, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center" }}>
            <Feather name="package" size={40} color="rgba(255,255,255,0.85)" />
          </View>
        )}
        <View style={{ padding: 14 }}>
          <Text style={styles.publishTitle}>{catalogue.title}</Text>
          <Text style={[styles.subtle, { marginTop: 4 }]} numberOfLines={2}>{catalogue.description}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <Text style={styles.publishPrice}>₹{price}</Text>
            <Badge tone="indigo">{catalogue.category}</Badge>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />
      {!published ? (
        <PrimaryButton icon="shopping-bag" loading={busy} onPress={publish}>Publish Now · अभी प्रकाशित करें</PrimaryButton>
      ) : (
        <View style={{ alignItems: "center" }}>
          <View style={styles.successCircle}><Feather name="check-circle" size={30} color="#fff" /></View>
          <Text style={styles.h2}>Published!</Text>
          <Text style={[styles.subtle, { marginBottom: 16 }]}>Your product is now live on your storefront.</Text>
          <PrimaryButton icon="chevron-right" onPress={onDone}>See Buyer Connections</PrimaryButton>
        </View>
      )}
    </View>
  );
}

function ConnectScreen({ enquiries, onDone }) {
  const sample = enquiries[0];
  return (
    <View style={styles.stepScreen}>
      <Text style={styles.h2}>Connect with Buyers</Text>
      <Text style={[styles.subtle, { marginBottom: 12 }]}>खरीदारों से जुड़ें · Wholesalers & exporters can now reach you</Text>

      <View style={styles.infoBox}>
        <Feather name="users" size={22} color={C.indigo} />
        <Text style={styles.infoText}>
          Your storefront is discoverable to verified buyers on ONDC & partner marketplaces. Bulk enquiries will appear here, and you can negotiate price directly.
        </Text>
      </View>

      {sample && (
        <View style={[styles.enquiryPreview, { marginTop: 18 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.enquiryName}>{sample.buyerName}</Text>
            <Badge tone="terracotta">{sample.buyerType}</Badge>
          </View>
          <Text style={[styles.subtle, { marginTop: 6 }]}>{sample.thread[0]?.message}</Text>
        </View>
      )}

      <View style={{ flex: 1 }} />
      <PrimaryButton icon="home" onPress={onDone}>Done · वापस होम पर जाएं</PrimaryButton>
    </View>
  );
}

function AddProductFlow({ artisan, enquiries, onExit, onProductPublished }) {
  const [step, setStep] = useState(1);
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [catalogue, setCatalogue] = useState({});
  const [price, setPrice] = useState(650);
  const craft = artisan.craft || "pottery";

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.flowTopBar}>
        <TouchableOpacity onPress={onExit} style={{ padding: 4 }}><Feather name="x" size={20} color={C.inkSoft} /></TouchableOpacity>
        <Text style={styles.flowTopBarText}>Step {step} of 7</Text>
        <View style={{ width: 28 }} />
      </View>
      <Stepper current={step} />

      <View style={{ flex: 1 }}>
        {step === 1 && (
          <CaptureScreen
            onDone={({ uri, base64 }) => {
              setPhotoUri(uri);
              setPhotoBase64(base64 || null);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <EnhanceScreen
            photoUri={photoUri}
            photoBase64={photoBase64}
            craft={craft}
            onDone={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <VoiceScreen
            craft={craft}
            onDone={({ hiText, enText }) => {
              setVoiceTranscript(hiText || enText || "");
              setStep(4);
            }}
          />
        )}
        {step === 4 && (
          <CatalogueScreen
            craft={craft}
            photoBase64={photoBase64}
            voiceTranscript={voiceTranscript}
            onDone={(c) => {
              setCatalogue(c);
              setStep(5);
            }}
          />
        )}
        {step === 5 && <PriceScreen craft={craft} onDone={(p) => { setPrice(p); setStep(6); }} />}
        {step === 6 && (
          <PublishScreen
            photoUri={photoUri}
            catalogue={catalogue}
            price={price}
            artisanId={artisan.id}
            craft={craft}
            onPublished={(product) => onProductPublished({ ...product, artisanId: artisan.id, craft })}
            onDone={() => setStep(7)}
          />
        )}
        {step === 7 && <ConnectScreen enquiries={enquiries} onDone={onExit} />}
      </View>
    </View>
  );
}


/* --------------------------- Shop / Enquiries / Negotiation / Profile --------------------------- */

function ShopScreen({ products, onBack, onAdd }) {
  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader
        title="My Shop" hi="मेरी दुकान" onBack={onBack}
        right={<TouchableOpacity onPress={onAdd} style={styles.smallAddBtn}><Feather name="plus" size={17} color="#fff" /></TouchableOpacity>}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {products.map((p) => (
          <View key={p.id} style={styles.shopCard}>
            <Image source={{ uri: p.imageUrl }} style={styles.shopCardImg} />
            <View style={{ padding: 10 }}>
              <Text numberOfLines={1} style={styles.miniProductTitle}>{p.title}</Text>
              {!!p.titleHi && <Text style={styles.subtle} numberOfLines={1}>{p.titleHi}</Text>}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <Text style={styles.miniProductPrice}>₹{p.price}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Feather name="eye" size={11} color={C.inkSoft} />
                  <Text style={[styles.subtle, { marginLeft: 3 }]}>{p.views || 0}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function EnquiriesScreen({ enquiries, onBack, onOpen }) {
  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Buyer Enquiries" hi="खरीदार पूछताछ" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6 }}>
        {enquiries.map((e) => (
          <TouchableOpacity key={e.id} onPress={() => onOpen(e)} style={styles.enquiryCard} activeOpacity={0.85}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.enquiryName}>{e.buyerName}</Text>
              <Badge tone="indigo">{e.buyerType}</Badge>
            </View>
            <Text style={[styles.subtle, { marginTop: 6 }]} numberOfLines={2}>{e.thread[e.thread.length - 1]?.message}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Badge tone="turmeric">Product: {e.productTitle}</Badge>
              <Badge tone="leaf">Qty: {e.quantity}</Badge>
            </View>
            <Text style={[styles.link, { marginTop: 10 }]}>Open negotiation →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function NegotiationScreen({ enquiry, onBack, onUpdated }) {
  const [thread, setThread] = useState(enquiry.thread);
  const [suggestion, setSuggestion] = useState(null);
  const [counterPrice, setCounterPrice] = useState(String(enquiry.askingPrice));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await api.suggestResponse(enquiry.id);
      setSuggestion(s);
      if (s?.suggestedPrice) setCounterPrice(String(s.suggestedPrice));
    })();
  }, []);

  const respond = async (action) => {
    setBusy(true);
    const updated = await api.respondToEnquiry(enquiry.id, action, Number(counterPrice));
    if (updated) {
      setThread(updated.thread);
      onUpdated(updated);
    } else {
      // offline fallback: append locally
      const entry = {
        id: `local-${Date.now()}`, sender: "artisan",
        message: action === "accept" ? `Accepted at ₹${counterPrice}/piece.` : action === "counter" ? `Countered at ₹${counterPrice}/piece.` : "Declined this offer.",
        offerPrice: action === "reject" ? null : Number(counterPrice), time: new Date().toISOString(),
      };
      setThread([...thread, entry]);
    }
    setBusy(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={enquiry.buyerName} hi={enquiry.buyerType} onBack={onBack} />
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          <Badge tone="turmeric">Product: {enquiry.productTitle}</Badge>
          <Badge tone="leaf">Qty: {enquiry.quantity}</Badge>
          <Badge tone="indigo">Asking ₹{enquiry.askingPrice}</Badge>
        </View>

        {thread.map((m) => (
          <View key={m.id} style={[styles.chatBubble, m.sender === "artisan" ? styles.chatBubbleMine : styles.chatBubbleTheirs]}>
            <Text style={{ color: m.sender === "artisan" ? "#fff" : C.ink, fontSize: 13.5 }}>{m.message}</Text>
            {m.offerPrice != null && (
              <Text style={{ color: m.sender === "artisan" ? "#FBE8DE" : C.terracottaDeep, fontWeight: "700", marginTop: 4, fontSize: 12.5 }}>
                Offer: ₹{m.offerPrice}/piece
              </Text>
            )}
          </View>
        ))}

        {suggestion?.action && suggestion.action !== "none" && (
          <View style={styles.aiSuggestBox}>
            <MaterialCommunityIcons name="auto-fix" size={16} color={C.terracottaDeep} />
            <Text style={styles.aiSuggestText}>
              AI suggests: <Text style={{ fontWeight: "700" }}>{suggestion.action === "accept" ? "Accept" : "Counter"} at ₹{suggestion.suggestedPrice}</Text>. {suggestion.note}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.negotiateBar}>
        <Text style={styles.smallLabel}>Your response price (₹) · मूल्य</Text>
        <TextInput value={counterPrice} onChangeText={setCounterPrice} keyboardType="number-pad" style={styles.textField} />
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <View style={{ flex: 1 }}><GhostButton icon="x" onPress={() => respond("reject")}>Decline</GhostButton></View>
          <View style={{ flex: 1 }}><GhostButton icon="repeat" onPress={() => respond("counter")}>Counter</GhostButton></View>
          <View style={{ flex: 1.3 }}><PrimaryButton icon="check" loading={busy} onPress={() => respond("accept")}>Accept</PrimaryButton></View>
        </View>
      </View>
    </View>
  );
}

function ProfileScreen({ artisan, onBack }) {
  const craft = CRAFTS.find((c) => c.key === artisan.craft) || CRAFTS[0];
  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Profile" hi="प्रोफ़ाइल" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6 }}>
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { width: 68, height: 68, borderRadius: 34, marginBottom: 12 }]}>
            <Feather name="user" size={30} color="#fff" />
          </View>
          <Text style={styles.h2}>{artisan.name || "Artisan"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Feather name="map-pin" size={12} color={C.inkSoft} />
            <Text style={[styles.subtle, { marginLeft: 4 }]}>{artisan.location || "India"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
            <Badge tone="indigo">{craft.en}</Badge>
            <Badge tone="leaf">{artisan.kycVerified ? "KYC Verified" : "KYC Pending"}</Badge>
          </View>
        </View>

        <View style={styles.profileList}>
          {[
            { icon: "globe", label: "App Language", value: artisan.language === "hi" ? "हिंदी" : "English" },
            { icon: "credit-card", label: "Pehchan ID", value: artisan.pehchanId || "Not added" },
            { icon: "phone", label: "Mobile Number", value: artisan.phone ? `+91 ${artisan.phone}` : "—" },
          ].map((row, i) => (
            <View key={i} style={[styles.profileRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
              <Feather name={row.icon} size={17} color={C.inkSoft} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.subtle}>{row.label}</Text>
                <Text style={{ fontSize: 13.5, color: C.ink, fontWeight: "600" }}>{row.value}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={C.inkSoft} />
            </View>
          ))}
        </View>

        <View style={styles.insightBox}>
          <Feather name="check-circle" size={16} color={C.terracottaDeep} />
          <Text style={styles.insightText}>Linked with PM Vishwakarma Yojana for skilling & toolkit support.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* --------------------------- Bottom Nav --------------------------- */

function BottomNav({ active, onNav }) {
  const items = [
    { key: "home", label: "Home", icon: "home" },
    { key: "shop", label: "Shop", icon: "shopping-bag" },
    { key: "add", label: "", icon: "plus" },
    { key: "enquiries", label: "Buyers", icon: "message-circle" },
    { key: "profile", label: "Profile", icon: "user" },
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map((it) => {
        if (it.key === "add") {
          return (
            <TouchableOpacity key={it.key} onPress={() => onNav("add")} style={styles.fab}>
              <Feather name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          );
        }
        const isActive = active === it.key;
        return (
          <TouchableOpacity key={it.key} onPress={() => onNav(it.key)} style={styles.navItem}>
            <Feather name={it.icon} size={20} color={isActive ? C.terracotta : C.inkSoft} />
            <Text style={[styles.navLabel, isActive && { color: C.terracotta }]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* --------------------------- Root App --------------------------- */

export default function App() {
  const [phase, setPhase] = useState("splash"); // splash -> login -> onboarding -> app
  const [userRole, setUserRole] = useState("artisan"); // "artisan" | "buyer"

  // Artisan State
  const [tab, setTab] = useState("home");
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [artisan, setArtisan] = useState({
    id: "artisan-demo-001",
    name: "Radha Devi",
    craft: "pottery",
    location: "Khurja, Uttar Pradesh",
    pehchanId: "PEHCHAN-UP-88213",
    kycVerified: true,
  });
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [activeEnquiry, setActiveEnquiry] = useState(null);

  // Buyer State
  const [buyerTab, setBuyerTab] = useState("market"); // market | deals | buyerProfile
  const [buyer, setBuyer] = useState({
    id: "buyer-demo-001",
    name: "Rajiv Sharma",
    companyName: "Rathi Exports Pvt Ltd",
    buyerType: "Exporter",
    city: "New Delhi",
    phone: "9123456780",
  });
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [buyerEnquiries, setBuyerEnquiries] = useState([]);
  const [selectedMarketProduct, setSelectedMarketProduct] = useState(null);
  const [activeBuyerEnquiry, setActiveBuyerEnquiry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("all");

  // Load Artisan Data
  const refreshArtisanData = async () => {
    if (artisan?.id) {
      const p = await api.listProducts(artisan.id);
      const e = await api.listEnquiries(artisan.id);
      setProducts(p || []);
      setEnquiries(e || []);
    }
  };

  // Load Buyer Data
  const refreshBuyerData = async () => {
    const mp = await api.listMarketplaceProducts(selectedCraft, searchQuery);
    const be = await api.listBuyerEnquiries(buyer?.id, buyer?.phone);
    setMarketplaceProducts(mp || []);
    setBuyerEnquiries(be || []);
  };

  useEffect(() => {
    if (phase === "app") {
      if (userRole === "artisan") {
        refreshArtisanData();
      } else {
        refreshBuyerData();
      }
    }
  }, [phase, userRole, artisan?.id, buyer?.id, selectedCraft]);

  const handleProductPublished = (product) => {
    setProducts((prev) => [product, ...prev]);
    setMarketplaceProducts((prev) => [product, ...prev]);
  };

  const handleSwitchRole = (newRole) => {
    setUserRole(newRole);
    setActiveEnquiry(null);
    setActiveBuyerEnquiry(null);
    setSelectedMarketProduct(null);
    setShowAddFlow(false);
    if (newRole === "artisan") {
      refreshArtisanData();
    } else {
      refreshBuyerData();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.paper }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.paper} />

      {phase === "splash" && <SplashScreen onNext={() => setPhase("login")} />}

      {phase === "login" && (
        <LoginScreen
          setArtisan={setArtisan}
          setBuyer={setBuyer}
          setUserRole={setUserRole}
          onNext={(data, role) => {
            if (role === "buyer") {
              setUserRole("buyer");
              setPhase("app");
              refreshBuyerData();
            } else {
              setUserRole("artisan");
              if (data && data.name && data.craft) {
                setPhase("app");
                refreshArtisanData();
              } else {
                setPhase("onboarding");
              }
            }
          }}
        />
      )}

      {phase === "onboarding" && (
        <OnboardingScreen
          artisan={artisan}
          setArtisan={setArtisan}
          onNext={() => {
            setPhase("app");
            refreshArtisanData();
          }}
        />
      )}

      {phase === "app" && (
        <View style={{ flex: 1 }}>
          {/* Top Role Switcher Header — Allows toggling between Artisan & Buyer anytime! */}
          <RoleSwitcher
            currentRole={userRole}
            onSwitchRole={handleSwitchRole}
            artisanName={artisan.name || "Radha Devi"}
            buyerName={buyer?.name ? `${buyer.name} (${buyer.companyName || buyer.buyerType})` : "Rajiv Sharma (Rathi Exports)"}
          />

          {/* ================= ARTISAN VIEW ================= */}
          {userRole === "artisan" && (
            <View style={{ flex: 1 }}>
              {!showAddFlow && !activeEnquiry && (
                <View style={{ flex: 1 }}>
                  {tab === "home" && (
                    <HomeScreen
                      artisan={artisan}
                      products={products}
                      enquiries={enquiries}
                      onAdd={() => setShowAddFlow(true)}
                      onShop={() => setTab("shop")}
                      onEnquiries={() => setTab("enquiries")}
                    />
                  )}
                  {tab === "shop" && (
                    <ShopScreen
                      products={products}
                      onBack={() => setTab("home")}
                      onAdd={() => setShowAddFlow(true)}
                    />
                  )}
                  {tab === "enquiries" && (
                    <EnquiriesScreen
                      enquiries={enquiries}
                      onBack={() => setTab("home")}
                      onOpen={setActiveEnquiry}
                    />
                  )}
                  {tab === "profile" && (
                    <ProfileScreen artisan={artisan} onBack={() => setTab("home")} />
                  )}
                  <BottomNav
                    active={tab}
                    onNav={(k) => (k === "add" ? setShowAddFlow(true) : setTab(k))}
                  />
                </View>
              )}

              {showAddFlow && (
                <AddProductFlow
                  artisan={artisan}
                  enquiries={enquiries}
                  onExit={() => {
                    setShowAddFlow(false);
                    setTab("shop");
                  }}
                  onProductPublished={handleProductPublished}
                />
              )}

              {activeEnquiry && (
                <NegotiationScreen
                  enquiry={activeEnquiry}
                  onBack={() => {
                    setActiveEnquiry(null);
                    refreshArtisanData();
                  }}
                  onUpdated={(updated) => {
                    setEnquiries((prev) =>
                      prev.map((e) => (e.id === updated.id ? updated : e))
                    );
                    setActiveEnquiry(updated);
                  }}
                />
              )}
            </View>
          )}

          {/* ================= BUYER VIEW ================= */}
          {userRole === "buyer" && (
            <View style={{ flex: 1 }}>
              {!activeBuyerEnquiry && (
                <View style={{ flex: 1 }}>
                  {buyerTab === "market" && (
                    <BuyerMarketScreen
                      products={marketplaceProducts}
                      onSelectProduct={(p) => setSelectedMarketProduct(p)}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedCraft={selectedCraft}
                      setSelectedCraft={setSelectedCraft}
                      onRefresh={refreshBuyerData}
                    />
                  )}
                  {buyerTab === "deals" && (
                    <BuyerEnquiriesScreen
                      enquiries={buyerEnquiries}
                      onSelectEnquiry={(e) => setActiveBuyerEnquiry(e)}
                      onRefresh={refreshBuyerData}
                    />
                  )}
                  {buyerTab === "buyerProfile" && (
                    <BuyerProfileScreen
                      buyer={buyer}
                      onLogout={() => setPhase("login")}
                      onSwitchToArtisan={() => handleSwitchRole("artisan")}
                    />
                  )}
                  <BuyerBottomNav activeTab={buyerTab} onNav={setBuyerTab} />
                </View>
              )}

              {/* Buyer Negotiation Chat Screen */}
              {activeBuyerEnquiry && (
                <BuyerNegotiationScreen
                  enquiry={activeBuyerEnquiry}
                  buyer={buyer}
                  onBack={() => {
                    setActiveBuyerEnquiry(null);
                    refreshBuyerData();
                  }}
                  onUpdated={(updated) => {
                    setBuyerEnquiries((prev) =>
                      prev.map((e) => (e.id === updated.id ? updated : e))
                    );
                    setActiveBuyerEnquiry(updated);
                  }}
                />
              )}

              {/* Buyer Product Detail & Order/Negotiation Modal */}
              <BuyerProductModal
                product={selectedMarketProduct}
                buyer={buyer}
                visible={selectedMarketProduct != null}
                onClose={() => setSelectedMarketProduct(null)}
                onOrderPlaced={(order) => {
                  setSelectedMarketProduct(null);
                  refreshBuyerData();
                  setBuyerTab("deals");
                  setActiveBuyerEnquiry(order);
                }}
                onEnquiryCreated={(newEnquiry) => {
                  setSelectedMarketProduct(null);
                  refreshBuyerData();
                  setBuyerTab("deals");
                  setActiveBuyerEnquiry(newEnquiry);
                }}
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

/* --------------------------- Styles --------------------------- */

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: "700", color: C.ink },
  h2: { fontSize: 19, fontWeight: "700", color: C.ink, marginBottom: 2 },
  subtle: { fontSize: 12.5, color: C.inkSoft },
  smallLabel: { fontSize: 12, fontWeight: "700", color: C.inkSoft, marginBottom: 8 },
  link: { color: C.indigo, fontWeight: "700", fontSize: 12.5 },

  primaryBtn: {
    backgroundColor: C.terracotta, borderRadius: 14, paddingVertical: 14, alignItems: "center",
    justifyContent: "center", flexDirection: "row",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15.5 },
  ghostBtn: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 13,
    alignItems: "center", justifyContent: "center", flexDirection: "row", backgroundColor: "transparent",
  },
  ghostBtnText: { color: C.indigo, fontWeight: "700", fontSize: 15 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingBottom: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },

  logoCircle: { width: 84, height: 84, borderRadius: 22, backgroundColor: C.terracotta, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  brandHi: { fontSize: 34, fontWeight: "700", color: C.ink },
  brandEn: { fontSize: 18, color: C.indigo, marginTop: 2 },
  tagline: { fontSize: 13.5, color: C.inkSoft, marginTop: 10, textAlign: "center", maxWidth: 240 },
  smallLabelCentered: { fontSize: 12.5, color: C.inkSoft, textAlign: "center", fontWeight: "600" },
  langBtn: { flex: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  langBtnHi: { fontSize: 17, fontWeight: "700", color: C.ink },

  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20 },
  otpInput: { borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 14, fontSize: 22, letterSpacing: 10, textAlign: "center", backgroundColor: C.card, marginBottom: 20, color: C.ink },
  textField: { borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 13, fontSize: 15, backgroundColor: C.card, color: C.ink },

  craftCard: { width: "48%", alignItems: "center", gap: 6, paddingVertical: 18, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card, marginBottom: 10 },
  craftEn: { fontSize: 13, fontWeight: "700", color: C.ink },

  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center" },
  statCard: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 12, gap: 6 },
  statValue: { fontSize: 21, fontWeight: "700", color: C.ink },

  addProductCta: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.terracotta, borderRadius: 18, padding: 20, marginTop: 18 },
  addProductIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  ctaTitle: { color: "#fff", fontWeight: "800", fontSize: 15.5 },
  ctaSub: { color: "rgba(255,255,255,0.85)", fontSize: 12 },

  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 10 },
  miniProductCard: { width: 132, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, overflow: "hidden", marginRight: 10 },
  miniProductImg: { width: "100%", height: 90, backgroundColor: C.paperDeep },
  miniProductTitle: { fontSize: 12, fontWeight: "700", color: C.ink },
  miniProductPrice: { fontSize: 12.5, fontWeight: "800", color: C.terracottaDeep, marginTop: 4 },

  enquiryPreview: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 8 },
  enquiryCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12 },
  enquiryName: { fontWeight: "700", fontSize: 14, color: C.ink },

  stepScreen: { flex: 1, padding: 20, paddingTop: 8 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.paperDeep, alignItems: "center", justifyContent: "center" },
  stepLine: { flex: 1, height: 2, backgroundColor: C.paperDeep, marginBottom: 16, marginHorizontal: 2 },

  viewfinder: { flex: 1, minHeight: 260, borderRadius: 20, backgroundColor: "#12181F", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  shutterBtn: { alignSelf: "center", width: 68, height: 68, borderRadius: 34, backgroundColor: C.terracotta, borderWidth: 4, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  processingBanner: { position: "absolute", bottom: 14, left: 14, right: 14, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center" },

  micBtn: { width: 108, height: 108, borderRadius: 54, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center" },
  recordHint: { fontSize: 13.5, color: C.inkSoft, textAlign: "center", fontWeight: "600", maxWidth: 260 },
  transcriptCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14 },

  flowTopBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 14 },
  flowTopBarText: { flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: "700", color: C.inkSoft },

  priceCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 20, marginTop: 14 },
  priceValue: { fontSize: 34, fontWeight: "700", color: C.ink, marginLeft: 4 },
  priceChip: { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  priceChipActive: { backgroundColor: C.terracotta, borderColor: C.terracotta },
  priceChipText: { fontWeight: "700", color: C.ink, fontSize: 13 },
  recalcBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center" },

  insightBox: { backgroundColor: "#F6E6DE", borderRadius: 14, padding: 14, flexDirection: "row", gap: 8, marginTop: 16 },
  insightText: { flex: 1, fontSize: 12.5, color: C.terracottaDeep, lineHeight: 18 },
  infoBox: { backgroundColor: "#EAF0F5", borderRadius: 16, padding: 16, flexDirection: "row", gap: 12 },
  infoText: { flex: 1, fontSize: 12.5, color: C.indigoDeep, lineHeight: 18 },

  publishCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, overflow: "hidden" },
  publishTitle: { fontWeight: "700", fontSize: 15, color: C.ink },
  publishPrice: { fontFamily: undefined, fontWeight: "700", fontSize: 18, color: C.terracottaDeep },
  successCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.leaf, alignItems: "center", justifyContent: "center", marginBottom: 12 },

  shopCard: { width: "48%", backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  shopCardImg: { width: "100%", height: 100, backgroundColor: C.paperDeep },

  chatBubble: { maxWidth: "82%", borderRadius: 14, padding: 12, marginBottom: 10 },
  chatBubbleTheirs: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignSelf: "flex-start" },
  chatBubbleMine: { backgroundColor: C.terracotta, alignSelf: "flex-end" },
  aiSuggestBox: { backgroundColor: "#F6E6DE", borderRadius: 14, padding: 12, flexDirection: "row", gap: 8, marginTop: 4, marginBottom: 16 },
  aiSuggestText: { flex: 1, fontSize: 12.5, color: C.terracottaDeep, lineHeight: 18 },
  negotiateBar: { padding: 16, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.card },

  profileCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 20, alignItems: "center" },
  profileList: { marginTop: 18, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: "hidden" },
  profileRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 16 },

  bottomNav: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingBottom: Platform.OS === "ios" ? 18 : 8 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.terracotta, borderWidth: 4, borderColor: C.card, alignItems: "center", justifyContent: "center", marginTop: -26 },
  navItem: { alignItems: "center", gap: 3, padding: 4 },
  navLabel: { fontSize: 10, fontWeight: "700", color: C.inkSoft },

  smallAddBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.terracotta, alignItems: "center", justifyContent: "center" },
});
