# Active Context (Smart Memory)

> **Agent Instruction**: This file is your "Short-term Memory". Read this FIRST before doing anything. 
> Update this file when you complete a major step or change the implementation plan.

## 1. Current Phase
**Status**: 🔵 Verification (Binder)
**Current Goal**: 
- User generates binding code on frontend.
- User sends code to LINE Bot (via Supabase Edge Functions).
- Verify successful binding between Supabase user and LINE ID.

## 2. Recent Decisions & Architecture
- **Tech Stack**: Vue 3 (Composition API), Supabase, Tailwind CSS, Vitest.
- **State Management**: Pinia (Setup Stores).
- **Style Rules**: 
  - Follow "Fitback" design (Modern, premium, cards, large border-radius).
  - Use `usePopupService` for all interactions (avoid local modal state).
  - "Double-click to confirm" pattern for critical actions (e.g., removing inventory).
- **Backend**: Supabase Edge Functions are used for scraping and notification logic.

## 3. Rules of Engagement (Agent MUST follow)
- **API Proxy**: 
  - Use `/api` for backend calls (proxied to Supabase/Edge Functions).
  - Use `/mops-api` for TWSE data (proxied to bypass CORS).
- **Axios Logic**: `src/api/index.js` has a response interceptor returning `response.data` automatically. **Do not** use `.data` again in component logic.
- **Language**: All comments, documentation, and user-facing text must be in **Traditional Chinese (zh-TW)**.
- **Verification**: Always run `npm run test:unit` after logic changes and `npm run build` after template changes.

## 4. Active Files (Working Set)
- `.specs/01_requirements.md` (Reference)
- `docs/SPEC.md` (Master Plan)
- `src/composables/usePopupService.js` (Core Interaction)

## 5. Todo Queue
- [x] Fix "Keep Supabase Alive" workflow.
- [x] Audit and update Agent Skills.
- [ ] Finalize LINE Bot binding verification flow.
- [ ] Implement robust scraper edge functions.
