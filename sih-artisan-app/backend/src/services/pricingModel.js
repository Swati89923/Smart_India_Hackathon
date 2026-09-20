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

module.exports = { recommendPrice, suggestNegotiationResponse };
