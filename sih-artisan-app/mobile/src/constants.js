// Shared constants — mirrors mobile/src/theme.js so both clients stay in sync.

export const CRAFTS = [
  { key: "pottery", en: "Pottery", hi: "मिट्टी के बर्तन", emoji: "🏺" },
  { key: "weaving", en: "Textiles", hi: "बुनाई", emoji: "🧵" },
  { key: "painting", en: "Painting", hi: "चित्रकला", emoji: "🎨" },
  { key: "jewelry", en: "Jewellery", hi: "आभूषण", emoji: "💍" },
  { key: "woodwork", en: "Woodwork", hi: "लकड़ी का काम", emoji: "🪵" },
  { key: "embroidery", en: "Embroidery", hi: "कढ़ाई", emoji: "🪡" },
];

export const craftLabel = (key) => CRAFTS.find((c) => c.key === key)?.en || key || "Handicraft";

// Web Speech API language codes for multi-language voice input
export const VOICE_LANGUAGES = [
  { code: "hi-IN", label: "Hindi (हिंदी)" },
  { code: "en-IN", label: "English (India)" },
  { code: "bn-IN", label: "Bengali (বাংলা)" },
  { code: "mr-IN", label: "Marathi (मराठी)" },
  { code: "gu-IN", label: "Gujarati (ગુજરાતી)" },
  { code: "ta-IN", label: "Tamil (தமிழ்)" },
  { code: "te-IN", label: "Telugu (తెలుగు)" },
  { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml-IN", label: "Malayalam (മലയാളം)" },
  { code: "pa-IN", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "or-IN", label: "Odia (ଓଡ଼ିଆ)" },
  { code: "ur-IN", label: "Urdu (اردو)" },
];

export const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const BUYER_TYPES = ["Retailer", "Exporter", "Wholesaler", "Corporate Gifting", "Hotel / Hospitality", "Individual"];

// Default daily wage used to turn labour days into a cost (editable in the pricing step)
export const DEFAULT_DAILY_WAGE = 350;

export const ENQUIRY_STATUS = {
  open: { label: "New", tone: "orange" },
  negotiating: { label: "In Discussion", tone: "blue" },
  accepted: { label: "Accepted", tone: "green" },
  deal_closed: { label: "Confirmed", tone: "green" },
  declined: { label: "Declined", tone: "red" },
};

export const inr = (n) =>
  n == null || n === "" || Number.isNaN(Number(n)) ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;

export const priceRange = (p) =>
  p.priceMin && p.priceMax && p.priceMin !== p.priceMax
    ? `${inr(p.priceMin)} – ${inr(p.priceMax)}`
    : inr(p.price);

export const timeAgo = (iso) => {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
