# Decisio

**AI Decision Engine for Business Data — PS 04**

Decisio turns raw business data into evidence-backed decisions. The prototype follows the deck's flow: upload data → ask a natural-language business question → compute evidence → simulate a decision → stress-test assumptions.

## Live demo
https://decisio.onrender.com

## What works
- CSV upload and deterministic analytics
- Revenue by region
- Profit margin by category
- Transparent price-change simulator
- Evidence table tied to computed aggregates
- Reliability guard for unsupported questions
- Responsive judge-friendly interface
- Demo retail dataset

## Architecture
The submission deck describes a Next.js/React interface, FastAPI API layer, Pandas/DuckDB computation, evidence layer, simulator, LLM explanation layer and validation guard. This repository contains the deployable browser prototype of that experience; deterministic analytics are usable without an API key.

## Local run
Open `index.html` directly, or serve the folder with any static HTTP server.

## Submission
Problem Statement: **PS 04 - AI Decision Engine for Business Data**  
Project: **Decisio**
