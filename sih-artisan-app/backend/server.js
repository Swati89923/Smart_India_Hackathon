require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth");
const artisanRoutes = require("./src/routes/artisans");
const productRoutes = require("./src/routes/products");
const aiRoutes = require("./src/routes/ai");
const enquiryRoutes = require("./src/routes/enquiries");
const { load, save, DB_PATH } = require("./src/db");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Auto-seed on first run so the API is demo-ready immediately.
if (!fs.existsSync(DB_PATH)) {
  require("./src/seed");
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "shilpsaathi-backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/enquiries", enquiryRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`ShilpSaathi backend running on http://localhost:${PORT}`);
  console.log(`Try: curl http://localhost:${PORT}/api/health`);
});
