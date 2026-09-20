/**
 * db.js — lightweight file-backed data layer for the prototype.
 *
 * In production (see /backend/schema.sql) this layer is PostgreSQL
 * (business data: artisans, products, enquiries, negotiations) +
 * Object Storage (product images), exactly as shown in the
 * "Methodology & System Data-Flow" diagram. For a hackathon-speed
 * prototype we persist the same shape of data to a local JSON file
 * so the API is fully functional with zero external DB setup.
 */
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data.json");

function defaultData() {
  return {
    artisans: [],
    buyers: [],
    products: [],
    enquiries: [],
  };
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    save(defaultData());
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    return defaultData();
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { load, save, DB_PATH };
