# Module 01: Image Enhancement Engine (`image-enhancement/`)

## Overview
The **Image Enhancement Engine** is the first stage in the ShilpSaathi 7-step pipeline (*Capture -> **Enhance** -> Voice -> Catalogue -> Price -> Publish -> Connect*).

Rural Indian artisans often capture photos of their handcrafted products under suboptimal conditions (poor ambient lighting, cluttered workshops, harsh shadows, low-resolution phone cameras). This module transforms raw phone camera photos into studio-grade e-commerce product imagery ready for national and global marketplaces like ONDC and GeM.

---

## Directory Structure

```
image-enhancement/
├── README.md                          <-- Module architecture and technical specification
├── src/
│   ├── algorithms/                    <-- Enhancement algorithms
│   │   └── .gitkeep                   <-- Background removal, color balance, HDR, lighting
│   ├── pipelines/                     <-- End-to-end processing pipeline
│   │   └── .gitkeep                   <-- Multi-stage image pipeline & queue management
│   └── presets/                       <-- Craft-specific lighting & enhancement presets
│       └── .gitkeep                   <-- Presets for terracotta, brassware, textiles, pottery
└── tests/                             <-- Visual regression & quality benchmark tests
    └── .gitkeep                       <-- Test images (raw vs enhanced)
```

---

## Technical Responsibilities

1. **Automatic Lighting Optimization**:
   - Analyzes histogram and exposure levels.
   - Adjusts mid-tone luminance without washing out intricate craft details (e.g., fine embroidery, brass engraving).

2. **Background Cleaning & Segmentation**:
   - Distinguishes the artisanal object from rustic or cluttered workshop backgrounds.
   - Generates pure studio white, neutral gray, or contextually aesthetic backdrop variants.

3. **Shadow Normalization**:
   - Softens harsh direct sunlight shadows while preserving natural grounding drop-shadows to keep the product realistic.

4. **Edge & Texture Preservation**:
   - High-frequency edge preservation ensuring natural handloom thread patterns and clay textures remain sharp.

---

## Input / Output Specification

- **Input**:
  - Raw image file (`.jpg`, `.jpeg`, `.png`, `base64`)
  - Craft category hint (`textile`, `pottery`, `metalware`, `woodcraft`, `jewelry`)
  - Target output resolution (default: `1080x1080` square for e-commerce standards)
- **Output**:
  - Enhanced image buffer / URL
  - Image quality score (0 - 100)
  - Processing metadata (exposure adjustment, contrast ratio, background mask status)

---

## Planned Technologies & Libraries
- **Client/Edge**: Canvas API, React Native Image Manipulator, OpenCV Mobile (future)
- **Cloud/AI**: Sharp / Jimp (Node.js processing), Segment Anything / Rembg (background removal), Google Gemini 1.5 Flash (visual defect detection & quality evaluation)
