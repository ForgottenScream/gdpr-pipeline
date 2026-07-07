# GDPR Enforcement Decisions—Reproducible Extraction & Analysis Framework (Software)

## Overview
This project provides a reproducible software pipeline to:
- fetch enforcement decisions from multiple Data Protection Authorities (DPAs),
- standardize decision records into a common schema,
- extract structured fields from unstructured decision text using an LLM,
- visualize structured data with visual diagrams using D3.js
- export machine-readable datasets for downstream analysis.

## Pipeline
1. **Collect**: retrieve cases from configured DPAs.
2. **Normalize**: convert heterogeneous source formats and metadata into a canonical case format.
3. **Extract**: run LLM-based structured extraction to produce machine-readable fields per case.
4. **Visualize**: Showcase data with D3.js graphs to better understand the
   analysis.
5. **Export**: write standardized, analysis-ready artifacts (e.g., JSONL/CSV).

## Setup
1. Clone the repository.
2. Setup Netuno, PostgreSQL and Install dependencies (tesseract ocr)
3. Configure _development.json:
   - LLM API key

## Future work (implementation)
- Expand coverage by adding fetchers/normalization rules for additional DPAs and increasing extraction/validation coverage accordingly.
