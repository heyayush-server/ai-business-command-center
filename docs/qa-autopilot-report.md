# QA Autopilot Report

**Last updated:** 2026-10-05  
**Scope:** staged user-workflow QA for AI Business Command Center, with emphasis on create-lead access, CRM navigation, demo isolation, RAG/approval boundaries, and regression health.

## Stage 1 - Access And Create-Lead Entry

- `VERIFIED`: Unauthenticated navigation to `/leads` redirects to `/login?redirectTo=%2Fleads`.
- `FIXED`: Login in a local/offline Supabase environment previously showed `fetch failed` instead of entering the repository's dev-session fallback, blocking the create-lead workflow before the user could reach CRM screens. `lib/actions/auth.ts` now treats Supabase auth API `fetch failed` responses the same as thrown network failures and creates the local `dev_session` fallback.
- `VERIFIED`: The no-login `/demo` route remains isolated from production data and is available from the login screen.

## Stage 2 - Security And Boundaries

- `VERIFIED`: The no-login demo uses deterministic local sample data and does not call production mutation APIs.
- `VERIFIED`: RAG RPC hardening migration `00025_harden_knowledge_rpc.sql` exists and requires explicit authorized organization context.
- `NOT VERIFIED`: Live Supabase auth, real database writes, live RAG upload/retrieval, and Gemini live calls require reachable configured external services.

## Stage 3 - Regression Status

- `VERIFIED`: `npm run lint` passed after the auth fallback fix.
- `VERIFIED`: `npx tsc --noEmit` passed after the auth fallback fix.
- `VERIFIED`: `npm test` passed after the auth fallback fix: 16 test files, 198 tests.
- `VERIFIED`: `npm run build` passed after the auth fallback fix. `/demo`, `/login`, and public pages prerender successfully; protected app pages remain dynamic.
- `KNOWN LIMITATION`: Browser create-lead completion cannot be truthfully marked live-verified until the app can authenticate into either a live Supabase workspace or the local dev fallback on the running server.
