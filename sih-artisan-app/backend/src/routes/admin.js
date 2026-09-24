const express = require("express");
const { load, save } = require("../db");

const router = express.Router();

// Demo admin credentials (production: SSO / hashed passwords + role table)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@shilpsaathi.gov.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const artisanStatus = (a) => a.status || (a.kycVerified ? "active" : "pending");
const artisanState = (a) => a.state || (a.location || "").split(",").pop().trim() || "Unknown";

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }
  res.json({ token: "demo-token-admin", role: "admin", admin: { name: "Platform Admin", email } });
});

// Platform overview: headline numbers + growth + distribution charts
router.get("/overview", (req, res) => {
  const data = load();
  const artisans = data.artisans || [];
  const products = data.products || [];
  const enquiries = data.enquiries || [];

  // Cumulative artisans & products per month for the last 6 months
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 1); // start of next month
    const label = new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleString("en-IN", { month: "short" });
    months.push({
      label,
      artisans: artisans.filter((a) => new Date(a.createdAt) < d).length,
      products: products.filter((p) => new Date(p.createdAt) < d).length,
    });
  }

  const countBy = (items, keyFn) => {
    const out = {};
    items.forEach((it) => {
      const k = keyFn(it);
      out[k] = (out[k] || 0) + 1;
    });
    return Object.entries(out)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  res.json({
    totals: {
      artisans: artisans.length,
      activeArtisans: artisans.filter((a) => artisanStatus(a) === "active").length,
      pendingArtisans: artisans.filter((a) => artisanStatus(a) === "pending").length,
      products: products.length,
      activeProducts: products.filter((p) => (p.status || "published") === "published").length,
      buyers: (data.buyers || []).length,
      enquiries: enquiries.length,
      dealsClosed: enquiries.filter((e) => e.status === "deal_closed").length,
      gmv: enquiries.reduce((sum, e) => sum + (e.totalAmount || 0), 0),
      languages: new Set(artisans.map((a) => a.language || "hi")).size,
    },
    growth: months,
    artisansByState: countBy(artisans, artisanState),
    productsByCraft: countBy(products, (p) => p.craft || "other"),
  });
});

router.get("/artisans", (req, res) => {
  const data = load();
  const products = data.products || [];
  res.json(
    (data.artisans || []).map((a) => ({
      ...a,
      state: artisanState(a),
      status: artisanStatus(a),
      productCount: products.filter((p) => p.artisanId === a.id).length,
    }))
  );
});

// Approve / suspend an artisan
router.patch("/artisans/:id", (req, res) => {
  const data = load();
  const artisan = (data.artisans || []).find((a) => a.id === req.params.id);
  if (!artisan) return res.status(404).json({ error: "Artisan not found" });
  const { status } = req.body; // active | pending | suspended
  if (status) {
    artisan.status = status;
    if (status === "active") artisan.kycVerified = true;
  }
  save(data);
  res.json({ ...artisan, state: artisanState(artisan), status: artisanStatus(artisan) });
});

router.get("/products", (req, res) => {
  const data = load();
  const artisans = data.artisans || [];
  res.json(
    (data.products || []).map((p) => {
      const a = artisans.find((x) => x.id === p.artisanId) || {};
      return { ...p, artisanName: a.name || "—", artisanState: artisanState(a), status: p.status || "published" };
    })
  );
});

// Approve / hide a product
router.patch("/products/:id", (req, res) => {
  const data = load();
  const product = (data.products || []).find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (req.body.status) product.status = req.body.status; // published | pending | hidden
  save(data);
  res.json(product);
});

router.get("/settings", (req, res) => {
  const data = load();
  res.json(data.settings || { announcement: "", categories: [] });
});

router.put("/settings", (req, res) => {
  const data = load();
  const { announcement, categories } = req.body;
  data.settings = data.settings || {};
  if (announcement !== undefined) data.settings.announcement = announcement;
  if (Array.isArray(categories)) data.settings.categories = categories;
  save(data);
  res.json(data.settings);
});

module.exports = router;
