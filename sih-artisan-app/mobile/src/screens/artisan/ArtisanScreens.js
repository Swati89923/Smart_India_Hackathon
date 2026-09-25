import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View, TextInput, Alert, Share } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { C, TONES, shadow } from "../../theme";
import {
  Screen, H1, H2, H3, Muted, Body, Card, Row, Button, Badge, Stat, ProductImage, Avatar, Empty, Loading, Note,
  Field, Sheet, Tabs, useAsync, useToast, OfflinePill, IconButton,
} from "../../ui";
import { useSession } from "../../session";
import { ENQUIRY_STATUS, inr, priceRange, timeAgo, craftLabel, VOICE_LANGUAGES } from "../../constants";
import * as api from "../../api";

export const needsReply = (e) =>
  (e.status === "open" || e.status === "negotiating") && e.thread?.[e.thread.length - 1]?.sender === "buyer";
export const lastOffer = (enq, sender) =>
  [...(enq?.thread || [])].reverse().find((m) => m.offerPrice != null && (!sender || m.sender === sender));

// Reload data whenever the tab comes back into focus
function useFocusReload(reload) {
  useFocusEffect(useCallback(() => { reload(); }, [reload]));
}

/* ======================= Dashboard ======================= */
export function ArtisanDashboard({ navigation }) {
  const { user } = useSession("artisan");
  const { data, loading, reload } = useAsync(
    () => Promise.all([api.listProducts({ artisanId: user.id }), api.listEnquiries({ artisanId: user.id }), api.getSettings().catch(() => null)]),
    [user.id]
  );
  useFocusReload(reload);
  if (!data) return <Screen><Loading /></Screen>;
  const [products, enquiries, settings] = data;
  const views = products.reduce((s, p) => s + (p.views || 0), 0);
  const pending = enquiries.filter(needsReply);
  const deals = enquiries.filter((e) => e.totalAmount).reduce((s, e) => s + e.totalAmount, 0);

  return (
    <Screen bg={C.bgWarm} refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
      <Row style={{ justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <H1>Welcome, {user.name?.split(" ")[0] || "Artisan"}! 👋</H1>
          <Muted>नमस्ते! Here's how your craft business is doing.</Muted>
        </View>
        <OfflinePill />
      </Row>
      {settings?.announcement ? <Note tone="orange" icon="volume-2">{settings.announcement}</Note> : null}
      {!user.craft && (
        <Pressable onPress={() => navigation.navigate("Onboarding")}>
          <Note tone="blue" icon="user-check">Complete your profile to get the Verified badge → tap here</Note>
        </Pressable>
      )}
      <View style={st.stats}>
        <Stat value={products.length} label="Products" tone="green" icon="package" />
        <Stat value={views.toLocaleString("en-IN")} label="Views" tone="blue" icon="eye" />
        <Stat value={enquiries.length} label="Enquiries" tone="orange" icon="inbox" />
        <Stat value={pending.length} label="Pending" tone="red" icon="clock" />
      </View>

      <Card>
        <H3>Quick Actions <Text style={{ fontSize: 12, color: C.muted }}>त्वरित कार्य</Text></H3>
        <View style={st.qaGrid}>
          <QA icon="plus-circle" tone="green" label="Add Product" hi="उत्पाद जोड़ें" onPress={() => navigation.navigate("AddProduct")} />
          <QA icon="message-square" tone="blue" label="Buyer Enquiries" hi="पूछताछ" onPress={() => navigation.navigate("ArtisanTabs", { screen: "Enquiries" })} />
          <QA icon="edit-3" tone="orange" label="Edit Profile" hi="प्रोफ़ाइल" onPress={() => navigation.navigate("Onboarding")} />
          <QA icon="help-circle" tone="teal" label="Help" hi="मदद" onPress={() => Alert.alert("Help / मदद", "1. Tap Add Product and take a photo.\n2. Speak about your product in Hindi or English.\n3. Check the details and price, then Publish.\n\nBuyers' enquiries appear under Enquiries.")} />
        </View>
      </Card>

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <H3>Recent Enquiries</H3>
          <Pressable onPress={() => navigation.navigate("ArtisanTabs", { screen: "Enquiries" })}><Text style={st.link}>View all</Text></Pressable>
        </Row>
        {enquiries.length === 0 ? <Empty title="No enquiries yet">Publish products to start receiving buyer enquiries.</Empty> :
          enquiries.slice(0, 3).map((e) => (
            <Pressable key={e.id} style={st.row} onPress={() => navigation.navigate("EnquiryDetail", { id: e.id })}>
              <Avatar name={e.buyerName} size={36} tone="blue" />
              <View style={{ flex: 1 }}>
                <Text style={st.rowTitle} numberOfLines={1}>{e.buyerName}</Text>
                <Muted numberOfLines={1}>{e.productTitle} · {e.quantity} units · {timeAgo(e.createdAt)}</Muted>
              </View>
              <Badge tone={needsReply(e) ? "red" : ENQUIRY_STATUS[e.status]?.tone}>{needsReply(e) ? "Reply" : ENQUIRY_STATUS[e.status]?.label}</Badge>
            </Pressable>
          ))}
      </Card>

      <Card style={{ backgroundColor: C.greenSoft, borderColor: "#C9E3D1" }}>
        <Row style={{ alignItems: "flex-start" }}>
          <Feather name="star" size={18} color={C.green} />
          <View style={{ flex: 1 }}>
            <H3>Tip: Speak naturally about your product</H3>
            <Muted>Mention the material, days of work and the tradition behind it — AI turns it into a bilingual listing. Deals so far: {inr(deals)}.</Muted>
          </View>
        </Row>
      </Card>
    </Screen>
  );
}

function QA({ icon, tone, label, hi, onPress }) {
  const t = TONES[tone];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.qa, { backgroundColor: t.bg }, pressed && { opacity: 0.8 }]}>
      <Feather name={icon} size={22} color={t.fg} />
      <Text style={{ color: t.fg, fontWeight: "700", textAlign: "center" }}>{label}</Text>
      <Text style={{ color: t.fg, fontSize: 11, opacity: 0.8 }}>{hi}</Text>
    </Pressable>
  );
}

/* ======================= My Products ======================= */
const STATUS = { published: ["Active", "green"], pending: ["Under review", "orange"], hidden: ["Hidden", "gray"] };

export function MyProductsScreen({ navigation }) {
  const { user } = useSession("artisan");
  const toast = useToast();
  const [q, setQ] = useState("");
  const { data, loading, reload, setData } = useAsync(
    () => Promise.all([api.listProducts({ artisanId: user.id }), api.listEnquiries({ artisanId: user.id })]),
    [user.id]
  );
  useFocusReload(reload);
  if (!data) return <Screen><Loading /></Screen>;
  const [products, enquiries] = data;
  const shown = products.filter((p) => [p.title, p.titleHi, p.category].some((f) => (f || "").toLowerCase().includes(q.toLowerCase())));

  const toggle = async (p) => {
    const status = p.status === "hidden" ? "published" : "hidden";
    await api.updateProduct(p.id, { status });
    setData(([ps, es]) => [ps.map((x) => (x.id === p.id ? { ...x, status } : x)), es]);
    toast(status === "hidden" ? "Hidden from marketplace" : "Product is live again");
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
      <Row style={{ justifyContent: "space-between" }}>
        <View><H2>My Products</H2><Muted>{products.length} products · मेरे उत्पाद</Muted></View>
        <Button size="sm" icon="plus" title="Add" onPress={() => navigation.navigate("AddProduct")} />
      </Row>
      <View style={st.search}>
        <Feather name="search" size={16} color={C.muted} />
        <TextInput placeholder="Search your products…" placeholderTextColor="#9CA3AF" value={q} onChangeText={setQ} style={{ flex: 1, paddingVertical: 10, color: C.ink }} />
      </View>
      {shown.length === 0 ? (
        <Card><Empty icon="package" title={products.length ? "No matches" : "No products yet"}>{!products.length ? "Tap Add to list your first product." : null}</Empty></Card>
      ) : shown.map((p) => {
        const [label, tone] = STATUS[p.status || "published"] || STATUS.published;
        const enq = enquiries.filter((e) => e.productId === p.id).length;
        return (
          <Card key={p.id} style={{ flexDirection: "row", gap: 12, padding: 12 }}>
            <ProductImage uri={p.imageUrl} style={st.thumbLg} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={st.rowTitle} numberOfLines={2}>{p.title}</Text>
              <Text style={st.price}>{priceRange(p)}</Text>
              <Muted style={{ fontSize: 12 }}>{p.views || 0} views · {enq} enquiries · {craftLabel(p.craft)}</Muted>
              <Row style={{ marginTop: 4 }}>
                <Badge tone={tone}>{label}</Badge>
                <View style={{ flex: 1 }} />
                {p.status !== "pending" && (
                  <IconButton icon={p.status === "hidden" ? "eye" : "eye-off"} label="Toggle visibility" onPress={() => toggle(p)} />
                )}
              </Row>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

/* ======================= Enquiries ======================= */
export function EnquiriesScreen({ navigation }) {
  const { user } = useSession("artisan");
  const { data: enquiries, loading, reload } = useAsync(() => api.listEnquiries({ artisanId: user.id }), [user.id]);
  useFocusReload(reload);
  if (!enquiries) return <Screen><Loading /></Screen>;
  return (
    <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
      <H2>Enquiries & Negotiation</H2>
      <Muted>{enquiries.filter(needsReply).length} waiting for your reply · पूछताछ और मोलभाव</Muted>
      {enquiries.length === 0 ? <Card><Empty title="No enquiries yet">When buyers enquire about your products they will appear here.</Empty></Card> :
        <Card style={{ padding: 6 }}>
          {enquiries.map((e) => (
            <Pressable key={e.id} style={st.row} onPress={() => navigation.navigate("EnquiryDetail", { id: e.id })}>
              <Avatar name={e.buyerName} size={40} tone="blue" />
              <View style={{ flex: 1 }}>
                <Text style={st.rowTitle} numberOfLines={1}>{e.buyerName}</Text>
                <Muted numberOfLines={1}>{e.productTitle} · {e.quantity} units</Muted>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Badge tone={needsReply(e) ? "red" : ENQUIRY_STATUS[e.status]?.tone}>{needsReply(e) ? "Reply" : ENQUIRY_STATUS[e.status]?.label}</Badge>
                <Muted style={{ fontSize: 11.5 }}>{timeAgo(e.thread?.[e.thread.length - 1]?.time || e.createdAt)}</Muted>
              </View>
            </Pressable>
          ))}
        </Card>}
    </Screen>
  );
}

/* Shared chat UI (artisan + buyer) */
export function ChatThread({ enquiry, me }) {
  return (
    <View style={st.thread}>
      {(enquiry?.thread || []).map((m) => {
        const mine = m.sender === me;
        return (
          <View key={m.id} style={[st.bubble, mine ? [st.mine, { backgroundColor: m.sender === "buyer" ? "#DFE9FB" : "#DCEFE2" }] : st.theirs]}>
            {m.offerPrice != null && <Text style={st.offerTag}>₹{Number(m.offerPrice).toLocaleString("en-IN")}/unit</Text>}
            <Text style={{ color: C.ink, fontSize: 14.5, lineHeight: 20 }}>{m.message}</Text>
            <Text style={st.bubbleMeta}>{m.sender === "buyer" ? "Buyer" : "Artisan"} · {timeAgo(m.time)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ChatComposer({ onSend, disabled, tone = "primary" }) {
  const [text, setText] = useState("");
  const [offer, setOffer] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!text.trim() && !offer) return;
    setBusy(true);
    try {
      await onSend(text.trim() || `Offer: ₹${offer} per unit`, offer ? Number(offer) : null);
      setText("");
      setOffer("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={st.composer}>
      <TextInput style={st.composerInput} placeholder={disabled ? "This conversation is closed" : "Type a message…"} placeholderTextColor="#9CA3AF"
        value={text} onChangeText={setText} editable={!disabled && !busy} multiline />
      <View style={st.offerBox}>
        <Text style={{ color: C.muted, fontWeight: "700" }}>₹</Text>
        <TextInput style={{ width: 58, paddingVertical: 8, color: C.ink }} placeholder="offer" placeholderTextColor="#9CA3AF" keyboardType="number-pad"
          value={offer} onChangeText={(v) => setOffer(v.replace(/\D/g, ""))} editable={!disabled && !busy} />
      </View>
      <Pressable onPress={send} disabled={disabled || busy} style={[st.send, { backgroundColor: tone === "blue" ? C.blue : C.green, opacity: disabled || busy ? 0.5 : 1 }]}>
        <Feather name="send" size={17} color={C.white} />
      </Pressable>
    </View>
  );
}

export function EnquiryDetailScreen({ route, navigation }) {
  const toast = useToast();
  const { data: enquiry, setData, loading } = useAsync(() => api.getEnquiry(route.params.id), [route.params.id]);
  const [suggestion, setSuggestion] = useState(null);
  const [counter, setCounter] = useState(null);
  const [busy, setBusy] = useState("");
  const closed = enquiry && ["deal_closed", "declined"].includes(enquiry.status);

  useEffect(() => {
    if (enquiry && !closed) api.suggestResponse(enquiry.id).then(setSuggestion).catch(() => {});
  }, [enquiry?.id, enquiry?.thread?.length, closed]);

  if (loading && !enquiry) return <Screen><Loading /></Screen>;
  if (!enquiry) return <Screen><Empty title="Enquiry not found" /></Screen>;
  const offer = lastOffer(enquiry, "buyer");
  const acceptPrice = offer?.offerPrice ?? enquiry.askingPrice;

  const respond = async (action, price, message) => {
    setBusy(action);
    try {
      const u = await api.respondToEnquiry(enquiry.id, action, price, message);
      if (u) setData(u);
      setCounter(null);
      toast(action === "accept" ? "Offer accepted — buyer will confirm" : action === "counter" ? "Counter-offer sent" : "Enquiry declined", action === "reject" ? "gray" : "green");
    } catch (e) {
      toast(e.message, "red");
    } finally {
      setBusy("");
    }
  };

  return (
    <Screen edges={["bottom"]}>
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <H3>{enquiry.status === "open" ? "New Enquiry" : "Enquiry"}</H3>
          <Badge tone={ENQUIRY_STATUS[enquiry.status]?.tone}>{ENQUIRY_STATUS[enquiry.status]?.label}</Badge>
        </Row>
        <View style={st.enqBox}>
          <Row style={{ alignItems: "flex-start" }}>
            <View style={st.enqIcon}><Feather name="briefcase" size={20} color={C.blue} /></View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={st.rowTitle}>{enquiry.buyerName}</Text>
              <Muted>{enquiry.buyerType} · {timeAgo(enquiry.createdAt)}</Muted>
              <Body>📦 {enquiry.productTitle}</Body>
              <Body style={{ fontWeight: "800" }}>{enquiry.quantity} units</Body>
              <Body>{enquiry.budgetMin ? `${inr(enquiry.budgetMin)} – ${inr(enquiry.budgetMax)} per unit` : offer ? `Offer ${inr(offer.offerPrice)} per unit` : `Your price ${inr(enquiry.askingPrice)}`}</Body>
              {enquiry.requiredBy ? <Body>📅 Required by {new Date(enquiry.requiredBy).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Body> : null}
            </View>
          </Row>
        </View>
        {enquiry.status === "deal_closed" && <Note icon="check-circle">Deal closed at {inr(enquiry.finalPrice)}/unit · Total {inr(enquiry.totalAmount)}</Note>}
        {!closed && (
          <View style={{ gap: 8 }}>
            <Button icon="check" title={`Accept ${inr(acceptPrice)}`} loading={busy === "accept"} onPress={() => respond("accept", acceptPrice)} />
            <Row>
              <Button style={{ flex: 1 }} variant="outline-blue" icon="repeat" title="Counter Offer" onPress={() => setCounter({ price: String(suggestion?.suggestedPrice || enquiry.askingPrice), message: "" })} />
              <Button style={{ flex: 1 }} variant="outline-red" icon="x" title="Reject" loading={busy === "reject"}
                onPress={() => Alert.alert("Decline enquiry?", "The buyer will be told you declined.", [{ text: "Cancel", style: "cancel" }, { text: "Decline", style: "destructive", onPress: () => respond("reject") }])} />
            </Row>
          </View>
        )}
      </Card>

      {!closed && suggestion && suggestion.action !== "none" && (
        <Card style={{ backgroundColor: "#FFFAF3", borderColor: "#F3DCC0" }}>
          <Row style={{ alignItems: "flex-start" }}>
            <Feather name="star" size={18} color={C.orange} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={st.rowTitle}>AI Copilot suggests: {suggestion.action === "accept" ? "Accept" : `Counter at ${inr(suggestion.suggestedPrice)}`}</Text>
              <Muted>{suggestion.note}</Muted>
              <Muted style={{ fontSize: 12 }}>Only a suggestion — nothing is sent until you choose.</Muted>
            </View>
          </Row>
          <Button size="sm" variant="outline" title="Use suggestion"
            onPress={() => (suggestion.action === "accept" ? respond("accept", suggestion.suggestedPrice) : setCounter({ price: String(suggestion.suggestedPrice), message: "" }))} />
        </Card>
      )}

      <Card>
        <H3>💬 Chat with Buyer</H3>
        <ChatThread enquiry={enquiry} me="artisan" />
        <ChatComposer disabled={closed} onSend={async (m, o) => { const u = await api.sendMessage(enquiry.id, "artisan", m, o); if (u) setData(u); }} />
      </Card>

      <Sheet open={!!counter} onClose={() => setCounter(null)} title="Send Counter Offer">
        {counter && (
          <>
            <Muted>Buyer offered {offer ? inr(offer.offerPrice) : "—"} · your listed price {inr(enquiry.askingPrice)}</Muted>
            <Field label="Your price per unit (₹)" keyboardType="number-pad" value={counter.price} onChangeText={(v) => setCounter({ ...counter, price: v.replace(/\D/g, "") })} />
            <Field label="Message (optional)" multiline value={counter.message} onChangeText={(v) => setCounter({ ...counter, message: v })}
              placeholder={`We can do ₹${counter.price} per unit for ${enquiry.quantity} units.`} />
            <Body>Order value: <Text style={{ fontWeight: "800" }}>{inr(Number(counter.price) * enquiry.quantity)}</Text></Body>
            <Button variant="blue" title="Send Counter Offer" loading={busy === "counter"} disabled={!Number(counter.price)}
              onPress={() => respond("counter", Number(counter.price), counter.message || undefined)} />
          </>
        )}
      </Sheet>
    </Screen>
  );
}

/* ======================= Storefront / Profile ======================= */
const COVER = {
  pottery: "photo-1493106641515-6b5631de4bb9", weaving: "photo-1594040226829-7f251ab46d80",
  painting: "photo-1513519245088-0e12902e5a38", jewelry: "photo-1601121141461-9d6647bca1ed",
  woodwork: "photo-1611486212557-88be5ff6f941", embroidery: "photo-1616627561950-9f746e330187",
};

export function Storefront({ artisanId, owner, onOpenProduct, header }) {
  const [tab, setTab] = useState("products");
  const { data, loading, reload } = useAsync(
    () => Promise.all([api.getArtisan(artisanId), api.listProducts({ artisanId }), api.listEnquiries({ artisanId })]),
    [artisanId]
  );
  if (loading && !data) return <Loading />;
  if (!data) return <Empty title="Artisan not found" />;
  const [artisan, all, enquiries] = data;
  const products = owner ? all : all.filter((p) => (p.status || "published") === "published");
  const deals = enquiries.filter((e) => e.status === "deal_closed");
  const lang = VOICE_LANGUAGES.find((l) => l.code.startsWith(artisan.language || "hi"))?.label;

  return (
    <View style={{ gap: 12 }}>
      <View>
        <ProductImage uri={`https://images.unsplash.com/${COVER[artisan.craft] || COVER.pottery}?w=900&auto=format&fit=crop&q=70`} style={st.cover} />
        <View style={st.storeHead}>
          <View style={st.avatarRing}><Avatar name={artisan.name} size={76} /></View>
          <View style={{ flex: 1, paddingTop: 30 }}>
            <Row gap={6}><H2>{artisan.name}</H2>{artisan.kycVerified && <Feather name="check-circle" size={18} color={C.green} />}</Row>
            <Muted>📍 {artisan.location || "India"}</Muted>
            <Text style={{ color: C.orange, fontWeight: "700" }}>Traditional {craftLabel(artisan.craft)} Artisan</Text>
          </View>
        </View>
      </View>
      {header}
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: "products", label: `Products (${products.length})` },
        { value: "about", label: "About" },
        { value: "orders", label: `Orders (${deals.length})` },
      ]} />
      {tab === "products" && (products.length === 0 ? <Empty icon="package" title="No products yet" /> : (
        <View style={st.grid}>
          {products.map((p) => (
            <Pressable key={p.id} style={st.pcard} onPress={() => onOpenProduct?.(p)}>
              <ProductImage uri={p.imageUrl} style={st.pcardImg} />
              <View style={{ padding: 10, gap: 2 }}>
                <Text style={st.pcardTitle} numberOfLines={2}>{p.title}</Text>
                <Text style={st.price}>{priceRange(p)}</Text>
                {owner && p.status !== "published" ? <Badge tone="orange">{p.status}</Badge> : null}
              </View>
            </Pressable>
          ))}
        </View>
      ))}
      {tab === "about" && (
        <Card>
          <Body>{artisan.bio || `${artisan.name} is a traditional ${craftLabel(artisan.craft).toLowerCase()} artisan from ${artisan.location || "India"}.`}</Body>
          <Body>🎨 Craft: <Text style={{ fontWeight: "700" }}>{craftLabel(artisan.craft)}</Text></Body>
          <Body>🪪 Pehchan ID: <Text style={{ fontWeight: "700" }}>{artisan.pehchanId || "Not linked"}</Text></Body>
          <Body>🗣️ Speaks: <Text style={{ fontWeight: "700" }}>{lang || "Hindi"}</Text></Body>
          <Body>🤝 Completed orders: <Text style={{ fontWeight: "700" }}>{deals.length}</Text></Body>
        </Card>
      )}
      {tab === "orders" && (deals.length === 0 ? <Empty icon="briefcase" title="No completed orders yet" /> : (
        <Card style={{ padding: 6 }}>
          {deals.map((d) => (
            <View key={d.id} style={st.row}>
              <Avatar name={d.buyerName} size={36} tone="blue" />
              <View style={{ flex: 1 }}>
                <Text style={st.rowTitle} numberOfLines={1}>{d.buyerName}</Text>
                <Muted numberOfLines={1}>{d.quantity} × {d.productTitle} at {inr(d.finalPrice)}</Muted>
              </View>
              <Badge tone="green">Confirmed</Badge>
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

export function ArtisanProfileScreen({ navigation }) {
  const { user, signOut, sessions, switchRole } = useSession("artisan");
  const share = () => Share.share({ message: `Shop handmade crafts by ${user.name} on ShilpSaathi (artisan id: ${user.id})` }).catch(() => {});
  const toBuyer = () => (sessions.buyer ? switchRole("buyer") : navigation.navigate("Login", { role: "buyer" }));
  return (
    <Screen padded={false}>
      <View style={{ padding: 16 }}>
        <Storefront artisanId={user.id} owner
          onOpenProduct={(p) => navigation.navigate("ProductDetail", { id: p.id })}
          header={
            <View style={{ gap: 8 }}>
              <Row>
                <Button style={{ flex: 1 }} size="sm" variant="outline" icon="share-2" title="Share shop" onPress={share} />
                <Button style={{ flex: 1 }} size="sm" icon="edit-3" title="Edit Profile" onPress={() => navigation.navigate("Onboarding")} />
              </Row>
              <Row>
                <Button style={{ flex: 1 }} size="sm" variant="outline-blue" icon="repeat" title="Buyer view" onPress={toBuyer} />
                <Button style={{ flex: 1 }} size="sm" variant="outline-red" icon="log-out" title="Logout" onPress={signOut} />
              </Row>
            </View>
          } />
      </View>
    </Screen>
  );
}

export const st = StyleSheet.create({
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  qaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  qa: { width: "47.5%", alignItems: "center", gap: 3, paddingVertical: 14, borderRadius: 12 },
  link: { color: C.blue, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: "#F1EDE6" },
  rowTitle: { fontWeight: "700", fontSize: 15, color: C.ink },
  price: { color: C.green, fontWeight: "800", fontSize: 15 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: C.borderStrong, borderRadius: 10, paddingHorizontal: 12, backgroundColor: C.white },
  thumbLg: { width: 84, height: 84, borderRadius: 10 },
  enqBox: { backgroundColor: "#F8F9FB", borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 12, padding: 12 },
  enqIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.blueSoft, alignItems: "center", justifyContent: "center" },
  thread: { gap: 10, padding: 10, backgroundColor: "#F7F5F1", borderRadius: 12 },
  bubble: { maxWidth: "85%", padding: 10, borderRadius: 14, gap: 3 },
  mine: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  theirs: { alignSelf: "flex-start", backgroundColor: C.white, borderBottomLeftRadius: 4 },
  bubbleMeta: { fontSize: 11, color: C.muted },
  offerTag: { alignSelf: "flex-start", fontSize: 11.5, fontWeight: "800", color: C.greenDark, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: "hidden" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  composerInput: { flex: 1, borderWidth: 1, borderColor: C.borderStrong, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, maxHeight: 100, color: C.ink, backgroundColor: C.white },
  offerBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.borderStrong, borderRadius: 20, paddingLeft: 10, backgroundColor: C.white },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  cover: { width: "100%", height: 150, borderRadius: 16 },
  storeHead: { flexDirection: "row", gap: 12, paddingHorizontal: 8, marginTop: -38 },
  avatarRing: { borderWidth: 4, borderColor: C.white, borderRadius: 50, ...shadow },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  pcard: { width: "47.5%", backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: "hidden", ...shadow },
  pcardImg: { width: "100%", aspectRatio: 1 },
  pcardTitle: { fontWeight: "700", color: C.ink, fontSize: 14 },
});
