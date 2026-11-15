# Task 1 Brief: Create src/components/PageLoader.tsx

## Requirements
- Create `src/components/PageLoader.tsx`.
- Must render a full-screen layout (`fixed inset-0`) with centered logo and text.
- Use image `/SMK_Negeri_2_Indramayu.png` from `public/`.
- Text under logo: "Memuat halaman...".
- Animation: pulse/bounce using Tailwind CSS classes (`animate-pulse` or `animate-bounce`).
- Respect `prefers-reduced-motion` (e.g. `motion-reduce:animate-none`).
- Accessibility: `role="status"`, `aria-live="polite"`.
- Support flick-prevention logic using delay (shows loader after ~150ms delay, and if shown, stays for ~400ms min, or standard straightforward component if wrapped in delay hook).

## Report Contract
Write report to `.superpowers/sdd/2026-11-15-page-loader-implementation/task-1-report.md`.
