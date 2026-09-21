# Module 04: AI Fair Pricing Engine (`ai-pricing-engine/`)

## Overview
The **AI Fair Pricing Engine** eliminates the pervasive problem of artisan undervaluation and middleman exploitation in the traditional handicraft supply chain.

Using a transparent, ethical cost-plus formula combined with market benchmark datasets and AI-powered negotiation guardrails, this module calculates a mathematically backed, fair price recommendation for every handcrafted piece.

---

## Directory Structure

```
ai-pricing-engine/
├── README.md                          <-- Mathematical specifications & pricing models
└── src/
    ├── benchmarks/                    <-- Market price datasets & regional indices
    │   └── .gitkeep                   <-- Craft price indices across Indian craft hubs (Jaipur, Varanasi, etc.)
    ├── guardrails/                    <-- Anti-exploitation & negotiation guardrails
    │   └── .gitkeep                   <-- Minimum floor price calculators & buyer offer validators
    └── models/                        <-- Core pricing algorithms
        └── .gitkeep                   <-- Cost-plus formula, skill-tier wage rates, margin rules
```

---

## Core Pricing Formula

The engine implements the ShilpSaathi Fair Price Equation:

$$\text{Base Cost} = \text{Raw Material Cost} + (\text{Labor Hours} \times \text{Hourly Wage Rate})$$

$$\text{Fair Retail Price} = \text{Base Cost} \times (1 + \text{Skill Multiplier} + \text{Complexity Factor}) + \text{Packaging \& Logistics}$$

### Pricing Components:
1. **Raw Material Cost**: Extracted from artisan voice description or catalog breakdown (e.g. clay, natural dyes, silk yarn, brass ingots).
2. **Artisan Labor & Skill Tier**:
   - Level 1 (Apprentice / Semi-skilled): ₹150 - ₹200 / hr
   - Level 2 (Skilled Craftsperson): ₹250 - ₹350 / hr
   - Level 3 (National / State Awardee / Master Artisan): ₹400 - ₹600+ / hr
3. **Heritage & Complexity Factor**: Intricate hand-painting (Madhubani, Pattachitra) or micro-engraving receives an authenticity markup (15% - 35%).
4. **Three Tier Pricing Bands**:
   - **Minimum Floor Price ($P_{\min}$)**: Strict break-even threshold below which sales cannot be discounted (protects artisan livelihood).
   - **Recommended Fair Price ($P_{\text{fair}}$)**: Optimum price balancing high buyer conversion with equitable earnings.
   - **Premium Listing Price ($P_{\text{list}}$)**: Initial listing price providing room for bulk order discounts and B2B negotiation.

---

## Negotiation Advisor Sub-System
During buyer interactions:
- Evaluates incoming buyer counter-offers against $P_{\min}$ and order volume.
- Automatically generates recommendation advice for the artisan:
  - **Green (Fair Deal)**: Accept offer (profit margin $\ge 25\%$).
  - **Amber (Negotiate)**: Suggest counter-offer (offer is between $P_{\min}$ and $P_{\text{fair}}$).
  - **Red (Exploitative)**: Warn artisan and suggest polite rejection (offer below $P_{\min}$).
