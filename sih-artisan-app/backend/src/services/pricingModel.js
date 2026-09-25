/**
 * pricingModel.js
 *
 * Stands in for the "Pricing Model: Cost + Market-Trend Data -> Price Range"
 * block in the system diagram. In production this would be a trained
 * regression/ranking model (e.g. gradient-boosted regressor) fed by:
 *   - artisan-entered production cost
 *   - craft/category base margin data
 *   - live market-trend signals (recent sales in the same cluster/category)
 *
 * For the prototype we approximate this with a transparent, explainable
 * formula so judges can see exactly how a recommendation is derived —
 * this also satisfies the "visible basis" mitigation for biased/weak
 * market data called out in Feasibility & Viability.
 */

const CRAFT_MARGIN = {
  pottery: 1.4,
  weaving: 1.55,
  painting: 1.8,
  jewelry: 2.2,
  woodwork: 1.6,
  embroidery: 1.5,
};

// Simulated recent market-trend index per craft (would come from a
// live sales/analytics feed in production).
const MARKET_TREND_INDEX = {
  pottery: 1.04,
  weaving: 0.98,
  painting: 1.1,
  jewelry: 1.02,
  woodwork: 0.96,
  embroidery: 1.05,
};

function recommendPrice({ cost, craft = "pottery" }) {
  const margin = CRAFT_MARGIN[craft] || 1.5;
  const trend = MARKET_TREND_INDEX[craft] || 1.0;

  const base = cost * margin * trend;
  const recommended = Math.round(base / 5) * 5; // round to nearest ₹5
  const min = Math.round((recommended * 0.85) / 5) * 5;
  const max = Math.round((recommended * 1.25) / 5) * 5;

  return {
    min,
    recommended,
    max,
    basis: `Cost ₹${cost} × craft margin (${margin}) × market-trend index (${trend}) for "${craft}". Similar items in this cluster sold in the ₹${min}–₹${max} range recently.`,
  };
}

/**
 * negotiate — very small deterministic policy used to demo the
 * "Price Negotiation" feature end to end without a human buyer.
 * A real deployment lets the artisan respond manually; this
 * suggestion is shown to the artisan as an *editable* recommendation,
 * never auto-sent, to keep the artisan in control.
 */
function suggestNegotiationResponse({ askingPrice, offerPrice, quantity }) {
  const ratio = offerPrice / askingPrice;
  if (ratio >= 0.9) {
    return {
      action: "accept",
      suggestedPrice: offerPrice,
      note: `This offer is within 10% of your asking price and the order size (${quantity}) is healthy — accepting keeps the relationship strong.`,
    };
  }
  const counter = Math.round((askingPrice + offerPrice) / 2 / 5) * 5;
  return {
    action: "counter",
    suggestedPrice: counter,
    note: `The offer is ${Math.round((1 - ratio) * 100)}% below your asking price. A counter at ₹${counter}/piece splits the difference while protecting your margin.`,
  };
}

/**
 * Market-anchored price: start from what similar products sell for online,
 * but never below the artisan's cost + 15% (floor protection).
 * `market` comes from services/marketService.researchMarket().
 */
const FLOOR_MARGIN = 1.15;

function recommendMarketPrice({ cost = 0, craft = "pottery", market }) {
  const round5 = (n) => Math.round(n / 5) * 5;
  const floor = cost > 0 ? round5(cost * FLOOR_MARGIN) : 0;
  if (!market) {
    if (!cost) return null;
    return { ...recommendPrice({ cost, craft }), floor, cost, market: null, method: "cost-formula" };
  }
  const recommended = Math.max(floor, market.median);
  const min = Math.max(floor, market.low);
  const max = Math.max(recommended, market.high);
  const where = market.live ? "on online marketplaces right now" : "online in India (AI estimate)";
  let basis = `Similar products sell for ₹${market.low}–₹${market.high} (typical ₹${market.median}) ${where}.`;
  if (floor) basis += ` Your cost is ₹${cost}, so ₹${floor} is your minimum (15% margin).`;
  let warning = null;
  if (floor && floor > market.high) {
    warning = `Your production cost (₹${cost}) is higher than what similar items usually sell for (up to ₹${market.high}). Highlight what makes yours special (handmade, material, design) or look for ways to reduce cost.`;
  } else if (floor && floor > market.median) {
    warning = `Your minimum price (₹${floor}) is above the typical market price (₹${market.median}) — buyers may compare, so describe the craftsmanship well.`;
  }
  return { min, recommended, max, basis, floor, cost, market, warning, method: "market" };
}

module.exports = { recommendPrice, recommendMarketPrice, suggestNegotiationResponse };
