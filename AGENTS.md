# Goal Keeper — Repository Guidance

## Product intent

Build a calm, local-first desktop application that helps one person turn meaningful goals into concrete next actions and review progress without unnecessary complexity.

The product language is Russian by default. Keep user-facing copy short, supportive, and neutral. Avoid guilt-inducing language, streak pressure, gamification, and productivity jargon.

## MVP outcome

The MVP is successful when a user can complete this loop entirely offline:

1. Create a goal.
2. Define its desired outcome and optional target date.
3. Break it into milestones and small actionable steps.
4. See unfinished steps that matter now.
5. Mark steps complete and immediately see goal progress update.
6. Review, edit, archive, or restore the goal later.

## MVP scope

### Goals

- Create, view, edit, archive, and restore a goal.
- Required field: title.
- Optional fields: description, area/category, target date, and accent color.
- Statuses: `active`, `completed`, and `archived`.
- Progress is derived from completed actionable steps; do not ask the user to maintain a second manual percentage.

### Milestones and steps

- A goal may contain ordered milestones.
- A milestone contains ordered actionable steps.
- A step has a title, completion state, and optional due date.
- Users can add, edit, delete, reorder, complete, and reopen milestones and steps.
- Completing or reopening a step updates all derived progress immediately.

### Core views

- **Today:** overdue and due-today unfinished steps, with a quick-complete action.
- **Goals:** active goals with progress, target date, and the next unfinished step.
- **Goal details:** goal summary, milestones, steps, progress, and editing actions.
- **Archive:** archived and completed goals with restore support.

### Local persistence

- The app works without an internet connection or account.
- User data survives app restarts and application updates.
- Store data in a documented local application-data location.
- Destructive actions require confirmation or a clear undo path.

### Essential states

- Provide intentional empty, loading, validation-error, and unexpected-error states.
- Keyboard navigation and visible focus are required for primary flows.
- Dates must be displayed in the user's locale and stored in an unambiguous format.

## Explicitly out of scope for MVP

- Authentication, accounts, cloud sync, and collaboration.
- Mobile and web clients.
- AI coaching or automatic goal generation.
- Notifications, recurring habits, streaks, social sharing, and achievements.
- Attachments, comments, calendar integrations, and third-party integrations.
- Complex analytics, custom dashboards, themes beyond system light/dark support, and plugin systems.

Do not add out-of-scope features opportunistically. Capture promising ideas in project documentation for a later milestone instead of expanding the current change.

## Provisional technical direction

Until the repository adopts a different stack through an explicit decision record, prefer:

- Tauri 2 for the desktop shell.
- React and TypeScript for the UI.
- Vite for local development and bundling.
- SQLite for durable local data.
- A small, explicit data-access boundary between UI code and persistence.

Treat this direction as a default, not permission to scaffold or install dependencies without first checking the current repository state and task scope.

## Domain rules

- Use stable opaque IDs for persisted entities.
- Persist timestamps in UTC; convert only at the presentation boundary.
- Preserve user data across schema changes with versioned, forward-only migrations.
- Keep progress calculation in one tested domain function.
- Archiving is reversible. Permanent deletion is a separate, explicit action.
- A completed goal may be reopened without losing its milestones or steps.
- Sorting must be deterministic and persisted when the user reorders items.

## UX principles

- Optimize the default path for one-handed, low-friction daily use.
- Prefer one obvious primary action per screen.
- Use progressive disclosure: show planning detail when requested, not everywhere.
- Never rely on color alone to communicate state.
- Keep dialogs focused and preserve entered data when validation fails.
- Avoid celebratory interruptions; use subtle confirmation feedback.

## Engineering expectations

- Inspect existing code, configuration, and nearby conventions before editing.
- Keep changes narrow and avoid unrelated refactors.
- Prefer simple domain modules over premature abstraction or global state.
- Validate data at persistence and process boundaries, not only in UI forms.
- Keep platform-specific operations behind the desktop boundary.
- Do not introduce telemetry or send user data over the network in the MVP.
- Never commit secrets, generated build output, local databases, or user data.
- Update documentation when product behavior, setup, architecture, or storage location changes.

## Testing expectations

For every behavior change, add or update the smallest relevant automated test.

Prioritize coverage for:

- progress calculation;
- goal status transitions;
- milestone and step ordering;
- date and overdue classification;
- persistence migrations and round trips;
- the create-goal and complete-step happy paths.

Before handing off a change, run the repository's available formatter, type checker, tests, and production build. If a check cannot run, state exactly why and what remains unverified.

## Definition of done

A change is done when:

- its user-visible behavior matches the MVP scope and Russian product copy conventions;
- important edge cases and failure states are handled;
- persisted data remains backward compatible or has a tested migration;
- relevant automated checks pass;
- no secrets, local user data, or unrelated edits are included;
- documentation is updated when the change alters setup, architecture, or behavior.

## Decision discipline

- Prefer reversible choices while the MVP is being validated.
- Record durable architecture or product decisions in `docs/decisions/` when that directory exists.
- When requirements are ambiguous, choose the smallest behavior that completes the core user loop and note the assumption in the handoff.
- Ask before making a choice that materially changes the product model, storage guarantees, privacy posture, or supported platforms.

## Code review rules

- Flag any path that can silently lose or overwrite goals, milestones, or steps.
- Flag progress values stored independently from their source steps unless there is a documented reconciliation strategy.
- Flag network calls, telemetry, or external data transfer introduced into the local-only MVP.
- Flag destructive actions that lack confirmation or an undo path.
- Flag date logic that depends on implicit timezone parsing.
