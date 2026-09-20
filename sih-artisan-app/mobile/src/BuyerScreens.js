import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, StyleSheet, ActivityIndicator, Modal, Alert
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS as C, CRAFTS } from "./theme";
import * as api from "./api";

/* ------------------------------------------------------------------
   ShilpSaathi Buyer Side (खरीदार बाज़ार व मोलभाव)
   Supports product discovery, instant buying, and 2-way AI negotiation.
-------------------------------------------------------------------*/

function Badge({ children, tone = "indigo" }) {
  const map = {
    indigo: { bg: "#EAF0F5", fg: C.indigo },
    terracotta: { bg: "#F6E6DE", fg: C.terracottaDeep },
    leaf: { bg: "#E7F0E8", fg: C.leaf },
    turmeric: { bg: "#FBF0DA", fg: "#8A5F16" },
  };
  const t = map[tone] || map.indigo;
  return (
    <View style={{ backgroundColor: t.bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ color: t.fg, fontSize: 11.5, fontWeight: "700" }}>{children}</Text>
    </View>
  );
}

export function RoleSwitcher({ currentRole, onSwitchRole, artisanName = "Radha Devi", buyerName = "Rajiv Sharma" }) {
  return (
    <View style={bStyles.roleSwitcherWrap}>
      <View style={bStyles.roleSwitcherInner}>
        <TouchableOpacity
          onPress={() => onSwitchRole("artisan")}
          style={[bStyles.roleTab, currentRole === "artisan" && bStyles.roleTabActive]}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="palette"
            size={16}
            color={currentRole === "artisan" ? "#fff" : C.inkSoft}
          />
          <Text style={[bStyles.roleTabText, currentRole === "artisan" && bStyles.roleTabTextActive]}>
            कारीगर (Artisan)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSwitchRole("buyer")}
          style={[bStyles.roleTab, currentRole === "buyer" && bStyles.roleTabActive]}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="shopping"
            size={16}
            color={currentRole === "buyer" ? "#fff" : "#5B5648"}
          />
          <Text style={[bStyles.roleTabText, currentRole === "buyer" && bStyles.roleTabTextActive]}>
            खरीदार (Buyer Market)
          </Text>
        </TouchableOpacity>
      </View>
      <View style={bStyles.activeUserIndicator}>
        <Text style={bStyles.activeUserText}>
          {currentRole === "artisan"
            ? `🎨 Logged in as Artisan: ${artisanName}`
            : `🛍️ Logged in as Buyer: ${buyerName}`}
        </Text>
      </View>
    </View>
  );
}

/* --------------------------- Buyer Marketplace Screen --------------------------- */

export function BuyerMarketScreen({
  products = [],
  onSelectProduct,
  searchQuery,
  setSearchQuery,
  selectedCraft,
  setSelectedCraft,
  onRefresh,
}) {
  const craftList = [{ key: "all", en: "All Crafts", hi: "सभी हस्तशिल्प", icon: "view-grid" }, ...CRAFTS];

  const filtered = products.filter((p) => {
    const matchesCraft = !selectedCraft || selectedCraft === "all" || p.craft === selectedCraft;
    const s = (searchQuery || "").toLowerCase();
    const matchesSearch =
      !s ||
      p.title?.toLowerCase().includes(s) ||
      p.titleHi?.includes(s) ||
      p.category?.toLowerCase().includes(s) ||
      p.artisanName?.toLowerCase().includes(s) ||
      p.artisanLocation?.toLowerCase().includes(s);
    return matchesCraft && matchesSearch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Search Header */}
      <View style={bStyles.searchHeader}>
        <View style={bStyles.searchBar}>
          <Feather name="search" size={18} color={C.inkSoft} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search pottery, silk dupatta, artisan, city..."
            placeholderTextColor="#8C8472"
            style={{ flex: 1, fontSize: 14, color: C.ink }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={16} color={C.inkSoft} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Craft filter horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
        >
          {craftList.map((c) => {
            const isSelected = (selectedCraft || "all") === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setSelectedCraft(c.key)}
                style={[bStyles.craftChip, isSelected && bStyles.craftChipActive]}
              >
                <MaterialCommunityIcons
                  name={c.icon || "hand-heart"}
                  size={14}
                  color={isSelected ? "#fff" : C.indigo}
                />
                <Text style={[bStyles.craftChipText, isSelected && bStyles.craftChipTextActive]}>
                  {c.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: C.ink }}>
            Authentic Artisan Crafts · {filtered.length} Items
          </Text>
          <TouchableOpacity onPress={onRefresh} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name="refresh-cw" size={13} color={C.indigo} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: C.indigo }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <View style={bStyles.emptyBox}>
            <MaterialCommunityIcons name="basket-off-outline" size={44} color={C.border} />
            <Text style={{ fontSize: 15, fontWeight: "700", color: C.ink, marginTop: 8 }}>No crafts match your filter</Text>
            <Text style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>Try clearing the search query or selecting 'All Crafts'</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => onSelectProduct(item)}
              style={bStyles.productCard}
            >
              <Image source={{ uri: item.imageUrl }} style={bStyles.productImage} />
              <View style={bStyles.productInfo}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Badge tone="indigo">{item.category || "Handicraft"}</Badge>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={bStyles.priceLabel}>₹{item.price}</Text>
                    <Text style={{ fontSize: 11, color: C.inkSoft }}>per piece</Text>
                  </View>
                </View>

                <Text style={bStyles.productTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.titleHi ? (
                  <Text style={bStyles.productTitleHi} numberOfLines={1}>
                    {item.titleHi}
                  </Text>
                ) : null}

                {/* Artisan Verification pill */}
                <View style={bStyles.artisanTag}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color="#4C7A57" />
                  <Text style={bStyles.artisanName}>
                    {item.artisanName || "Master Artisan"}
                  </Text>
                  <Text style={bStyles.artisanCity}>· {item.artisanLocation || "India"}</Text>
                </View>

                {/* Action buttons preview */}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <View style={[bStyles.miniBtn, { backgroundColor: "#F6E6DE" }]}>
                    <Feather name="message-square" size={12} color={C.terracottaDeep} />
                    <Text style={{ fontSize: 11.5, fontWeight: "700", color: C.terracottaDeep }}>
                      Make Offer / Negotiate
                    </Text>
                  </View>
                  <View style={[bStyles.miniBtn, { backgroundColor: "#EAF0F5" }]}>
                    <Feather name="shopping-bag" size={12} color={C.indigo} />
                    <Text style={{ fontSize: 11.5, fontWeight: "700", color: C.indigo }}>
                      Instant Buy
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* --------------------------- Product Detail & Negotiation Modal --------------------------- */

export function BuyerProductModal({
  product,
  buyer,
  visible,
  onClose,
  onOrderPlaced,
  onEnquiryCreated,
}) {
  if (!product) return null;

  const [activeMode, setActiveMode] = useState("negotiate"); // 'negotiate' | 'buy'
  const [quantity, setQuantity] = useState("25");
  const [offerPrice, setOfferPrice] = useState(String(Math.round(product.price * 0.85 / 5) * 5));
  const [note, setNote] = useState("");
  const [address, setAddress] = useState("Flat 402, Green Park Avenue, New Delhi - 110016");
  const [busy, setBusy] = useState(false);

  const numQty = Math.max(1, Number(quantity) || 1);
  const numOffer = Number(offerPrice) || product.price;
  const askingTotal = product.price * numQty;
  const offerTotal = numOffer * numQty;
  const discountPercent = Math.round(((product.price - numOffer) / product.price) * 100);

  // Submit Bulk Offer (Negotiation)
  const handleSendOffer = async () => {
    setBusy(true);
    const payload = {
      productId: product.id,
      artisanId: product.artisanId,
      buyerId: buyer?.id || "buyer-demo-001",
      buyerName: buyer?.name ? `${buyer.name} (${buyer.companyName || buyer.buyerType})` : "Rajiv Sharma (Rathi Exports)",
      buyerType: buyer?.buyerType || "Exporter",
      buyerPhone: buyer?.phone || "9123456780",
      productTitle: product.title,
      quantity: numQty,
      askingPrice: product.price,
      initialOfferPrice: numOffer,
      initialMessage: note || `Interested in bulk order of ${numQty} pieces. Proposing offer of ₹${numOffer}/piece.`,
    };

    const res = await api.createBuyerEnquiry(payload);
    setBusy(false);
    onClose();
    if (onEnquiryCreated) onEnquiryCreated(res);
  };

  // Instant Purchase at Listed Price
  const handleInstantBuy = async () => {
    setBusy(true);
    const payload = {
      productId: product.id,
      artisanId: product.artisanId,
      buyerId: buyer?.id || "buyer-demo-001",
      buyerName: buyer?.name ? `${buyer.name} (${buyer.companyName || buyer.buyerType})` : "Rajiv Sharma (Rathi Exports)",
      buyerType: buyer?.buyerType || "Retailer",
      buyerPhone: buyer?.phone || "9123456780",
      productTitle: product.title,
      quantity: numQty,
      askingPrice: product.price,
      initialOfferPrice: product.price,
      initialMessage: `⚡ Instant Order placed for ${numQty} units at listed price ₹${product.price}/piece (Total: ₹${product.price * numQty}). Delivery to: ${address}`,
    };

    const enquiry = await api.createBuyerEnquiry(payload);
    // Mark as deal closed
    const finalized = await api.confirmDeal(enquiry.id, {
      finalPrice: product.price,
      address,
      paymentMode: "Secured Escrow / UPI",
    });

    setBusy(false);
    onClose();
    if (onOrderPlaced) onOrderPlaced(finalized || enquiry);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={bStyles.modalOverlay}>
        <View style={bStyles.modalSheet}>
          {/* Header */}
          <View style={bStyles.modalHeader}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: C.ink }}>Craft Details & Order</Text>
              <Text style={{ fontSize: 12, color: C.inkSoft }}>Direct Artisan Trade · Pehchan Verified</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={bStyles.closeBtn}>
              <Feather name="x" size={18} color={C.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: product.imageUrl }} style={bStyles.detailImage} />

            {/* Title & Craft details */}
            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Badge tone="turmeric">{product.category || "Handicraft"}</Badge>
                <Text style={{ fontSize: 20, fontWeight: "800", color: C.terracottaDeep }}>
                  ₹{product.price} <Text style={{ fontSize: 13, fontWeight: "500", color: C.inkSoft }}>/ piece</Text>
                </Text>
              </View>

              <Text style={{ fontSize: 18, fontWeight: "700", color: C.ink, marginTop: 8 }}>{product.title}</Text>
              {product.titleHi ? (
                <Text style={{ fontSize: 14, color: C.inkSoft, marginTop: 2 }}>{product.titleHi}</Text>
              ) : null}

              {/* Artisan Credential Box */}
              <View style={bStyles.artisanBadgeBox}>
                <View style={bStyles.artisanAvatar}>
                  <MaterialCommunityIcons name="account-star" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: "700", color: C.ink }}>
                    Crafted by {product.artisanName || "Radha Devi"}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: C.leaf, fontWeight: "600" }}>
                    ✓ Pehchan ID: {product.pehchanId || "PEHCHAN-UP-88213"} · {product.artisanLocation || "Khurja, UP"}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={{ fontSize: 13, color: C.ink, lineHeight: 19, marginTop: 10 }}>
                {product.description}
              </Text>
              {product.descriptionHi ? (
                <Text style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic", marginTop: 4 }}>
                  "{product.descriptionHi}"
                </Text>
              ) : null}
            </View>

            {/* Action Mode Toggle */}
            <View style={bStyles.actionToggle}>
              <TouchableOpacity
                onPress={() => setActiveMode("negotiate")}
                style={[bStyles.actionToggleBtn, activeMode === "negotiate" && bStyles.actionToggleBtnActive]}
              >
                <Feather name="message-circle" size={15} color={activeMode === "negotiate" ? "#fff" : C.inkSoft} />
                <Text style={[bStyles.actionToggleText, activeMode === "negotiate" && bStyles.actionToggleTextActive]}>
                  Make Bulk Offer / Negotiate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveMode("buy")}
                style={[bStyles.actionToggleBtn, activeMode === "buy" && bStyles.actionToggleBtnActive]}
              >
                <Feather name="zap" size={15} color={activeMode === "buy" ? "#fff" : C.inkSoft} />
                <Text style={[bStyles.actionToggleText, activeMode === "buy" && bStyles.actionToggleTextActive]}>
                  Instant Buy
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mode 1: Negotiation Form */}
            {activeMode === "negotiate" ? (
              <View style={bStyles.formCard}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: C.indigo, marginBottom: 10 }}>
                  🤝 Propose Wholesale Price to Artisan
                </Text>

                <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={bStyles.formLabel}>Order Qty (मात्रा)</Text>
                    <TextInput
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="number-pad"
                      style={bStyles.formInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={bStyles.formLabel}>Offer Price / pc (₹)</Text>
                    <TextInput
                      value={offerPrice}
                      onChangeText={setOfferPrice}
                      keyboardType="number-pad"
                      style={bStyles.formInput}
                    />
                  </View>
                </View>

                {/* Calculation breakdown */}
                <View style={bStyles.calcBox}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: C.inkSoft }}>Listed Total ({numQty} pcs @ ₹{product.price}):</Text>
                    <Text style={{ fontSize: 12, color: C.inkSoft, textDecorationLine: "line-through" }}>₹{askingTotal}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: C.ink }}>Your Proposed Total:</Text>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: C.terracottaDeep }}>
                      ₹{offerTotal} {discountPercent > 0 ? `(-${discountPercent}%)` : ""}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: C.leaf, marginTop: 4 }}>
                    💡 AI note: Offers within 10-15% of asking price have a 92% artisan acceptance rate.
                  </Text>
                </View>

                {/* Optional Message */}
                <Text style={[bStyles.formLabel, { marginTop: 10 }]}>Note / Requirement for Artisan (वैकल्पिक)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="e.g. Need by next month for Diwali packaging; customized logo box needed."
                  placeholderTextColor="#8C8472"
                  multiline
                  style={[bStyles.formInput, { height: 60, textAlignVertical: "top" }]}
                />

                <TouchableOpacity
                  onPress={handleSendOffer}
                  disabled={busy}
                  style={bStyles.submitOfferBtn}
                  activeOpacity={0.85}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="send" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14.5 }}>
                        Send Offer to Artisan (प्रस्ताव भेजें)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Mode 2: Instant Buy Form */
              <View style={bStyles.formCard}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: C.leaf, marginBottom: 10 }}>
                  ⚡ Direct Order at Listed Price
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Text style={bStyles.formLabel}>Quantity:</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setQuantity(String(Math.max(1, numQty - 1)))}
                      style={bStyles.qtyBtn}
                    >
                      <Feather name="minus" size={14} color={C.ink} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: C.ink }}>{numQty}</Text>
                    <TouchableOpacity
                      onPress={() => setQuantity(String(numQty + 1))}
                      style={bStyles.qtyBtn}
                    >
                      <Feather name="plus" size={14} color={C.ink} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: C.terracottaDeep }}>
                      Total: ₹{product.price * numQty}
                    </Text>
                  </View>
                </View>

                <Text style={bStyles.formLabel}>Shipping Address (डिलीवरी पता)</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter full delivery address"
                  multiline
                  style={[bStyles.formInput, { height: 60, textAlignVertical: "top" }]}
                />

                <TouchableOpacity
                  onPress={handleInstantBuy}
                  disabled={busy}
                  style={[bStyles.submitOfferBtn, { backgroundColor: C.leaf }]}
                  activeOpacity={0.85}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14.5 }}>
                        Confirm & Place Order (₹{product.price * numQty})
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* --------------------------- Buyer Enquiries & Orders Screen --------------------------- */

export function BuyerEnquiriesScreen({ enquiries = [], onSelectEnquiry, onRefresh }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={{ padding: 16, paddingBottom: 6 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: C.ink }}>My Enquiries & Orders</Text>
            <Text style={{ fontSize: 12.5, color: C.inkSoft }}>मेरे ऑर्डर्स और कारीगरों से बातचीत</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name="refresh-cw" size={13} color={C.indigo} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: C.indigo }}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 40 }}>
        {enquiries.length === 0 ? (
          <View style={bStyles.emptyBox}>
            <MaterialCommunityIcons name="chat-outline" size={44} color={C.border} />
            <Text style={{ fontSize: 15, fontWeight: "700", color: C.ink, marginTop: 8 }}>
              No enquiries or orders yet
            </Text>
            <Text style={{ fontSize: 13, color: C.inkSoft, marginTop: 4, textAlign: "center" }}>
              Explore the crafts market and propose wholesale offers to artisans directly.
            </Text>
          </View>
        ) : (
          enquiries.map((e) => {
            const lastMessage = e.thread ? e.thread[e.thread.length - 1] : null;
            const statusTone =
              e.status === "deal_closed" ? "leaf" : e.status === "negotiating" ? "turmeric" : "indigo";
            const statusLabel =
              e.status === "deal_closed"
                ? "🤝 Deal Confirmed"
                : e.status === "negotiating"
                ? "💬 In Negotiation"
                : "📩 Enquiry Sent";

            return (
              <TouchableOpacity
                key={e.id}
                onPress={() => onSelectEnquiry(e)}
                style={bStyles.enquiryCard}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: C.ink, flex: 1, marginRight: 8 }}>
                    {e.productTitle}
                  </Text>
                  <Badge tone={statusTone}>{statusLabel}</Badge>
                </View>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                  <Badge tone="indigo">Qty: {e.quantity} pcs</Badge>
                  <Badge tone="terracotta">Asking: ₹{e.askingPrice}</Badge>
                  {lastMessage?.offerPrice != null && (
                    <Badge tone="turmeric">Latest: ₹{lastMessage.offerPrice}</Badge>
                  )}
                </View>

                {lastMessage ? (
                  <View style={bStyles.latestMsgBox}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: C.inkSoft }}>
                      {lastMessage.sender === "artisan" ? "🎨 Artisan replied:" : "🛍️ You sent:"}
                    </Text>
                    <Text style={{ fontSize: 12.5, color: C.ink, marginTop: 2 }} numberOfLines={2}>
                      {lastMessage.message}
                    </Text>
                  </View>
                ) : null}

                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
                  <Text style={{ fontSize: 12.5, fontWeight: "700", color: C.indigo }}>
                    Open Discussion →
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

/* --------------------------- Buyer Negotiation Chat Screen --------------------------- */

export function BuyerNegotiationScreen({ enquiry, buyer, onBack, onUpdated }) {
  const [thread, setThread] = useState(enquiry.thread || []);
  const [counterPrice, setCounterPrice] = useState("");
  const [customMsg, setCustomMsg] = useState("");
  const [status, setStatus] = useState(enquiry.status);
  const [busy, setBusy] = useState(false);

  // Find the last offer in thread
  const lastArtisanMsg = [...thread].reverse().find((m) => m.sender === "artisan" && m.offerPrice != null);
  const artisanCounterPrice = lastArtisanMsg?.offerPrice;

  // Buyer accepts artisan's counter offer
  const handleAcceptCounter = async () => {
    setBusy(true);
    const finalPrice = artisanCounterPrice || enquiry.askingPrice;
    const res = await api.confirmDeal(enquiry.id, {
      finalPrice,
      address: "Registered Buyer Delivery Address",
      paymentMode: "Secured Escrow / UPI",
    });

    setStatus("deal_closed");
    if (res?.thread) {
      setThread(res.thread);
      onUpdated(res);
    } else {
      const entry = {
        id: `msg-${Date.now()}`,
        sender: "buyer",
        message: `🤝 Deal Confirmed! Accepted artisan counter-offer of ₹${finalPrice}/piece for ${enquiry.quantity} items (Total: ₹${finalPrice * enquiry.quantity}).`,
        offerPrice: finalPrice,
        time: new Date().toISOString(),
      };
      const updated = { ...enquiry, thread: [...thread, entry], status: "deal_closed" };
      setThread(updated.thread);
      onUpdated(updated);
    }
    setBusy(false);
  };

  // Buyer sends a new counter offer
  const handleSendCounter = async () => {
    if (!counterPrice) return;
    setBusy(true);
    const price = Number(counterPrice);
    const message = customMsg || `Proposing counter-offer of ₹${price}/piece for ${enquiry.quantity} pieces.`;
    const res = await api.sendNegotiationMessage(enquiry.id, "buyer", message, price);

    const entry = {
      id: `msg-${Date.now()}`,
      sender: "buyer",
      message,
      offerPrice: price,
      time: new Date().toISOString(),
    };
    const updated = { ...enquiry, thread: [...thread, entry], status: "negotiating" };
    setThread(updated.thread);
    onUpdated(updated);
    setCounterPrice("");
    setCustomMsg("");
    setBusy(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Header */}
      <View style={bStyles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={bStyles.backBtn}>
          <Feather name="arrow-left" size={16} color={C.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: C.ink }}>{enquiry.productTitle}</Text>
          <Text style={{ fontSize: 12, color: C.leaf, fontWeight: "600" }}>
            Direct with Artisan · Qty: {enquiry.quantity} pcs
          </Text>
        </View>
        <Badge tone={status === "deal_closed" ? "leaf" : "turmeric"}>
          {status === "deal_closed" ? "Deal Confirmed" : "Negotiating"}
        </Badge>
      </View>

      {/* Messages Timeline */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10 }}>
        {/* Deal Closed celebration card */}
        {status === "deal_closed" && (
          <View style={bStyles.dealClosedBox}>
            <MaterialCommunityIcons name="check-decagram" size={26} color={C.leaf} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: C.leaf }}>
                Deal Successfully Confirmed! 🎉
              </Text>
              <Text style={{ fontSize: 12.5, color: C.ink, marginTop: 2 }}>
                The artisan has agreed. Order is scheduled for dispatch.
              </Text>
            </View>
          </View>
        )}

        {thread.map((m) => {
          const isBuyer = m.sender === "buyer";
          return (
            <View
              key={m.id}
              style={[
                bStyles.chatBubble,
                isBuyer ? bStyles.chatBubbleBuyer : bStyles.chatBubbleArtisan,
              ]}
            >
              <Text style={bStyles.chatSenderLabel}>
                {isBuyer ? "🛍️ You (Buyer)" : "🎨 Artisan"}
              </Text>
              <Text style={[bStyles.chatText, isBuyer && { color: "#fff" }]}>
                {m.message}
              </Text>
              {m.offerPrice != null && (
                <View style={[bStyles.offerChip, isBuyer && { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <Text style={[bStyles.offerChipText, isBuyer && { color: "#fff" }]}>
                    Proposed Price: ₹{m.offerPrice} / pc (Total: ₹{m.offerPrice * enquiry.quantity})
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Action Prompt if artisan countered */}
        {status !== "deal_closed" && artisanCounterPrice && (
          <View style={bStyles.counterPromptBox}>
            <MaterialCommunityIcons name="handshake" size={20} color={C.terracottaDeep} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 13.5, fontWeight: "700", color: C.ink }}>
                Artisan countered at ₹{artisanCounterPrice}/piece
              </Text>
              <Text style={{ fontSize: 12, color: C.inkSoft }}>
                Accept to finalize order, or send a revised counter-offer below.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleAcceptCounter}
              disabled={busy}
              style={bStyles.acceptBtn}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12.5 }}>Accept Deal</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Counter bar for buyer (if deal not closed) */}
      {status !== "deal_closed" && (
        <View style={bStyles.negotiateBar}>
          <Text style={bStyles.smallLabel}>Propose Counter Offer (₹ / pc) · नया ऑफर</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput
              value={counterPrice}
              onChangeText={setCounterPrice}
              placeholder="e.g. 560"
              keyboardType="number-pad"
              style={[bStyles.formInput, { flex: 1, height: 44 }]}
            />
            <TouchableOpacity
              onPress={handleSendCounter}
              disabled={!counterPrice || busy}
              style={[bStyles.sendBtn, (!counterPrice || busy) && { opacity: 0.5 }]}
            >
              <Feather name="send" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={{ color: "#fff", fontWeight: "700" }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

/* --------------------------- Buyer Profile Screen --------------------------- */

export function BuyerProfileScreen({ buyer, onLogout, onSwitchToArtisan }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 20 }}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View style={[bStyles.avatarBig, { backgroundColor: C.indigo }]}>
          <MaterialCommunityIcons name="domain" size={36} color="#fff" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: C.ink, marginTop: 10 }}>
          {buyer?.name || "Rajiv Sharma"}
        </Text>
        <Text style={{ fontSize: 13, color: C.inkSoft }}>{buyer?.companyName || "Rathi Exports Pvt Ltd"}</Text>
        <View style={{ marginTop: 8 }}>
          <Badge tone="indigo">{buyer?.buyerType || "Exporter"} · {buyer?.city || "New Delhi"}</Badge>
        </View>
      </View>

      {/* Trust & Verified Badge */}
      <View style={bStyles.trustCard}>
        <MaterialCommunityIcons name="shield-check" size={24} color={C.leaf} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: C.ink }}>
            Verified Enterprise Buyer · Pehchan Network
          </Text>
          <Text style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
            Empowering rural master artisans through ethical direct trade and zero-intermediary supply chains.
          </Text>
        </View>
      </View>

      {/* Account Info list */}
      <View style={bStyles.profileInfoCard}>
        <View style={bStyles.profileRow}>
          <Text style={bStyles.profileRowLabel}>Mobile Number</Text>
          <Text style={bStyles.profileRowVal}>+91 {buyer?.phone || "9123456780"}</Text>
        </View>
        <View style={bStyles.profileRow}>
          <Text style={bStyles.profileRowLabel}>Business Type</Text>
          <Text style={bStyles.profileRowVal}>{buyer?.buyerType || "Exporter"}</Text>
        </View>
        <View style={bStyles.profileRow}>
          <Text style={bStyles.profileRowLabel}>Operating Location</Text>
          <Text style={bStyles.profileRowVal}>{buyer?.city || "New Delhi"}, India</Text>
        </View>
        <View style={[bStyles.profileRow, { borderBottomWidth: 0 }]}>
          <Text style={bStyles.profileRowLabel}>Payment Security</Text>
          <Text style={[bStyles.profileRowVal, { color: C.leaf }]}>Escrow Protection Active</Text>
        </View>
      </View>

      {/* Mode Switch Button */}
      <TouchableOpacity onPress={onSwitchToArtisan} style={bStyles.switchBtn}>
        <MaterialCommunityIcons name="swap-horizontal" size={18} color={C.terracottaDeep} />
        <Text style={{ color: C.terracottaDeep, fontWeight: "700", fontSize: 14.5, marginLeft: 8 }}>
          Switch to Artisan Mode (कारीगर मोड में जाएं)
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* --------------------------- Buyer Bottom Navigation --------------------------- */

export function BuyerBottomNav({ activeTab, onNav }) {
  const items = [
    { key: "market", label: "Explore Crafts", icon: "storefront-outline" },
    { key: "deals", label: "My Enquiries", icon: "message-badge-outline" },
    { key: "buyerProfile", label: "Business Profile", icon: "account-circle-outline" },
  ];

  return (
    <View style={bStyles.bottomNav}>
      {items.map((it) => {
        const isActive = activeTab === it.key;
        return (
          <TouchableOpacity
            key={it.key}
            onPress={() => onNav(it.key)}
            style={bStyles.bottomNavItem}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={it.icon}
              size={23}
              color={isActive ? C.indigo : C.inkSoft}
            />
            <Text style={[bStyles.bottomNavText, isActive && { color: C.indigo, fontWeight: "700" }]}>
              {it.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* --------------------------- Styles --------------------------- */

const bStyles = StyleSheet.create({
  roleSwitcherWrap: {
    backgroundColor: C.paperDeep,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  roleSwitcherInner: {
    flexDirection: "row",
    backgroundColor: "#E2D7BE",
    borderRadius: 12,
    padding: 3,
  },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 9,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: C.indigo,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.inkSoft,
  },
  roleTabTextActive: {
    color: "#fff",
  },
  activeUserIndicator: {
    marginTop: 4,
    alignItems: "center",
  },
  activeUserText: {
    fontSize: 11,
    color: C.inkSoft,
    fontWeight: "600",
  },

  searchHeader: {
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: C.paper,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  craftChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  craftChipActive: {
    backgroundColor: C.indigo,
    borderColor: C.indigo,
  },
  craftChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: C.ink,
  },
  craftChipTextActive: {
    color: "#fff",
  },

  productCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  productImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#E2D7BE",
  },
  productInfo: {
    padding: 14,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: C.terracottaDeep,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.ink,
    marginTop: 6,
  },
  productTitleHi: {
    fontSize: 13,
    color: C.inkSoft,
    marginTop: 2,
  },
  artisanTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  artisanName: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.ink,
  },
  artisanCity: {
    fontSize: 12,
    color: C.inkSoft,
  },
  miniBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 34,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: "dashed",
    marginTop: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  detailImage: {
    width: "100%",
    height: 190,
    borderRadius: 14,
    backgroundColor: "#E2D7BE",
  },
  artisanBadgeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2EBE0",
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    gap: 10,
  },
  artisanAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.leaf,
    alignItems: "center",
    justifyContent: "center",
  },
  actionToggle: {
    flexDirection: "row",
    backgroundColor: "#E2D7BE",
    borderRadius: 12,
    padding: 3,
    marginTop: 16,
    marginBottom: 12,
  },
  actionToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  actionToggleBtnActive: {
    backgroundColor: C.indigo,
  },
  actionToggleText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.inkSoft,
  },
  actionToggleTextActive: {
    color: "#fff",
  },
  formCard: {
    backgroundColor: C.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.inkSoft,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: C.ink,
  },
  calcBox: {
    backgroundColor: "#FBF0DA",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  submitOfferBtn: {
    backgroundColor: C.terracotta,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFE6D2",
    alignItems: "center",
    justifyContent: "center",
  },

  enquiryCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },
  latestMsgBox: {
    backgroundColor: "#F5EFE1",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },

  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: C.paper,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBubble: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    maxWidth: "85%",
  },
  chatBubbleBuyer: {
    backgroundColor: C.indigo,
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  chatBubbleArtisan: {
    backgroundColor: C.card,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  chatSenderLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#E2D7BE",
    marginBottom: 4,
  },
  chatText: {
    fontSize: 13.5,
    color: C.ink,
    lineHeight: 18,
  },
  offerChip: {
    backgroundColor: "#FBF0DA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  offerChipText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.ink,
  },
  counterPromptBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6E6DE",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#E6C9BC",
  },
  acceptBtn: {
    backgroundColor: C.leaf,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dealClosedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F0E8",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#C4DFC6",
  },
  negotiateBar: {
    backgroundColor: C.card,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  smallLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.inkSoft,
    marginBottom: 6,
  },
  sendBtn: {
    backgroundColor: C.indigo,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  avatarBig: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  trustCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F0E8",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  profileInfoCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E7D6",
  },
  profileRowLabel: {
    fontSize: 13,
    color: C.inkSoft,
  },
  profileRowVal: {
    fontSize: 13,
    fontWeight: "700",
    color: C.ink,
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6E6DE",
    borderWidth: 1.5,
    borderColor: "#E6C9BC",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 8,
    paddingBottom: 14,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavText: {
    fontSize: 11,
    color: C.inkSoft,
    marginTop: 3,
  },
});
