# Support Workflow — Beta Program

**Sprint 5**  
**Purpose:** Triage, response templates, and escalation for beta user support  
**Owner:** CTO / Support lead

---

## 1. Triage Process

| Priority | Criteria | Response SLA |
|----------|----------|--------------|
| **P1 Critical** | API down, data loss, security issue | 4 hours |
| **P2 High** | Blocking integration, extension broken | 24 hours |
| **P3 Normal** | Non-blocking bugs, feature questions | 48 hours |
| **P4 Low** | Documentation, enhancement requests | 1 week |

**Triage steps:**
1. Assign priority from table above.
2. Tag: `api`, `extension`, `docs`, `billing`, `other`.
3. Route: CTO for technical; CEO for biz/partnership.
4. Log in [BETA-USER-LIST.md](./BETA-USER-LIST.md) or issue tracker.

---

## 2. Template Responses

### API Key Request

```
Subject: API Key — .things that Matter

Hi [Name],

Thank you for your interest in .things that Matter. Your API key is attached below. Please store it securely and never commit it to version control.

Key: [REDACTED — send separately or via secure channel]

Quick start:
- Documentation: [link to BETA-USER-ONBOARDING.md]
- Compile: POST /compile
- Batch: POST /catalog/import

If you have questions, reply to this email or open an issue on GitHub.

Best,
[Team]
```

### 401 Unauthorized

```
This usually means:
1. Missing header: Add x-api-key: YOUR_KEY or Authorization: Bearer YOUR_KEY
2. Invalid key: Verify the key was copied correctly (no extra spaces)
3. Revoked key: Contact us for a new key if yours was rotated

See: docs/BETA-USER-ONBOARDING.md #Common Issues
```

### 429 Rate Limit

```
The API limits requests per minute per IP (default: 100). Options:
1. Implement exponential backoff and retry
2. Batch requests where possible (POST /batch, POST /catalog/import)
3. Contact us if you need a higher limit for your use case
```

### Extension Not Loading

```
Ensure you have:
1. Chrome 88 or later
2. Developer mode enabled (chrome://extensions)
3. Loaded the unpacked extension from packages/lens-extension (run npm run build first)
4. No conflicting extensions blocking matter://

If the issue persists, share your Chrome version and any console errors.
```

### Matter:// Link Not Resolving

```
Check:
1. Lens extension is installed and enabled
2. You clicked the link (not right-click/open in new tab — some browsers handle protocols differently)
3. The hash is valid (64 hex chars)
4. The API is reachable (default: localhost:3000 for local dev)

For production: ensure your API URL is configured in the extension.
```

---

## 3. Escalation

| Escalate to | When |
|-------------|------|
| **CTO** | Technical bugs, API issues, extension defects |
| **CEO** | Partnership, pricing, roadmap questions |
| **External** | Legal, compliance (document and defer) |

---

## 4. FAQ Additions

Add recurring questions here; promote to [BETA-USER-ONBOARDING.md](./BETA-USER-ONBOARDING.md) when stable.

| Question | Answer |
|----------|--------|
| How do I get an API key? | Request from your beta coordinator. See BETA-USER-ONBOARDING §1. |
| What CSV format for catalog import? | Header: title, price, currency (optional: image_url, checkout_url). See sample-catalog.csv. |
| Is there a production API? | Beta staging available. Production URL shared upon request. |
| When is the Chrome Web Store release? | Planned for Sprint 6–7. Beta users can load unpacked until then. |

---

*Document: SUPPORT-WORKFLOW.md. Sprint 5.*
