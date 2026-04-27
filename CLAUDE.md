# Beta Feedback Collector

## What this is
A web app for a PM running a closed beta. Testers submit feedback through a form; the PM triages and prioritizes what they've said. Both users use the same URL — the page shows the submission form at the top and the triage list below.

Built as the demo project for a 90-minute Philly Tech Week workshop teaching PMs how to go from PRD to deployed prototype using Claude Code.

## Tech stack
- Vanilla HTML, CSS, JavaScript
- No frameworks, no build step, no package.json, no npm
- localStorage for data persistence (no backend, no database)
- Must be deployable as static files to Netlify drop

## Constraints
- No API calls to external services (no LLMs, no auth providers, no third-party APIs)
- No user login or accounts
- Must work when opened as index.html locally AND when deployed to a static host
- All code should be readable by a non-engineer PM with zero prior coding experience
- Desktop-first; no mobile-responsive requirement

## How we work together
- You are the lead engineer on this project. I am the PM.
- Before writing any code, summarize your plan for the current phase.
- Build in phases, not all at once. Wait for me to confirm a phase works before moving to the next.
- Keep files small and purposeful.
- When I ask you to implement something, implement only that thing. Do not scope-creep into adjacent features.
- Read docs/prd.md before you start. It is the source of truth for what we're building.
- If you notice something in the PRD that's ambiguous or contradictory, ask me before guessing.

## File structure I want
- index.html (entry point)
- styles.css (all styles)
- app.js (all logic)
- docs/ (reference, do not modify unless I ask)

Keep it this flat. We're optimizing for a beginner audience being able to see everything at a glance.

## Style / aesthetic
Linear or Notion aesthetic. Clean, light, professional. Restrained color palette. Comfortable spacing. Readable typography. This is a tool a PM would actually use at work, not a consumer toy.
