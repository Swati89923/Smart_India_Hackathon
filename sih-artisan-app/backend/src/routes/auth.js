const express = require("express");
const { v4: uuid } = require("uuid");
const { load, save } = require("../db");

const router = express.Router();

// In-memory OTP store for the demo (production: Redis/SMS gateway with expiry)
const otpStore = {};
const DEMO_OTP = "1234";

router.post("/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ error: "Valid 10-digit phone required" });
  }
  otpStore[phone] = DEMO_OTP;
  // Demo only — never return the OTP in a real system.
  return res.json({ sent: true, demoOtp: DEMO_OTP });
});

router.post("/verify-otp", (req, res) => {
  const { phone, otp, role = "artisan" } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: "phone and otp required" });
  if (otpStore[phone] !== otp && otp !== "1234") {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  const data = load();
  if (!data.buyers) data.buyers = [];
  if (!data.artisans) data.artisans = [];

  if (role === "buyer") {
    let buyer = data.buyers.find((b) => b.phone === phone);
    if (!buyer) {
      buyer = {
        id: `buyer-${uuid()}`,
        name: req.body.name || "Demo Buyer",
        phone,
        buyerType: req.body.buyerType || "Retailer",
        companyName: req.body.companyName || "Craft Retailers Co.",
        city: req.body.city || "New Delhi",
        createdAt: new Date().toISOString(),
      };
      data.buyers.push(buyer);
      save(data);
    }
    return res.json({ token: `demo-token-${buyer.id}`, role: "buyer", buyer });
  }

  let artisan = data.artisans.find((a) => a.phone === phone);
  if (!artisan) {
    artisan = {
      id: `artisan-${uuid()}`,
      name: req.body.name || "",
      phone,
      craft: "",
      location: "",
      pehchanId: "",
      kycVerified: false,
      language: "hi",
      createdAt: new Date().toISOString(),
    };
    data.artisans.push(artisan);
    save(data);
  }

  return res.json({ token: `demo-token-${artisan.id}`, role: "artisan", artisan });
});

router.patch("/buyer/:id", (req, res) => {
  const data = load();
  if (!data.buyers) data.buyers = [];
  const buyer = data.buyers.find((b) => b.id === req.params.id);
  if (!buyer) return res.status(404).json({ error: "Buyer not found" });

  const { name, buyerType, companyName, city } = req.body;
  if (name !== undefined) buyer.name = name;
  if (buyerType !== undefined) buyer.buyerType = buyerType;
  if (companyName !== undefined) buyer.companyName = companyName;
  if (city !== undefined) buyer.city = city;

  save(data);
  res.json({ ok: true, buyer });
});

module.exports = router;
