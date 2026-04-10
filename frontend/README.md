# Insurance claim orchestrator — frontend (demo)

Next.js 14 (App Router) UI for the **ADK build plan v2** insurance flow: claim submission, batch JSON intake, results dashboard, and per-claim explainability (timeline, agent JSON, React Flow diagram).

**All pipeline behavior is mocked in the browser.** There is no FastAPI backend, no ADK agents, and no real `/process-claim` calls.

## Run locally

```bash
cd orchestrator/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing and navigation |
| `/submit` | Single claim form (Zod + React Hook Form), optional image URL or file |
| `/submit/batch` | JSON array upload, row validation, mock batch + export results |
| `/results` | Filter/sort table, batch summary after a batch run |
| `/results/[claimId]` | Detail: summary, timeline, customer message, image, diagram, accordions |

## Mock scenarios (deterministic)

The mock pipeline picks a scenario from your inputs:

- **Missing documents** → pending / completeness path  
- **Past claims ≥ 5 and amount ≥ ₹50,000** → fraud rejection  
- **Third-Party** + own-damage wording → coverage rejection  
- **Text mentions airbag / crumple / mismatch** → image–text pending style outcome  
- **Otherwise** → clean approval (≈ ₹19,500)

## Stack

TypeScript, Tailwind CSS, Zod, React Hook Form, Radix Accordion, Lucide, React Flow. Typography: **Figtree** + **Fraunces** (Google Fonts).
