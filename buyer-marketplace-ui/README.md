# Module 05: Buyer Marketplace & Negotiation UI (`buyer-marketplace-ui/`)

## Overview
The **Buyer Marketplace & Negotiation UI** connects conscious consumers, interior designers, and B2B boutique buyers directly with verified rural Indian artisans without intermediaries or commission gouging.

This interface prioritizes **transparency, craft authenticity, and direct human connection**, allowing buyers to appreciate the story and effort behind every handmade creation.

---

## Directory Structure

```
buyer-marketplace-ui/
├── README.md                          <-- UI architecture and design guidelines
└── src/
    ├── components/                    <-- Specialized marketplace UI components
    │   └── .gitkeep                   <-- PriceBreakdownModal, ArtisanStoryPlayer, ProvenanceBadge
    ├── navigation/                    <-- Buyer navigation stack and tab bar
    │   └── .gitkeep                   <-- BuyerNavigator, TabBar
    ├── negotiation/                   <-- Real-time negotiation & chat UI
    │   └── .gitkeep                   <-- OfferCounterBox, NegotiationThread, DealClosedBanner
    └── screens/                       <-- Core buyer screens
        └── .gitkeep                   <-- MarketplaceHome, CraftDetails, EnquiriesList, ChatView, Cart
```

---

## Key Features & Screen Flows

1. **Authentic Craft Discovery**:
   - Curated feed organized by Geographical Indication (GI) tags, craft hubs (Jaipur blue pottery, Channapatna toys, Banarasi weave), and artisan collectives.
   - Smart search and filters (Material, Craft Origin, Price Range, Verified Pehchan ID).

2. **Immersive Product Details**:
   - High-resolution studio-enhanced imagery with pinch-to-zoom for craft intricacy.
   - **Artisan Voice Player**: Hear the artisan describe their craft in their native tongue with real-time translated subtitles.
   - **Transparent Cost Breakdown**: An interactive card showing conscious consumers the honest cost allocation (Raw Materials, Artisan Labor Hours, Fair Profit, Eco-Packaging).
   - **Artisan Provenance Card**: Pehchan ID badge, artisan village origin, awards, and years of master experience.

3. **Direct 2-Way Negotiation Chat**:
   - Buyers can make direct inquiries, request custom dimensions, or propose bulk order counter-offers.
   - Built-in price offer slider with instant AI fair-price benchmark feedback.
   - Threaded conversation showing order details, revised quotes, and final acceptance buttons.

4. **Transparent Checkout**:
   - Direct payment with zero intermediary commissions.
   - Order confirmation and shipping tracking linked with India Post / ONDC logistics partners.

---

## Planned Technologies
- **UI Framework**: React Native (Expo) / Modern Web Frontend
- **Design Language**: Modern warm minimalism with artisanal textures and rich editorial typography
- **State & Real-time**: WebSockets / SSE for live negotiation chat updates
