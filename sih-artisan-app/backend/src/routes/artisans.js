const express = require("express");
const { load, save } = require("../db");

const router = express.Router();

// Complete/update onboarding profile
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, craft, location, pehchanId, language } = req.body;
  const data = load();
  const artisan = data.artisans.find((a) => a.id === id);
  if (!artisan) return res.status(404).json({ error: "Artisan not found" });

  if (name !== undefined) artisan.name = name;
  if (craft !== undefined) artisan.craft = craft;
  if (location !== undefined) artisan.location = location;
  if (pehchanId !== undefined) artisan.pehchanId = pehchanId; // optional, minimal-field onboarding
  if (language !== undefined) artisan.language = language;
  artisan.kycVerified = !!(artisan.name && artisan.craft && artisan.location);

  save(data);
  res.json(artisan);
});

router.get("/:id", (req, res) => {
  const data = load();
  const artisan = data.artisans.find((a) => a.id === req.params.id);
  if (!artisan) return res.status(404).json({ error: "Artisan not found" });
  res.json(artisan);
});

module.exports = router;
