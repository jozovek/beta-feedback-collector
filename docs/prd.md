# Product Requirements Document
# Beta Feedback Collector — Product Requirements

## Problem
I'm a PM running a closed beta with 15-30 testers. Right now, feedback comes in across Slack DMs, email, and text messages. I can't see patterns, I lose context, and I'm reconstructing what testers are saying from memory before every design review. I need a single place testers can submit feedback, and a single place I can triage and prioritize what they've said.

## Users
This app has two users with two different jobs.

**Testers** submit feedback. They open the app, fill out a form, and leave. They never see anyone else's feedback. Their job is to log what they noticed, as easily as possible.

**Me (the PM)** triage. I open the app to scan what's come in, filter to the category I care about, and set priority order so I know what to bring to the design review. I don't submit feedback through this app.

Both users land on the same URL. The page shows the submission form at the top and the triage list below. Testers use the form and ignore the list. I ignore the form and use the list.

## Core features (MVP)

### 1. Submit feedback (tester-facing)
A form at the top of the page with:
- **Short title** (required, text input, ~80 char limit). Placeholder: "Button to submit was hard to find"
- **Full description** (optional, textarea). Placeholder: "If you want to say more, add it here."
- **Theme** (required, dropdown). Options: Bug, Usability/UX, Feature Request, General Reaction
- **Your name** (required, text input). No anonymous submissions — I want to be able to follow up.
- **Submit button**

On submit: save to localStorage, clear the form, show a brief confirmation ("Thanks! Your feedback was logged."), and the new item appears at the bottom of the triage list below.

### 2. Triage list (PM-facing)
Below the form, a list of all submitted feedback. Each row shows:
- Up/down arrow buttons on the left to reorder (▲ moves up, ▼ moves down)
- The short title
- The theme as a colored pill/badge
- The tester's name
- Relative time ("2 hours ago")

Clicking a row expands it in place to reveal the full description (if the tester provided one) and collapses it on a second click. If there's no full description, clicking the row does nothing or shows a subtle "No additional detail."

New submissions appear at the bottom of the list. The PM's manually-set priority is preserved when new items arrive.

### 3. Theme filter
Above the triage list, a row of clickable filter buttons: All, Bug, Usability/UX, Feature Request, General Reaction. Clicking one filters the list to only that theme. The active filter is visually distinct. "All" is the default state.

When filtered to a theme, the up/down arrows still work — they reorder items within the globally-ranked list, but only the matching items are visible.

### 4. Priority persistence
There is one priority order, used globally. Filtering hides items but doesn't change their rank. The priority order persists across page refreshes (localStorage). When a new item is submitted, it's appended to the end of the priority order.

## Done definition for today
- Testers can open the URL, submit feedback, and see a confirmation.
- The PM can open the same URL, see all submissions, filter by theme, expand items to read full descriptions, and reorder with up/down arrows.
- Reordering persists across refreshes.
- The app is deployable as static files to Netlify drop.
- The app looks clean and professional — not polished, but not embarrassing. Linear/Notion aesthetic.

## Out of scope for today
- Drag-and-drop reordering (we're using up/down buttons instead; drag-and-drop is a documented follow-up)
- Editing or deleting submitted feedback
- Separate tester and PM views (both see the same page)
- Login, accounts, or authentication
- Exporting feedback (CSV, etc.)
- Backend or database (localStorage only)
- AI auto-tagging of themes
- Mobile-responsive design (desktop-first)
- Search
- Notifications when new feedback arrives
- Priority rank displayed as a number on each item

## Style / vibe
Clean, light, professional. Linear or Notion aesthetic. This is a tool I'd actually use at work, not a consumer toy. Theme pills should be color-coded but restrained — no rainbow. Comfortable spacing. Readable typography.

## Why up/down arrows instead of drag-and-drop
Drag-and-drop in vanilla JS has a long tail of edge cases that aren't worth debugging in a workshop setting. Up/down arrows are trivially implementable, cannot fail in confusing ways, and make the underlying data model (reordering is array manipulation) visible to a beginner audience. A real production version of this app would swap in a drag-and-drop library, and that's a ~20-minute upgrade we can demo as a follow-up.
