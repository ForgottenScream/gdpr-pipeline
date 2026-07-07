# GDPR Enforcement Decisions—Reproducible Extraction & Analysis Framework (Software)

## Overview
This project provides a reproducible software pipeline to:
- fetch enforcement decisions from multiple Data Protection Authorities (DPAs),
- standardize decision records into a common schema,
- extract structured fields from unstructured decision text using an LLM,
- validate extracted outputs against a manually annotated subset, and
- export machine-readable datasets for downstream analysis.

## Pipeline
1. **Collect**: retrieve cases from configured DPAs.
2. **Normalize**: convert heterogeneous source formats and metadata into a canonical case format.
3. **Extract**: run LLM-based structured extraction to produce machine-readable fields per case.
4. **Validate**: evaluate extraction quality using a manually annotated subset and compute metrics.
5. **Export**: write standardized, analysis-ready artifacts (e.g., JSONL/CSV).

## Repository (typical components)
- **Fetchers/Collectors**: download or scrape enforcement decisions/case pages for supported DPAs.
- **Normalization**: map source-specific fields into a canonical schema and produce normalized records.
- **LLM Extraction**: structured extraction (schema-driven) from normalized unstructured text.
- **Validation**: run comparisons against a human-annotated subset; produce validation reports/metrics.
- **Dataset Export**: persist intermediate and final outputs in machine-readable formats.

## Setup
1. Clone the repository.
2. Setup Netuno, PostgreSQL and Install dependencies (tesseract ocr)
3. Configure _development.json:
   - LLM API key

## Future work (implementation)
- Expand coverage by adding fetchers/normalization rules for additional DPAs and increasing extraction/validation coverage accordingly.
