# Always-On Page Loader on Route Change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the PageLoader appears on every route change (navigation) rather than only on the initial lazy chunk loading.

**Architecture:** Create a `RouteLoader` component that listens to `useLocation()` changes from `react-router-dom`, showing the `PageLoader` briefly during transitions.

**Tech Stack:** React, React Router DOM, Tailwind CSS.

## Tasks

### Task 1: Create RouteLoader Component
- **Files:** Create `src/components/RouteLoader.tsx`
- **Steps:**
  - Listen to `useLocation()`.
  - Trigger loading overlay on path change with a short minimum duration.
  - Render `PageLoader` when loading.

### Task 2: Integrate into App Router
- **Files:** Modify `src/App.tsx`
- **Steps:**
  - Place `<RouteLoader />` inside `<BrowserRouter>`.
