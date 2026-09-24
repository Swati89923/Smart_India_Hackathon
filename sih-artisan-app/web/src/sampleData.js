// Offline demo data — a copy of backend/src/seed.js so the web app keeps
// working end-to-end when the backend is unreachable (CLAUDE.md rule 2).

const daysAgo = (d, h = 0) => new Date(Date.now() - (d * 24 + h) * 3600 * 1000).toISOString();
const img = (id) => `https://images.unsplash.com/${id}?w=600&auto=format&fit=crop&q=80`;

export const SAMPLE_ARTISANS = [
  { id: "artisan-demo-001", name: "Radha Devi", phone: "9876543210", craft: "pottery", location: "Khurja, Uttar Pradesh", state: "Uttar Pradesh", pehchanId: "PEHCHAN-UP-88213", kycVerified: true, status: "active", language: "hi", createdAt: daysAgo(160), bio: "Third-generation potter from the Khurja ceramic cluster, known for hand-thrown vases and glazed tableware." },
  { id: "artisan-demo-002", name: "Shanti Ram", phone: "9812345678", craft: "weaving", location: "Varanasi, Uttar Pradesh", state: "Uttar Pradesh", pehchanId: "PEHCHAN-UP-55104", kycVerified: true, status: "active", language: "hi", createdAt: daysAgo(140), bio: "Handloom weaver from Varanasi carrying forward the Banarasi silk tradition." },
  { id: "artisan-demo-003", name: "Sita Devi", phone: "9801122334", craft: "painting", location: "Madhubani, Bihar", state: "Bihar", pehchanId: "PEHCHAN-BR-20417", kycVerified: true, status: "active", language: "hi", createdAt: daysAgo(120), bio: "Madhubani painter using natural pigments and hand-made brushes, trained by her grandmother." },
  { id: "artisan-demo-004", name: "Ramesh Kumar", phone: "9811223344", craft: "woodwork", location: "Saharanpur, Uttar Pradesh", state: "Uttar Pradesh", pehchanId: "PEHCHAN-UP-61930", kycVerified: true, status: "active", language: "hi", createdAt: daysAgo(95) },
  { id: "artisan-demo-005", name: "Lalita Sharma", phone: "9829012345", craft: "weaving", location: "Barmer, Rajasthan", state: "Rajasthan", pehchanId: "PEHCHAN-RJ-44871", kycVerified: true, status: "active", language: "hi", createdAt: daysAgo(70) },
  { id: "artisan-demo-006", name: "Arjun Mehta", phone: "9825098765", craft: "woodwork", location: "Kutch, Gujarat", state: "Gujarat", pehchanId: "", kycVerified: false, status: "pending", language: "gu", createdAt: daysAgo(12) },
  { id: "artisan-demo-007", name: "Kavita Kumari", phone: "9832145678", craft: "jewelry", location: "Jaipur, Rajasthan", state: "Rajasthan", pehchanId: "PEHCHAN-RJ-77310", kycVerified: true, status: "active", language: "hi", createdAt: daysAgo(45) },
  { id: "artisan-demo-008", name: "Bijay Nayak", phone: "9437012345", craft: "painting", location: "Raghurajpur, Odisha", state: "Odisha", pehchanId: "PEHCHAN-OD-10582", kycVerified: true, status: "active", language: "or", createdAt: daysAgo(30) },
  { id: "artisan-demo-009", name: "Farzana Begum", phone: "9415098712", craft: "embroidery", location: "Lucknow, Uttar Pradesh", state: "Uttar Pradesh", pehchanId: "", kycVerified: false, status: "pending", language: "ur", createdAt: daysAgo(5) },
];

export const SAMPLE_BUYERS = [
  { id: "buyer-demo-001", name: "Rajiv Sharma", phone: "9123456780", companyName: "Rathi Exports Pvt Ltd", buyerType: "Exporter", city: "New Delhi" },
  { id: "buyer-demo-002", name: "Ananya Gupta", phone: "9876500112", companyName: "Craft Bazaar Retail", buyerType: "Retailer", city: "Bengaluru" },
];

const p = (id, artisanId, title, titleHi, description, descriptionHi, craft, category, material, price, priceMin, priceMax, photo, views, created, status = "published") => ({
  id, artisanId, title, titleHi, description, descriptionHi, craft, category, material, price, priceMin, priceMax,
  imageUrl: img(photo), views, status, createdAt: daysAgo(created),
});

export const SAMPLE_PRODUCTS = [
  p("d2ad72f4-61fc-4d62-b820-a2e1f15c3d03", "artisan-demo-001", "Blue Pottery Vase — Jaipur Style", "नीली मिट्टी का फूलदान", "Handmade blue pottery vase crafted in the traditional Jaipur style, using quartz clay and hand-painted floral motifs.", "जयपुर की पारंपरिक ब्लू पॉटरी शैली में हाथ से बना फूलदान, क्वार्ट्ज मिट्टी और हाथ से चित्रित फूलों की कलाकृति के साथ।", "pottery", "Home Decor", "Quartz clay, natural glaze", 650, 550, 815, "photo-1578749556568-bc2c40e68b61", 214, 150),
  p("ce7a456f-afae-4e5a-9f36-f048ccfebfe1", "artisan-demo-002", "Hand-woven Banarasi Silk Dupatta", "हाथ से बुना बनारसी दुपट्टा", "Authentic Varanasi handloom dupatta woven with fine silk threads and zari border.", "प्राकृतिक रेशमी धागे और ज़री बॉर्डर से हाथ से बुना पारंपरिक बनारसी दुपट्टा।", "weaving", "Textile", "Silk, zari thread", 1250, 1060, 1565, "photo-1594040226829-7f251ab46d80", 185, 130),
  p("fa318c42-871d-4054-9a84-7517c5b65109", "artisan-demo-001", "Traditional Terracotta Water Pitcher", "पारंपरिक मिट्टी का मटका", "Natural porous clay pitcher keeping water naturally cool, finished with ethnic etched lines.", "प्राकृतिक मिट्टी से बना मटका जो पानी को ठंडा रखता है, पारंपरिक नक्काशी के साथ।", "pottery", "Kitchen & Dining", "Terracotta clay", 450, 385, 565, "photo-1493106641515-6b5631de4bb9", 94, 110),
  p("97f0a714-3864-4a41-b844-325b3ea70e28", "artisan-demo-001", "Madhubani Tree of Life Folk Art", "मधुबनी ट्री ऑफ लाइफ पेंटिंग", "Handcrafted Madhubani wall art on handmade paper made with natural vegetable dyes.", "प्राकृतिक रंगों से हस्तनिर्मित कागज़ पर बनी पारंपरिक मधुबनी पेंटिंग।", "painting", "Wall Art", "Handmade paper, vegetable dyes", 1800, 1530, 2250, "photo-1541961017774-22349e4a1262", 310, 100),
  p("prod-demo-005", "artisan-demo-003", "Handcrafted Madhubani Vase", "हस्तनिर्मित मधुबनी फूलदान", "A handcrafted clay vase with traditional Madhubani art, made using natural colours.", "यह एक हस्तनिर्मित मधुबनी कला से सजा मिट्टी का फूलदान है, जिसे प्राकृतिक रंगों से बनाया गया है।", "painting", "Home Decor", "Clay, natural colours", 700, 700, 950, "photo-1565193566173-7a0ee3dbe261", 127, 80),
  p("prod-demo-006", "artisan-demo-007", "Kundan Temple Necklace Set", "कुंदन टेम्पल हार सेट", "Hand-set kundan necklace with matching earrings, inspired by South Indian temple jewellery.", "हाथ से जड़ा कुंदन हार और झुमके, दक्षिण भारतीय मंदिर आभूषणों से प्रेरित।", "jewelry", "Jewellery", "Brass, kundan stones, gold plating", 2400, 2040, 3000, "photo-1601121141461-9d6647bca1ed", 268, 40),
  p("prod-demo-007", "artisan-demo-007", "Oxidised Silver Jhumka & Bangle Set", "ऑक्सीडाइज़्ड चांदी झुमका सेट", "Tribal-style oxidised silver jewellery, hand-engraved by Jaipur silversmiths.", "जयपुर के सुनारों द्वारा हाथ से नक्काशी किए गए ऑक्सीडाइज़्ड चांदी के आभूषण।", "jewelry", "Jewellery", "Sterling silver", 1600, 1360, 2000, "photo-1606760227091-3dd870d97f1d", 141, 35),
  p("prod-demo-008", "artisan-demo-004", "Sheesham Wood Side Table", "शीशम लकड़ी की साइड टेबल", "Solid sheesham side table with a book shelf, hand-finished with natural oil polish.", "किताबों की शेल्फ वाली शीशम की ठोस साइड टेबल, प्राकृतिक तेल से पॉलिश की गई।", "woodwork", "Furniture", "Sheesham wood", 3200, 2720, 4000, "photo-1611486212557-88be5ff6f941", 76, 60),
  p("prod-demo-009", "artisan-demo-005", "Handloom Cotton Cushion Covers (Set of 2)", "हथकरघा सूती कुशन कवर (2 का सेट)", "Striped handloom cotton cushion covers woven on pit looms in Barmer.", "बाड़मेर के गड्ढा करघों पर बुने धारीदार सूती कुशन कवर।", "weaving", "Textile", "Handloom cotton", 850, 720, 1060, "photo-1616627561950-9f746e330187", 98, 50),
  p("prod-demo-010", "artisan-demo-001", "Khurja Ceramic Cup Set", "खुर्जा सिरेमिक कप सेट", "Set of four hand-thrown stoneware cups with a soft matte glaze.", "मुलायम मैट ग्लेज़ वाले चार हाथ से बने स्टोनवेयर कप का सेट।", "pottery", "Kitchen & Dining", "Stoneware clay", 520, 440, 650, "photo-1590422749897-47036da0b0ff", 63, 20),
  p("prod-demo-011", "artisan-demo-008", "Pattachitra Wall Art Collection", "पटचित्र वॉल आर्ट संग्रह", "Framed Pattachitra miniatures painted on treated cloth in Raghurajpur.", "रघुराजपुर में उपचारित कपड़े पर बने फ्रेम किए गए पटचित्र।", "painting", "Wall Art", "Cloth, natural pigments", 2100, 1785, 2625, "photo-1513519245088-0e12902e5a38", 88, 25),
  p("prod-demo-012", "artisan-demo-006", "Kutch Carved Wooden Planter", "कच्छ नक्काशीदार लकड़ी का गमला", "Hand-carved planter from Kutch, awaiting artisan verification.", "कच्छ का हाथ से नक्काशीदार गमला।", "woodwork", "Home Decor", "Mango wood", 900, 765, 1125, "photo-1612196808214-b8e1d6145a8c", 4, 8, "pending"),
];

export const SAMPLE_ENQUIRIES = [
  {
    id: "6dad62e9-ca37-4b5c-b069-274a4e532f26", productId: "d2ad72f4-61fc-4d62-b820-a2e1f15c3d03", artisanId: "artisan-demo-001",
    buyerId: "buyer-demo-001", buyerName: "Rajiv Sharma (Rathi Exports)", buyerType: "Exporter", buyerPhone: "9123456780",
    productTitle: "Blue Pottery Vase — Jaipur Style", quantity: 150, askingPrice: 650, budgetMin: 500, budgetMax: 560,
    requiredBy: daysAgo(-30).slice(0, 10), status: "negotiating", createdAt: daysAgo(0, 6),
    thread: [
      { id: "m1", sender: "buyer", message: "Interested in bulk order for the European market. Can you do 150 pieces?", offerPrice: null, time: daysAgo(0, 6) },
      { id: "m2", sender: "buyer", message: "For this bulk quantity of 150, can you offer ₹520 per piece?", offerPrice: 520, time: daysAgo(0, 5) },
    ],
  },
  {
    id: "b5f6a954-479c-4968-9105-0553d53df42f", productId: "ce7a456f-afae-4e5a-9f36-f048ccfebfe1", artisanId: "artisan-demo-002",
    buyerId: "buyer-demo-002", buyerName: "Ananya Gupta (Craft Bazaar)", buyerType: "Retailer", buyerPhone: "9876500112",
    productTitle: "Hand-woven Banarasi Silk Dupatta", quantity: 40, askingPrice: 1250, status: "open", createdAt: daysAgo(1),
    thread: [{ id: "m3", sender: "buyer", message: "We stock handloom textiles across 12 stores. Can you supply 40/month?", offerPrice: null, time: daysAgo(1) }],
  },
  {
    id: "enq-demo-003", productId: "fa318c42-871d-4054-9a84-7517c5b65109", artisanId: "artisan-demo-001",
    buyerId: "buyer-demo-001", buyerName: "Rajiv Sharma (Rathi Exports)", buyerType: "Exporter", buyerPhone: "9123456780",
    productTitle: "Traditional Terracotta Water Pitcher", quantity: 60, askingPrice: 450, status: "deal_closed",
    finalPrice: 425, totalAmount: 25500, createdAt: daysAgo(15),
    thread: [
      { id: "m4", sender: "buyer", message: "We need 60 pitchers for a summer promotion. ₹400 per piece?", offerPrice: 400, time: daysAgo(15) },
      { id: "m5", sender: "artisan", message: "Countered at ₹425/piece.", offerPrice: 425, time: daysAgo(14, 20) },
      { id: "m6", sender: "buyer", message: "🤝 Deal Confirmed! Agreed at ₹425/piece for 60 items (Total: ₹25500). Payment: Escrow / Cash on Delivery.", offerPrice: 425, time: daysAgo(14, 18) },
    ],
  },
];

export const SAMPLE_SETTINGS = {
  announcement: "PM Vishwakarma registrations are open — verify your Pehchan ID to get the verified badge.",
  categories: ["Pottery", "Weaving", "Painting", "Jewelry", "Woodwork", "Embroidery"],
};

// Offline copies of backend/src/services/nlpCatalogue.js templates
export const FALLBACK_TRANSCRIPTS = {
  pottery: "यह नीले रंग का हाथ से बना मिट्टी का फूलदान है, जयपुर की पारंपरिक ब्लू पॉटरी शैली में बनाया गया है।",
  weaving: "यह हाथ से बुना हुआ सूती दुपट्टा है, इसमें पारंपरिक बॉर्डर डिज़ाइन है।",
  painting: "यह मधुबनी शैली की पेंटिंग है, प्राकृतिक रंगों से हाथ से बनाई गई है।",
  jewelry: "यह चांदी की पारंपरिक बालियां हैं, हाथ से नक्काशी की गई हैं।",
  woodwork: "यह लकड़ी का हाथ से नक्काशीदार डिब्बा है, सागौन की लकड़ी से बना है।",
  embroidery: "यह हाथ से की गई चिकनकारी कढ़ाई वाला कुर्ता है, लखनऊ शैली में।",
};
export const FALLBACK_EN = {
  pottery: "Handmade blue pottery vase, crafted in the traditional Jaipur style.",
  weaving: "Hand-woven cotton dupatta featuring a traditional border design.",
  painting: "Madhubani-style painting, hand-made using natural pigments.",
  jewelry: "Traditional hand-carved silver earrings.",
  woodwork: "Hand-carved wooden box made from teak wood.",
  embroidery: "Hand-done Chikankari embroidered kurta, Lucknow style.",
};
export const FALLBACK_TITLE_EN = {
  pottery: "Blue Pottery Vase — Jaipur Style",
  weaving: "Hand-woven Cotton Dupatta",
  painting: "Madhubani Wall Art",
  jewelry: "Hand-carved Silver Earrings",
  woodwork: "Hand-carved Wooden Box",
  embroidery: "Chikankari Embroidered Kurta",
};
export const FALLBACK_TITLE_HI = {
  pottery: "नीली मिट्टी का फूलदान",
  weaving: "हाथ से बुना सूती दुपट्टा",
  painting: "मधुबनी पेंटिंग",
  jewelry: "चांदी की बालियां",
  woodwork: "लकड़ी का डिब्बा",
  embroidery: "चिकनकारी कुर्ता",
};
export const FALLBACK_CATEGORY = {
  pottery: "Home Decor", weaving: "Textile", painting: "Wall Art",
  jewelry: "Jewellery", woodwork: "Home Decor", embroidery: "Apparel",
};
export const CRAFT_MARGIN = { pottery: 1.4, weaving: 1.55, painting: 1.8, jewelry: 2.2, woodwork: 1.6, embroidery: 1.5 };
export const MARKET_TREND_INDEX = { pottery: 1.04, weaving: 0.98, painting: 1.1, jewelry: 1.02, woodwork: 0.96, embroidery: 1.05 };
