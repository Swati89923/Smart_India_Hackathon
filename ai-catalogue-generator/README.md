# Module 03: Multilingual AI Catalogue & Story Generator (`ai-catalogue-generator/`)

## Overview
The **AI Catalogue & Story Generator** handles the transformation of the artisan's natural spoken words and product imagery into rich, market-ready, bilingual digital catalogues.

When an artisan describes their product in their native dialect (e.g., *"Yeh mitti ka diya humne haath se banaya hai, pure 3 ghante lage hain aur organic rang use kiya hai"*), this module transcribes the speech, extracts key craft attributes, and uses multimodal generative AI to produce both an evocative cultural heritage story and structured e-commerce product specifications.

---

## Directory Structure

```
ai-catalogue-generator/
├── README.md                          <-- Module architecture and prompt specifications
└── src/
    ├── ondc-schema/                   <-- E-commerce & ONDC taxonomy formatters
    │   └── .gitkeep                   <-- ONDC item schema, category codes, attribute mappings
    ├── prompts/                       <-- Multimodal prompt templates
    │   └── .gitkeep                   <-- Heritage storytelling prompts, technical attribute extractors
    ├── translation/                   <-- Vernacular translation & localization
    │   └── .gitkeep                   <-- Indic language localization (Hindi, Marathi, Tamil, etc.)
    └── voice-transcription/           <-- Speech-to-Text (ASR) adapters
        └── .gitkeep                   <-- Bhashini API integration, Whisper/Gemini audio speech adapters
```

---

## Key Responsibilities & AI Pipeline

1. **Regional Voice Transcription (ASR)**:
   - Accepts raw audio recordings from the mobile interface.
   - Leverages **Bhashini (National Language Translation Mission)** or **Gemini Multimodal Audio** to accurately transcribe regional Indian languages and code-mixed speech (Hinglish, etc.).

2. **Multimodal Craft Understanding**:
   - Analyzes both the **enhanced product photo** and the **transcribed audio story**.
   - Identifies craft discipline, raw materials (e.g., Terracotta clay, brass, mulberry silk, teak wood), technique, and cultural significance.

3. **Bilingual Catalogue Generation**:
   - **Artisan's Vernacular Language**: Clear, culturally resonant description so the artisan can verify and feel proud of their listing.
   - **Global English (E-Commerce & Export Standard)**: Catchy title, SEO-optimized keywords, emotive heritage story (*"Handcrafted with 300-year-old traditional techniques by master artisan..."*), material specifications, care instructions, and dimensions.

4. **ONDC & GeM Taxonomy Compliance**:
   - Automatically categorizes products according to Open Network for Digital Commerce (ONDC) retail category trees.
   - Formats metadata into standardized JSON schemas for instant multi-platform broadcasting.

---

## Planned Technologies & Models
- **AI Models**: Google Gemini 1.5 Flash / Pro (Multimodal Vision & Audio-Text Reasoning)
- **Speech Processing**: Bhashini ASR APIs (Indic Speech), Web Audio API
- **Schema Validation**: Zod / JSON Schema for ONDC item specifications
