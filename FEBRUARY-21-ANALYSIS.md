# February 21 Analysis: Analytics & Observability Pipeline

## Overview
This document breaks down the implementation of the MVP-14 Analytics pipeline for the Matter Protocol. The goal is to provide a low-latency, "fire-and-forget" mechanism to track user engagement with `.thing` objects via the Lens Extension and Shadow Index API.

## 1. Extension Hooks (Frontend)

### Background Script (`background.js`)
- **`sendEvent` Utility**: A robust, asynchronous function that forwards event payloads to the Shadow Index API. It handles its own errors to avoid disrupting the main extension logic.
- **Message Listener**: Listen for `analytics:event` messages from content scripts and dispatches them to the API.

### Content Script (`content.js`)
- **`fireAnalyticsEvent` Utility**: A helper to send messages to the background script.
- **`view` Events**: Triggered immediately after the Matter overlay is successfully rendered on a host page.
- **`click` Events**: Triggered when a user interacts with the primary Call-to-Action (CTA) or other key UI elements.

## 2. API Ingestion (Backend)

### Endpoint: `POST /v1/analytics/event`
- **Discriminated Union Validation**: Uses Zod to enforce strict schemas for different event types (`view` vs `click`). This ensures data integrity at the edge.
- **Storage Strategy (JSONL)**:
    - Events are stored in `data/events/YYYY-MM-DD.jsonl`.
    - **JSON Lines (JSONL)** was chosen over a relational database to minimize write latency and simplify the aggregation process (sequential file reads).
    - **High Performance**: Uses `fs.appendFile` for atomic-like append operations.

### Schema Details
- **Common Fields**: `event` (type), `hash` (64-char SHA-256), `timestamp` (ISO-8601), `source_url`.
- **View Specific**: Optional `anon_id`.
- **Click Specific**: Required `target_action` (enum).

## 3. Security & Privacy
- **`.gitignore`**: Log files in `data/events/` are explicitly ignored to prevent accidental leakage of engagement data in the source repository.
- **Anonymization**: Support for `anon_id` allows for session tracking without requiring PII.

## 4. Verification
- **Test Suite**: Created `packages/shadow-index/api/analytics.test.ts` with 4 comprehensive tests:
    1. Valid `view` event ingestion.
    2. Valid `click` event ingestion.
    3. Rejection of invalid event types.
    4. Rejection of malformed hashes.
- **Result**: 4/4 tests passing in the Shadow Index environment.
