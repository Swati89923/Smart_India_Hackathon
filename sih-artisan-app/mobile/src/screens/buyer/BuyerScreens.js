import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { C, shadow } from "../../theme";
import {
  Screen, H1, H2, H3, Muted, Body, Card, Row, Button, Badge, Chip, Stat, Field, ProductImage, Avatar, Empty, Loading, Note,
  Sheet, useAsync, useToast, OfflinePill,
} from "../../ui";
import { useSession } from "../../session";
import { CRAFTS, ENQUIRY_STATUS, inr, priceRange, timeAgo, craftLabel } from "../../constants";
import { ChatThread, ChatComposer, lastOffer, Storefront } from "../artisan/ArtisanScreens";
import * as api from "../../api";

const HERO = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&auto=format&fit=crop&q=70";
const buyerLabel = (b) => (b.companyName ? `${b.name} (${b.companyName})` : b.name);

export function ProductCard({ p, onPress }) {
  return (
    <Pressable style={({ pressed }) => [st.pcard, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <ProductImage uri={p.imageUrl} style={st.pcardImg} />
      <View style={{ padding: 10, gap: 2 }}>
        <Text style={st.pcardTitle} numberOfLines={2}>{p.title}</Text>
        <Muted style={{ fontSize: 12 }} numberOfLines={1}>{p.kycVerified ? "✓ " : ""}{p.artisanName} · {p.artisanLocation?.split(",")[0]}</Muted>
        <Text style={st.price}>{priceRange(p)}</Text>
      </View>
    </Pressable>
  );
}

/* ======================= Marketplace home ======================= */
export function MarketHomeScreen({ navigation }) {
  const [q, setQ] = useState("");
  const { data: products, loading, reload } = useAsync(() => api.listProducts(), []);
  const artisans = useMemo(() => {
    const m = new Map();
    (products || []).forEach((p) => !m.has(p.artisanId) && m.set(p.artisanId, p));
    return [...m.values()].slice(0, 8);
  }, [products]);
  const search = () => navigation.navigate("Products", { q });

  return (
    <Screen bg={C.bgBlue} refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
      <Row style={{ justifyContent: "space-between" }}>
        <H2>ShilpSaathi Market</H2>
        <OfflinePill />
      </Row>
      <View style={st.hero}>
        <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(60,25,8,0.55)" }]} />
        <Text style={st.heroTitle}>Authentic Indian Crafts</Text>
        <Text style={st.heroSub}>From Local Hands to Global Homes · सीधे कारीगरों से</Text>
        <View style={st.heroSearch}>
          <Feather name="search" size={17} color={C.muted} />
          <TextInput style={{ flex: 1, paddingVertical: 10, color: C.ink }} placeholder="Search products, artisans, crafts…" placeholderTextColor="#9CA3AF"
            value={q} onChangeText={setQ} onSubmitEditing={search} returnKeyType="search" />
          <Button size="sm" variant="blue" title="Search" onPress={search} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {CRAFTS.map((c) => (
          <Pressable key={c.key} style={st.cat} onPress={() => navigation.navigate("Products", { craft: c.key })}>
            <View style={st.catIcon}><Text style={{ fontSize: 22 }}>{c.emoji}</Text></View>
            <Text style={st.catText}>{c.en}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Row style={{ justifyContent: "space-between" }}>
        <H3>Trending crafts</H3>
        <Pressable onPress={() => navigation.navigate("Products", {})}><Text style={st.link}>View all</Text></Pressable>
      </Row>
      {!products ? <Loading /> : (
        <View style={st.grid}>
          {products.slice(0, 6).map((p) => <ProductCard key={p.id} p={p} onPress={() => navigation.navigate("ProductDetail", { id: p.id })} />)}
        </View>
      )}
      {artisans.length > 0 && (
        <>
          <H3>Meet the artisans</H3>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {artisans.map((p) => (
              <Pressable key={p.artisanId} style={st.artisan} onPress={() => navigation.navigate("Storefront", { id: p.artisanId })}>
                <Avatar name={p.artisanName} size={48} />
                <Text style={st.pcardTitle} numberOfLines={1}>{p.artisanName}</Text>
                <Muted style={{ fontSize: 11.5 }} numberOfLines={1}>{p.artisanLocation}</Muted>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

/* ======================= Product list with filters ======================= */
const PRICE_BANDS = [["", "Any price"], ["0-500", "Under ₹500"], ["500-1000", "₹500–1,000"], ["1000-2500", "₹1,000–2,500"], ["2500-1000000", "Above ₹2,500"]];

export function ProductListScreen({ navigation, route }) {
  const [craft, setCraft] = useState(route.params?.craft || "all");
  const [q, setQ] = useState(route.params?.q || "");
  const [query, setQuery] = useState(route.params?.q || "");
  const [state, setState] = useState("");
  const [band, setBand] = useState("");
  const [verified, setVerified] = useState(false);
  const [sort, setSort] = useState("popular");
  const [filters, setFilters] = useState(false);
  const { data: products, loading, reload } = useAsync(() => api.listProducts({ craft, search: query }), [craft, query]);

  useFocusEffect(useCallback(() => {
    if (route.params?.craft) setCraft(route.params.craft);
    if (route.params?.q != null) { setQ(route.params.q); setQuery(route.params.q); }
  }, [route.params]));

  const states = useMemo(() => [...new Set((products || []).map((p) => p.artisanState || p.artisanLocation?.split(",").pop().trim()).filter(Boolean))].sort(), [products]);
  const shown = (products || [])
    .filter((p) => !state || (p.artisanState || p.artisanLocation || "").includes(state))
    .filter((p) => { if (!band) return true; const [lo, hi] = band.split("-").map(Number); return p.price >= lo && p.price < hi; })
    .filter((p) => !verified || p.kycVerified)
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "new" ? new Date(b.createdAt) - new Date(a.createdAt) : (b.views || 0) - (a.views || 0)));
  const activeCount = [state, band, verified, sort !== "popular"].filter(Boolean).length;

  return (
    <Screen bg={C.bgBlue} refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
      <H2>{query ? `Results for “${query}”` : craft !== "all" ? craftLabel(craft) : "All Products"}</H2>
      <View style={st.searchRow}>
        <Feather name="search" size={16} color={C.muted} />
        <TextInput style={{ flex: 1, paddingVertical: 10, color: C.ink }} placeholder="Search…" placeholderTextColor="#9CA3AF" value={q} onChangeText={setQ}
          onSubmitEditing={() => setQuery(q)} returnKeyType="search" />
        {query ? <Pressable onPress={() => { setQ(""); setQuery(""); }}><Feather name="x" size={16} color={C.muted} /></Pressable> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip tone="blue" label={`⚙ Filters${activeCount ? ` (${activeCount})` : ""}`} active={activeCount > 0} onPress={() => setFilters(true)} />
        <Chip tone="blue" label="All" active={craft === "all"} onPress={() => setCraft("all")} />
        {CRAFTS.map((c) => <Chip key={c.key} tone="blue" label={c.en} active={craft === c.key} onPress={() => setCraft(c.key)} />)}
      </ScrollView>
      <Muted>{shown.length} handcrafted products from verified artisans</Muted>
      {!products ? <Loading /> : shown.length === 0 ? <Card><Empty icon="package" title="No products match">Try removing a filter.</Empty></Card> : (
        <View style={st.grid}>{shown.map((p) => <ProductCard key={p.id} p={p} onPress={() => navigation.navigate("ProductDetail", { id: p.id })} />)}</View>
      )}

      <Sheet open={filters} onClose={() => setFilters(false)} title="Filters">
        <Text style={st.label}>State</Text>
        <View style={st.wrap}>
          <Chip tone="blue" label="Any" active={!state} onPress={() => setState("")} />
          {states.map((x) => <Chip key={x} tone="blue" label={x} active={state === x} onPress={() => setState(x)} />)}
        </View>
        <Text style={st.label}>Price</Text>
        <View style={st.wrap}>{PRICE_BANDS.map(([v, l]) => <Chip key={v} tone="blue" label={l} active={band === v} onPress={() => setBand(v)} />)}</View>
        <Text style={st.label}>Sort by</Text>
        <View style={st.wrap}>
          {[["popular", "Most viewed"], ["new", "Newest"], ["low", "Price ↑"], ["high", "Price ↓"]].map(([v, l]) => <Chip key={v} tone="blue" label={l} active={sort === v} onPress={() => setSort(v)} />)}
        </View>
        <Chip tone="green" label="✓ Verified artisans only" active={verified} onPress={() => setVerified(!verified)} />
        <Row>
          <Button style={{ flex: 1 }} variant="outline-blue" title="Reset" onPress={() => { setState(""); setBand(""); setVerified(false); setSort("popular"); }} />
          <Button style={{ flex: 1 }} variant="blue" title="Show results" onPress={() => setFilters(false)} />
        </Row>
      </Sheet>
    </Screen>
  );
}

/* ======================= Product detail ======================= */
export function ProductDetailScreen({ route, navigation }) {
  const { user: buyer } = useSession("buyer");
  const toast = useToast();
  const [contact, setContact] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { data, loading } = useAsync(async () => {
    const p = await api.getProduct(route.params.id);
    const more = await api.listProducts({ artisanId: p.artisanId });
    return [p, more.filter((x) => x.id !== p.id && (x.status || "published") === "published")];
  }, [route.params.id]);

  if (loading && !data) return <Screen><Loading /></Screen>;
  if (!data) return <Screen><Empty icon="package" title="Product not found" /></Screen>;
  const [p, more] = data;

  const needBuyer = () => {
    if (buyer) return true;
    toast("Please log in as a buyer first", "blue");
    navigation.navigate("Login", { role: "buyer" });
    return false;
  };

  const sendContact = async () => {
    setSending(true);
    try {
      const enq = await api.createEnquiry({
        productId: p.id, artisanId: p.artisanId, buyerId: buyer.id, buyerName: buyerLabel(buyer), buyerType: buyer.buyerType,
        buyerPhone: buyer.phone, productTitle: p.title, quantity: 1, askingPrice: p.price,
        initialMessage: message || `Hello! I'm interested in your ${p.title}.`,
      });
      setContact(false);
      toast("Message sent to artisan", "blue");
      navigation.navigate("ChatDetail", { id: enq.id });
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen bg={C.bgBlue} edges={["bottom"]}>
      <ProductImage uri={p.imageUrl} style={st.pdpImg} />
      <View style={{ gap: 6 }}>
        <H1 style={{ fontSize: 22 }}>{p.title}</H1>
        {p.titleHi ? <Muted>{p.titleHi}</Muted> : null}
        <Pressable onPress={() => navigation.navigate("Storefront", { id: p.artisanId })}>
          <Muted>by <Text style={{ fontWeight: "800", color: C.blue }}>{p.artisanName}</Text>{p.kycVerified ? " ✓" : ""} · 📍 {p.artisanLocation}</Muted>
        </Pressable>
        <Text style={[st.priceBig]}>{priceRange(p)}</Text>
      </View>
      <Body>{p.description}</Body>
      {p.descriptionHi ? <Muted>{p.descriptionHi}</Muted> : null}
      <View style={st.wrap}>
        <Badge tone="blue">{craftLabel(p.craft)}</Badge>
        {p.category ? <Badge tone="blue">{p.category}</Badge> : null}
        {p.material ? <Badge tone="gray">{p.material}</Badge> : null}
      </View>
      <Note icon="shield">Pehchan ID: {p.pehchanId} · Direct from artisan — no middlemen</Note>
      <Row>
        <Button style={{ flex: 1 }} variant="outline-blue" icon="message-circle" title="Contact" onPress={() => needBuyer() && setContact(true)} />
        <Button style={{ flex: 1.4 }} variant="blue" icon="package" title="Bulk Order" onPress={() => needBuyer() && navigation.navigate("BulkEnquiry", { id: p.id })} />
      </Row>
      {more.length > 0 && (
        <>
          <H3>More from {p.artisanName}</H3>
          <View style={st.grid}>{more.slice(0, 4).map((x) => <ProductCard key={x.id} p={x} onPress={() => navigation.push("ProductDetail", { id: x.id })} />)}</View>
        </>
      )}
      <Sheet open={contact} onClose={() => setContact(false)} title={`Message ${p.artisanName}`}>
        <Field multiline value={message} onChangeText={setMessage} placeholder={`Hello! I'm interested in your ${p.title}. Is it available in other colours?`} />
        <Button variant="blue" title="Send Message" loading={sending} onPress={sendContact} />
      </Sheet>
    </Screen>
  );
}

/* ======================= Bulk enquiry ======================= */
export function BulkEnquiryScreen({ route, navigation }) {
  const { user: buyer } = useSession("buyer");
  const toast = useToast();
  const { data: p } = useAsync(() => api.getProduct(route.params.id), [route.params.id]);
  const [form, setForm] = useState({ quantity: "100", budgetMin: "", budgetMax: "", requiredBy: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k, digits) => (v) => setForm((f) => ({ ...f, [k]: digits ? v.replace(/\D/g, "") : v }));
  if (!p) return <Screen><Loading /></Screen>;

  const validDate = !form.requiredBy || /^\d{4}-\d{2}-\d{2}$/.test(form.requiredBy);
  const submit = async () => {
    const lo = Number(form.budgetMin) || null;
    const hi = Number(form.budgetMax) || lo;
    setBusy(true);
    try {
      const budget = lo ? ` Budget: ₹${lo}${hi && hi !== lo ? `–₹${hi}` : ""} per unit.` : "";
      const by = form.requiredBy ? ` Required by ${new Date(form.requiredBy).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.` : "";
      const enq = await api.createEnquiry({
        productId: p.id, artisanId: p.artisanId, buyerId: buyer.id, buyerName: buyerLabel(buyer), buyerType: buyer.buyerType,
        buyerPhone: buyer.phone, productTitle: p.title, quantity: Number(form.quantity), askingPrice: p.price,
        initialOfferPrice: lo, budgetMin: lo, budgetMax: hi, requiredBy: form.requiredBy || null,
        initialMessage: `${form.message || `We would like to order ${form.quantity} units of ${p.title}.`}${budget}${by}`,
      });
      toast("Enquiry sent! The artisan will respond soon.", "blue");
      navigation.replace("ChatDetail", { id: enq.id });
    } catch (e) {
      toast(e.message, "red");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen bg={C.bgBlue} edges={["bottom"]}>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <ProductImage uri={p.imageUrl} style={{ width: 56, height: 56, borderRadius: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={st.pcardTitle} numberOfLines={2}>{p.title}</Text>
          <Muted>{p.artisanName} · listed {priceRange(p)}</Muted>
        </View>
      </Card>
      <Card style={{ gap: 14 }}>
        <Field label="Quantity" keyboardType="number-pad" value={form.quantity} onChangeText={set("quantity", true)} />
        <Row>
          <Field style={{ flex: 1 }} label="Budget / unit from (₹)" keyboardType="number-pad" value={form.budgetMin} onChangeText={set("budgetMin", true)} placeholder="800" />
          <Field style={{ flex: 1 }} label="to (₹)" keyboardType="number-pad" value={form.budgetMax} onChangeText={set("budgetMax", true)} placeholder="900" />
        </Row>
        <Field label="Required By (YYYY-MM-DD)" value={form.requiredBy} onChangeText={set("requiredBy")} placeholder="2026-12-15" error={validDate ? null : "Use the format YYYY-MM-DD"} />
        <Field label="Message" multiline value={form.message} onChangeText={set("message")} placeholder="Needed for corporate gifting. Please share availability and customization options." />
        {form.budgetMin ? <Muted>Estimated order value: <Text style={{ fontWeight: "800", color: C.ink }}>{inr(Number(form.budgetMin) * Number(form.quantity))}{form.budgetMax ? ` – ${inr(Number(form.budgetMax) * Number(form.quantity))}` : ""}</Text></Muted> : null}
        <Button variant="blue" size="lg" title="Send Enquiry" loading={busy} disabled={!Number(form.quantity) || !validDate} onPress={submit} />
      </Card>
    </Screen>
  );
}

/* ======================= Chats ======================= */
function useBuyerEnquiries(buyer) {
  const res = useAsync(() => (buyer ? api.listEnquiries({ buyerId: buyer.id, buyerPhone: buyer.phone }) : Promise.resolve([])), [buyer?.id]);
  useFocusEffect(useCallback(() => { res.reload(); }, [res.reload]));
  return res;
}

export function ChatsScreen({ navigation }) {
  const { user } = useSession("buyer");
  const { data: enquiries, loading, reload } = useBuyerEnquiries(user);
  if (!enquiries) return <Screen><Loading /></Screen>;
  return (
    <Screen bg={C.bgBlue} refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
      <H2>Chat / Negotiation</H2>
      {enquiries.length === 0 ? <Card><Empty icon="message-circle" title="No conversations yet">Open a product and tap Contact or Bulk Order.</Empty></Card> : (
        <Card style={{ padding: 6 }}>
          {enquiries.map((e) => (
            <Pressable key={e.id} style={st.row} onPress={() => navigation.navigate("ChatDetail", { id: e.id })}>
              <Avatar name={e.productTitle} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={st.pcardTitle} numberOfLines={1}>{e.productTitle}</Text>
                <Muted numberOfLines={1}>{e.thread?.[e.thread.length - 1]?.message}</Muted>
              </View>
              <Badge tone={ENQUIRY_STATUS[e.status]?.tone}>{ENQUIRY_STATUS[e.status]?.label}</Badge>
            </Pressable>
          ))}
        </Card>
      )}
    </Screen>
  );
}

export function ChatDetailScreen({ route }) {
  const toast = useToast();
  const { data: enq, setData, loading } = useAsync(() => api.getEnquiry(route.params.id), [route.params.id]);
  const [deal, setDeal] = useState(null);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Escrow / Cash on Delivery");
  const [busy, setBusy] = useState(false);
  if (loading && !enq) return <Screen><Loading /></Screen>;
  if (!enq) return <Screen><Empty title="Conversation not found" /></Screen>;
  const artisanOffer = lastOffer(enq, "artisan");
  const latest = lastOffer(enq);
  const closed = ["deal_closed", "declined"].includes(enq.status);
  const canAccept = !closed && (enq.status === "accepted" || latest?.sender === "artisan");
  const price = (artisanOffer || latest)?.offerPrice;

  const confirm = async () => {
    setBusy(true);
    try {
      const u = await api.confirmDeal(enq.id, { finalPrice: deal, address, paymentMode: payment });
      if (u) setData(u);
      setDeal(null);
      toast("🤝 Deal confirmed!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen bg={C.bgBlue} edges={["bottom"]}>
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={st.pcardTitle}>{enq.productTitle}</Text>
            <Muted>{enq.quantity} units · listed {inr(enq.askingPrice)}/unit</Muted>
          </View>
          <Badge tone={ENQUIRY_STATUS[enq.status]?.tone}>{ENQUIRY_STATUS[enq.status]?.label}</Badge>
        </Row>
        <ChatThread enquiry={enq} me="buyer" />
        {canAccept && price != null && (
          <View style={st.acceptBar}>
            <Body style={{ flex: 1 }}>Artisan {enq.status === "accepted" ? "accepted" : "offered"} <Text style={{ fontWeight: "800" }}>{inr(price)}</Text>/unit · Total {inr(price * enq.quantity)}</Body>
            <Button size="sm" variant="blue" icon="check" title="Accept" onPress={() => setDeal(price)} />
          </View>
        )}
        {enq.status === "deal_closed" && <Note icon="check-circle">Order confirmed · {enq.quantity} × {inr(enq.finalPrice)} = {inr(enq.totalAmount)}</Note>}
        <ChatComposer tone="blue" disabled={closed} onSend={async (m, o) => { const u = await api.sendMessage(enq.id, "buyer", m, o); if (u) setData(u); }} />
      </Card>
      <Sheet open={deal != null} onClose={() => setDeal(null)} title="Confirm Order">
        <View style={st.invoice}>
          <Row style={{ justifyContent: "space-between" }}><Muted>Quantity</Muted><Body>{enq.quantity}</Body></Row>
          <Row style={{ justifyContent: "space-between" }}><Muted>Unit price</Muted><Body>{inr(deal)}</Body></Row>
          <Row style={{ justifyContent: "space-between" }}><H3>Total</H3><H3>{inr((deal || 0) * enq.quantity)}</H3></Row>
        </View>
        <Field label="Delivery address" multiline value={address} onChangeText={setAddress} placeholder="Warehouse 4, Okhla Phase II, New Delhi" />
        <View style={st.wrap}>
          {["Escrow / Cash on Delivery", "Escrow / UPI", "Escrow / Bank transfer"].map((m) => <Chip key={m} tone="blue" label={m} active={payment === m} onPress={() => setPayment(m)} />)}
        </View>
        <Muted style={{ fontSize: 12 }}>Payment is held in escrow and released to the artisan after delivery.</Muted>
        <Button variant="blue" icon="check-circle" title="Confirm Deal" loading={busy} disabled={!address.trim()} onPress={confirm} />
      </Sheet>
    </Screen>
  );
}

/* ======================= Buyer dashboard / account ======================= */
export function BuyerHomeScreen({ navigation }) {
  const { user, signOut, sessions, switchRole } = useSession("buyer");
  const { data: enquiries, loading, reload } = useBuyerEnquiries(user);
  const { data: products } = useAsync(() => api.listProducts(), []);
  if (!enquiries) return <Screen><Loading /></Screen>;
  const img = (e) => (products || []).find((p) => p.id === e.productId)?.imageUrl;
  const active = enquiries.filter((e) => ["open", "negotiating", "accepted"].includes(e.status));
  const confirmed = enquiries.filter((e) => e.status === "deal_closed");
  const toArtisan = () => (sessions.artisan ? switchRole("artisan") : navigation.navigate("Login", { role: "artisan" }));

  return (
    <Screen bg={C.bgBlue} refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
      <Row>
        <Avatar name={user.name} size={46} tone="blue" />
        <View style={{ flex: 1 }}>
          <H2>Welcome, {user.name?.split(" ")[0]}!</H2>
          <Muted numberOfLines={1}>{user.companyName} · {user.buyerType} · {user.city}</Muted>
        </View>
      </Row>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Stat value={enquiries.length} label="Enquiries" tone="blue" icon="inbox" />
        <Stat value={active.length} label="Active Chats" tone="green" icon="message-circle" />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Stat value={confirmed.length} label="Confirmed" tone="orange" icon="check-circle" />
        <Stat value={inr(confirmed.reduce((s, e) => s + (e.totalAmount || 0), 0))} label="Order value" tone="purple" icon="briefcase" />
      </View>
      <Card>
        <H3>Recent Enquiries</H3>
        {enquiries.length === 0 ? <Empty title="No enquiries yet">Find a product and request a bulk order.</Empty> : enquiries.map((e) => (
          <Pressable key={e.id} style={st.row} onPress={() => navigation.navigate("ChatDetail", { id: e.id })}>
            <ProductImage uri={img(e)} style={{ width: 46, height: 46, borderRadius: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={st.pcardTitle} numberOfLines={1}>{e.productTitle}</Text>
              <Muted numberOfLines={1}>{e.quantity} units · {timeAgo(e.createdAt)}</Muted>
            </View>
            <Badge tone={ENQUIRY_STATUS[e.status]?.tone}>{ENQUIRY_STATUS[e.status]?.label}</Badge>
          </Pressable>
        ))}
      </Card>
      <Row>
        <Button style={{ flex: 1 }} variant="outline" icon="repeat" title="Artisan view" onPress={toArtisan} />
        <Button style={{ flex: 1 }} variant="outline-red" icon="log-out" title="Logout" onPress={signOut} />
      </Row>
    </Screen>
  );
}

export function StorefrontScreen({ route, navigation }) {
  return (
    <Screen edges={["bottom"]}>
      <Storefront artisanId={route.params.id} onOpenProduct={(p) => navigation.push("ProductDetail", { id: p.id })} />
    </Screen>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  pcard: { width: "47.5%", backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: "#E3E9F2", overflow: "hidden", ...shadow },
  pcardImg: { width: "100%", aspectRatio: 1 },
  pcardTitle: { fontWeight: "700", color: C.ink, fontSize: 14 },
  price: { color: C.blue, fontWeight: "800", fontSize: 14.5 },
  priceBig: { color: C.blue, fontWeight: "800", fontSize: 24 },
  hero: { height: 210, borderRadius: 18, overflow: "hidden", padding: 18, justifyContent: "flex-end", gap: 4 },
  heroTitle: { color: C.white, fontSize: 26, fontWeight: "800", fontFamily: "serif" },
  heroSub: { color: C.white, opacity: 0.92 },
  heroSearch: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.white, borderRadius: 12, paddingLeft: 12, paddingRight: 6, marginTop: 8 },
  cat: { alignItems: "center", gap: 6, backgroundColor: C.white, borderWidth: 1, borderColor: "#E3E9F2", borderRadius: 14, paddingVertical: 12, width: 84 },
  catIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.orangeSoft, alignItems: "center", justifyContent: "center" },
  catText: { fontSize: 12, fontWeight: "700", color: C.ink },
  link: { color: C.blue, fontWeight: "700" },
  artisan: { width: 130, alignItems: "center", gap: 4, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: "#E3E9F2", padding: 12 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#DBE3EE", borderRadius: 999, paddingHorizontal: 14, backgroundColor: C.white },
  label: { fontSize: 13, fontWeight: "700", color: "#3F4A55" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pdpImg: { width: "100%", aspectRatio: 1, borderRadius: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: "#EEF2F7" },
  acceptBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.blueSoft, borderRadius: 10, padding: 10 },
  invoice: { backgroundColor: C.bg, borderRadius: 10, padding: 12, gap: 6 },
});
