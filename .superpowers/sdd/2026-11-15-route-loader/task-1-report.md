# Task 1 Report: RouteLoader Component

## Status
DONE

## Changes
- Created `src/components/RouteLoader.tsx` to monitor route changes using `useLocation`.
- Implemented 400ms loading state when location changes.
- Integrated `RouteLoader` in `src/App.tsx` within `BrowserRouter`.

## Verification
- `tsc --noEmit` run: No new errors in `src/components/RouteLoader.tsx` or `src/App.tsx`.
- Existing type errors in other files remain.

## Concerns
- Existing codebase has significant type errors that unrelated to this task.
- `PageLoader` has a default delay (150ms). If `RouteLoader` sets a timer for 400ms, and `PageLoader` also delays 150ms, the total time might be slightly longer or jittery. Passed `delay={0}` to `PageLoader` to ensure immediate showing.
