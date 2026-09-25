import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Animated, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { C, TONES, R, shadow } from "./theme";
import { initials } from "./constants";
import { onConnectivity, isOffline } from "./api";

/* ---------------- text ---------------- */
export const H1 = ({ children, style }) => <Text style={[s.h1, style]}>{children}</Text>;
export const H2 = ({ children, style }) => <Text style={[s.h2, style]}>{children}</Text>;
export const H3 = ({ children, style }) => <Text style={[s.h3, style]}>{children}</Text>;
export const Muted = ({ children, style, numberOfLines }) => (
  <Text style={[s.muted, style]} numberOfLines={numberOfLines}>{children}</Text>
);
export const Body = ({ children, style, numberOfLines }) => (
  <Text style={[s.body, style]} numberOfLines={numberOfLines}>{children}</Text>
);

/* ---------------- layout ---------------- */
export function Screen({ children, scroll = true, bg = C.bg, padded = true, refreshControl, edges = ["top"] }) {
  const Inner = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Inner
          style={{ flex: 1 }}
          contentContainerStyle={scroll ? [padded && s.pad, { paddingBottom: 32 }] : undefined}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {scroll ? children : <View style={[{ flex: 1 }, padded && s.pad]}>{children}</View>}
        </Inner>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const Row = ({ children, style, gap = 8 }) => <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>;
export const Gap = ({ h = 12 }) => <View style={{ height: h }} />;

export function Header({ title, subtitle, onBack, right }) {
  return (
    <View style={s.header}>
      {onBack && (
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10} accessibilityLabel="Back">
          <Feather name="arrow-left" size={20} color={C.ink} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <H2>{title}</H2>
        {subtitle ? <Muted>{subtitle}</Muted> : null}
      </View>
      {right}
    </View>
  );
}

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

/* ---------------- controls ---------------- */
const BTN = {
  primary: { bg: C.green, fg: C.white, border: C.green },
  blue: { bg: C.blue, fg: C.white, border: C.blue },
  outline: { bg: C.white, fg: C.green, border: C.green },
  "outline-blue": { bg: C.white, fg: C.blue, border: "#B9CDEE" },
  "outline-red": { bg: C.white, fg: C.red, border: "#F0C0BB" },
  ghost: { bg: "transparent", fg: C.ink, border: "transparent" },
};

export function Button({ title, onPress, variant = "primary", icon, loading, disabled, size = "md", style }) {
  const v = BTN[variant] || BTN.primary;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        s.btn,
        size === "sm" && s.btnSm,
        size === "lg" && s.btnLg,
        { backgroundColor: v.bg, borderColor: v.border, opacity: off ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator color={v.fg} size="small" /> : icon ? <Feather name={icon} size={size === "sm" ? 14 : 17} color={v.fg} /> : null}
      <Text style={[s.btnText, size === "sm" && { fontSize: 13 }, { color: v.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, color = C.ink, style, label }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }, style]} hitSlop={6} accessibilityLabel={label}>
      <Feather name={icon} size={18} color={color} />
    </Pressable>
  );
}

export function Badge({ children, tone = "gray", icon }) {
  const t = TONES[tone] || TONES.gray;
  return (
    <View style={[s.badge, { backgroundColor: t.bg }]}>
      {icon && <Feather name={icon} size={11} color={t.fg} />}
      <Text style={[s.badgeText, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress, tone = "green" }) {
  const t = TONES[tone];
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: t.bg, borderColor: t.fg }]}>
      <Text style={[s.chipText, active && { color: t.fg, fontWeight: "700" }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, hint, error, style, ...input }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#9CA3AF"
        {...input}
        onFocus={(e) => { setFocus(true); input.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); input.onBlur?.(e); }}
        style={[s.input, input.multiline && { minHeight: 88, textAlignVertical: "top" }, focus && s.inputFocus, input.style]}
      />
      {error ? <Text style={s.error}>{error}</Text> : hint ? <Muted style={{ fontSize: 12 }}>{hint}</Muted> : null}
    </View>
  );
}

export function Stat({ value, label, tone = "green", icon }) {
  const t = TONES[tone];
  return (
    <View style={s.stat}>
      <Row style={{ justifyContent: "space-between" }}>
        <Text style={[s.statNum, { color: t.fg }]}>{value}</Text>
        {icon && <View style={[s.statIcon, { backgroundColor: t.bg }]}><Feather name={icon} size={16} color={t.fg} /></View>}
      </Row>
      <Muted>{label}</Muted>
    </View>
  );
}

export function ProductImage({ uri, style }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [uri]);
  if (!uri || failed)
    return <View style={[s.imgFallback, style]}><Feather name="image" size={22} color="#A8A29E" /></View>;
  return <Image source={{ uri }} style={[{ backgroundColor: "#F1EDE6" }, style]} resizeMode="cover" onError={() => setFailed(true)} />;
}

export const Avatar = ({ name, size = 40, tone = "orange" }) => (
  <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone === "blue" ? C.blue : C.orange }]}>
    <Text style={{ color: C.white, fontWeight: "800", fontSize: size * 0.38 }}>{initials(name)}</Text>
  </View>
);

export function Empty({ icon = "inbox", title, children }) {
  return (
    <View style={s.empty}>
      <Feather name={icon} size={32} color="#C7BFB2" />
      <Text style={[s.h3, { color: C.ink }]}>{title}</Text>
      {children ? <Muted style={{ textAlign: "center" }}>{children}</Muted> : null}
    </View>
  );
}

export const Loading = ({ label = "Loading…" }) => (
  <View style={s.loading}><ActivityIndicator color={C.green} /><Muted>{label}</Muted></View>
);

export function Note({ children, tone = "green", icon = "info" }) {
  const t = TONES[tone];
  return (
    <View style={[s.note, { backgroundColor: t.bg }]}>
      <Feather name={icon} size={15} color={t.fg} style={{ marginTop: 1 }} />
      <Text style={{ color: t.fg, flex: 1, fontSize: 13.5, lineHeight: 19 }}>{children}</Text>
    </View>
  );
}

export function Tabs({ tabs, value, onChange, tone = "green" }) {
  const color = tone === "blue" ? C.blue : C.green;
  return (
    <View style={s.tabs}>
      {tabs.map((t) => (
        <Pressable key={t.value} onPress={() => onChange(t.value)} style={[s.tab, value === t.value && { borderBottomColor: color }]}>
          <Text style={[s.tabText, value === t.value && { color }]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Sheet({ open, onClose, title, children }) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={s.sheet}>
          <Row style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <H3>{title}</H3>
            <IconButton icon="x" onPress={onClose} label="Close" />
          </Row>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function OfflinePill() {
  const [off, setOff] = useState(isOffline());
  useEffect(() => {
    const unsub = onConnectivity(setOff);
    return () => { unsub(); };
  }, []);
  if (!off) return null;
  return <Badge tone="orange" icon="wifi-off">Offline demo</Badge>;
}

/* ---------------- toast ---------------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef();
  const show = useCallback((text, tone = "green") => {
    clearTimeout(timer.current);
    setMsg({ text, tone });
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setMsg(null));
    }, 2800);
  }, [anim]);
  const bg = { green: C.green, blue: C.blue, red: C.red, gray: "#44403C" };
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <Animated.View pointerEvents="none" style={[s.toast, { backgroundColor: bg[msg.tone] || C.green, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <Text style={{ color: C.white, fontWeight: "700", textAlign: "center" }}>{msg.text}</Text>
        </Animated.View>
      )}
    </ToastCtx.Provider>
  );
}

/* ---------------- data hook ---------------- */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(() => {
    setState((x) => ({ ...x, loading: true, error: null }));
    return Promise.resolve(fnRef.current())
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);
  return {
    ...state,
    reload: run,
    setData: (d) => setState((x) => ({ ...x, data: typeof d === "function" ? d(x.data) : d })),
  };
}

const s = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "800", color: C.navy },
  h2: { fontSize: 20, fontWeight: "800", color: C.navy },
  h3: { fontSize: 16, fontWeight: "700", color: C.navy },
  muted: { color: C.muted, fontSize: 13.5, lineHeight: 19 },
  body: { color: C.ink, fontSize: 14.5, lineHeight: 21 },
  pad: { padding: 16, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 2 },
  backBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.border, padding: 16, gap: 10, ...shadow },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 18, borderRadius: R.sm, borderWidth: 1 },
  btnSm: { paddingVertical: 7, paddingHorizontal: 12 },
  btnLg: { paddingVertical: 15 },
  btnText: { fontWeight: "700", fontSize: 15 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: R.pill, alignSelf: "flex-start" },
  badgeText: { fontSize: 11.5, fontWeight: "700" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.pill, borderWidth: 1, borderColor: C.borderStrong, backgroundColor: C.white },
  chipText: { fontSize: 13.5, color: C.ink },
  label: { fontSize: 13, fontWeight: "700", color: "#3F4A55" },
  input: { borderWidth: 1, borderColor: C.borderStrong, borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 12 : 9, fontSize: 15, color: C.ink, backgroundColor: C.white },
  inputFocus: { borderColor: C.green },
  error: { color: C.red, fontSize: 12.5 },
  stat: { flex: 1, minWidth: "45%", backgroundColor: C.white, borderRadius: R.md, borderWidth: 1, borderColor: C.border, padding: 14, gap: 2, ...shadow },
  statNum: { fontSize: 26, fontWeight: "800" },
  statIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  imgFallback: { backgroundColor: "#F1EDE6", alignItems: "center", justifyContent: "center" },
  avatar: { alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", gap: 6, paddingVertical: 32, paddingHorizontal: 16 },
  loading: { alignItems: "center", justifyContent: "center", gap: 10, padding: 60 },
  note: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 2.5, borderBottomColor: "transparent" },
  tabText: { fontWeight: "700", color: C.muted },
  backdrop: { flex: 1, backgroundColor: "rgba(20,28,38,0.45)" },
  sheet: { backgroundColor: C.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, paddingBottom: 32, gap: 12 },
  toast: { position: "absolute", bottom: 96, left: 24, right: 24, padding: 12, borderRadius: 12, ...shadow, elevation: 6 },
});
