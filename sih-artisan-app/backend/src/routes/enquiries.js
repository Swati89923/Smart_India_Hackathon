const express = require("express");
const { v4: uuid } = require("uuid");
const { load, save } = require("../db");
const { suggestNegotiationResponse } = require("../services/pricingModel");

const router = express.Router();

// List buyer enquiries for an artisan OR for a buyer
router.get("/", (req, res) => {
  const { artisanId, buyerId, buyerPhone } = req.query;
  const data = load();
  let enquiries = data.enquiries || [];

  if (artisanId) {
    enquiries = enquiries.filter((e) => e.artisanId === artisanId);
  } else if (buyerId) {
    enquiries = enquiries.filter((e) => e.buyerId === buyerId);
  } else if (buyerPhone) {
    enquiries = enquiries.filter((e) => e.buyerPhone === buyerPhone);
  }
  res.json(enquiries);
});

// Buyer creates a new enquiry or wholesale offer on a product
router.post("/", (req, res) => {
  const {
    productId,
    artisanId,
    buyerId,
    buyerName,
    buyerType,
    buyerPhone,
    productTitle,
    quantity,
    askingPrice,
    initialOfferPrice,
    initialMessage,
    requiredBy,
    budgetMin,
    budgetMax,
  } = req.body;

  if (!artisanId || !productTitle || !askingPrice) {
    return res.status(400).json({ error: "artisanId, productTitle and askingPrice are required" });
  }

  const data = load();
  if (!data.enquiries) data.enquiries = [];

  const qty = Number(quantity) || 1;
  const ask = Number(askingPrice);
  const offer = initialOfferPrice != null ? Number(initialOfferPrice) : null;

  const enquiry = {
    id: uuid(),
    productId: productId || null,
    artisanId,
    buyerId: buyerId || `buyer-${uuid()}`,
    buyerName: buyerName || "Interested Buyer",
    buyerType: buyerType || "Retailer",
    buyerPhone: buyerPhone || "",
    productTitle,
    quantity: qty,
    askingPrice: ask,
    budgetMin: budgetMin != null && budgetMin !== "" ? Number(budgetMin) : null,
    budgetMax: budgetMax != null && budgetMax !== "" ? Number(budgetMax) : null,
    requiredBy: requiredBy || null,
    status: offer ? "negotiating" : "open",
    createdAt: new Date().toISOString(),
    thread: [
      {
        id: uuid(),
        sender: "buyer",
        message:
          initialMessage ||
          (offer
            ? `Offer sent: ₹${offer}/piece for ${qty} pieces (Total: ₹${offer * qty}).`
            : `Interested in ordering ${qty} pieces.`),
        offerPrice: offer,
        time: new Date().toISOString(),
      },
    ],
  };

  data.enquiries.unshift(enquiry);
  save(data);
  res.status(201).json(enquiry);
});

router.get("/:id", (req, res) => {
  const data = load();
  const enquiry = (data.enquiries || []).find((e) => e.id === req.params.id);
  if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });
  res.json(enquiry);
});

// Buyer (or artisan) sends a message / counter-offer into the negotiation thread
router.post("/:id/message", (req, res) => {
  const { sender, message, offerPrice } = req.body; // sender: 'buyer' | 'artisan'
  const data = load();
  const enquiry = (data.enquiries || []).find((e) => e.id === req.params.id);
  if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });

  const entry = {
    id: uuid(),
    sender: sender || "buyer",
    message: message || "",
    offerPrice: offerPrice != null ? Number(offerPrice) : null,
    time: new Date().toISOString(),
  };
  enquiry.thread.push(entry);
  if (enquiry.status !== "deal_closed") {
    enquiry.status = "negotiating";
  }
  save(data);
  res.status(201).json(enquiry);
});

// AI-assisted suggestion for how the artisan could respond to the latest offer.
// The artisan reviews and edits this before sending — never auto-sent.
router.get("/:id/suggest-response", (req, res) => {
  const data = load();
  const enquiry = data.enquiries.find((e) => e.id === req.params.id);
  if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });

  const lastOffer = [...enquiry.thread].reverse().find((m) => m.offerPrice != null);
  if (!lastOffer) {
    return res.json({ action: "none", note: "No offer to respond to yet." });
  }
  const suggestion = suggestNegotiationResponse({
    askingPrice: enquiry.askingPrice,
    offerPrice: lastOffer.offerPrice,
    quantity: enquiry.quantity,
  });
  res.json(suggestion);
});

// Artisan finalizes a response: accept / counter / reject
router.post("/:id/respond", (req, res) => {
  const { action, price, message } = req.body; // action: accept | counter | reject
  const data = load();
  const enquiry = data.enquiries.find((e) => e.id === req.params.id);
  if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });

  const entry = {
    id: uuid(),
    sender: "artisan",
    message:
      message ||
      (action === "accept"
        ? `Accepted at ₹${price}/piece.`
        : action === "counter"
        ? `Countered at ₹${price}/piece.`
        : "Declined this offer."),
    offerPrice: action === "reject" ? null : price,
    time: new Date().toISOString(),
  };
  enquiry.thread.push(entry);
  enquiry.status = action === "accept" ? "accepted" : action === "reject" ? "declined" : "negotiating";
  save(data);
  res.json(enquiry);
});

// Buyer accepts counter-offer or confirms order/deal
router.post("/:id/deal", (req, res) => {
  const { finalPrice, address, paymentMode = "Escrow / Cash on Delivery" } = req.body;
  const data = load();
  const enquiry = (data.enquiries || []).find((e) => e.id === req.params.id);
  if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });

  const price = finalPrice != null ? Number(finalPrice) : enquiry.askingPrice;
  const total = price * enquiry.quantity;

  const entry = {
    id: uuid(),
    sender: "buyer",
    message: `🤝 Deal Confirmed! Agreed at ₹${price}/piece for ${enquiry.quantity} items (Total: ₹${total}). Payment: ${paymentMode}. Delivery: ${address || "Default Address"}.`,
    offerPrice: price,
    time: new Date().toISOString(),
  };

  enquiry.thread.push(entry);
  enquiry.status = "deal_closed";
  enquiry.finalPrice = price;
  enquiry.totalAmount = total;
  save(data);
  res.json(enquiry);
});

module.exports = router;
