# Page Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a smooth page transition loader with SMKN 2 Indramayu logo, pulse/bounce animation, and "Memuat halaman..." text, integrated with React.lazy and Suspense.

**Architecture:** Create a `PageLoader` component, convert main pages in `frontend/src/App.tsx` or route configs to use `React.lazy` with `Suspense`, and handle session checks gracefully.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite.

## Global Constraints
- Use exact branding assets from `public/` (e.g., `/SMK_Negeri_2_Indramayu.png`).
- Respect `prefers-reduced-motion`.
- Accessibility: `role="status"`, `aria-live="polite"`.

---

### Task 1: Create `frontend/src/components/PageLoader.tsx`

**Files:**
- Create: `frontend/src/components/PageLoader.tsx`

**Steps:**
- [ ] **Step 1:** Write `frontend/src/components/PageLoader.tsx` with full-screen layout, centered logo, pulse/bounce animation, "Memuat halaman..." text, and accessibility attributes.
- [ ] **Step 2:** Verify build via `tsc --noEmit`.

### Task 2: Implement Lazy Loading and Suspense in `frontend/src/App.tsx`

**Files:**
- Modify: `frontend/src/App.tsx`

**Steps:**
- [ ] **Step 1:** Convert page imports to `React.lazy`.
- [ ] **Step 2:** Wrap routes in `<Suspense fallback={<PageLoader />}>`.
- [ ] **Step 3:** Run type-checking and build test.
