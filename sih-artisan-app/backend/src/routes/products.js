const express = require("express");
const { v4: uuid } = require("uuid");
const { load, save } = require("../db");

const router = express.Router();

// Helper to attach artisan info to a product
function enrichProduct(product, artisans = []) {
  const artisan = artisans.find((a) => a.id === product.artisanId) || {};
  return {
    ...product,
    artisanName: artisan.name || "Master Artisan",
    artisanLocation: artisan.location || "India",
    artisanPhone: artisan.phone || "",
    artisanState: artisan.state || "",
    artisanBio: artisan.bio || "",
    pehchanId: artisan.pehchanId || "PEHCHAN-VERIFIED",
    kycVerified: artisan.kycVerified ?? true,
  };
}

// List products, optionally filtered by artisan (storefront / "My Shop")
router.get("/", (req, res) => {
  const { artisanId, craft, search } = req.query;
  const data = load();
  const artisans = data.artisans || [];
  // Storefront shows all of an artisan's items; the public marketplace
  // only shows published ones (admin can hold items as "pending").
  let products = artisanId
    ? (data.products || []).filter((p) => p.artisanId === artisanId)
    : (data.products || []).filter((p) => (p.status || "published") === "published");

  if (craft && craft !== "all") {
    products = products.filter((p) => (p.craft || "").toLowerCase() === craft.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    const artisanName = (p) => ((artisans.find((a) => a.id === p.artisanId) || {}).name || "").toLowerCase();
    products = products.filter(
      (p) =>
        artisanName(p).includes(s) ||
        (p.title && p.title.toLowerCase().includes(s)) ||
        (p.titleHi && p.titleHi.includes(s)) ||
        (p.category && p.category.toLowerCase().includes(s)) ||
        (p.craft && p.craft.toLowerCase().includes(s))
    );
  }

  res.json(products.map((p) => enrichProduct(p, artisans)));
});

router.get("/:id", (req, res) => {
  const data = load();
  const product = (data.products || []).find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(enrichProduct(product, data.artisans || []));
});

// Create & publish a product — the final step of the 7-step flow
router.post("/", (req, res) => {
  const {
    artisanId,
    title,
    titleHi,
    description,
    descriptionHi,
    craft,
    category,
    price,
    priceMin,
    priceMax,
    material,
    imageUrl,
  } = req.body;

  if (!artisanId || !title || !price) {
    return res.status(400).json({ error: "artisanId, title and price are required" });
  }

  const data = load();
  const product = {
    id: uuid(),
    artisanId,
    title,
    titleHi: titleHi || "",
    description: description || "",
    descriptionHi: descriptionHi || "",
    craft: craft || "pottery",
    category: category || "Handicraft",
    price,
    priceMin: priceMin || null,
    priceMax: priceMax || null,
    material: material || "",
    imageUrl: imageUrl || "https://picsum.photos/seed/newitem/600/450",
    views: 0,
    status: "published",
    createdAt: new Date().toISOString(),
  };
  data.products.unshift(product);
  save(data);
  res.status(201).json(product);
});

router.patch("/:id", (req, res) => {
  const data = load();
  const product = data.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  Object.assign(product, req.body);
  save(data);
  res.json(product);
});

module.exports = router;
