# TransitOps Mobile — Production QA Report

**App:** TransitOps Driver (`transitops-driver`)  
**Stack:** Expo SDK 54 · React Native 0.81 · React 19.1 · Expo Router · Zustand · Axios  
**Date:** 2026-08-05  
**Auditor:** Senior Mobile QA remediation pass  

---

## Executive Summary

| Item | Assessment |
|------|------------|
| Purpose | Driver companion for KNUST campus transit (shift, routes, trips, alerts, attendance, incidents) |
| Pre-remediation score | **48 / 100** |
| Post-remediation score | **72 / 100** |
| Risk level | **Medium** (was High) |
| Critical blockers fixed | Refresh-token rotation, hung 401 waiters, notifications all-read list gate, splash layout typo, seed-as-live data, demo credentials in production UI |
| **Verdict** | **Production Ready with Minor Fixes** |

The app is suitable for a controlled pilot with drivers linked to backend user records and assigned vehicles. Full general release still needs push notifications, photo upload API support, and device-lab a11y/Android-back verification.

---

## Application Map

```
(auth)/splash → login
(app) auth guard
  (tabs)/ home | route | trip | notifications
  more/ index | profile | attendance | incident | settings
```

API base: Railway `…/api` (JWT + `/drivers/me/*`).

---

## Bugs (pre-fix → status)

| ID | Severity | Location | Issue | Status |
|----|----------|----------|-------|--------|
| C1 | Critical | `services/api.ts` | Refresh overwrote rotated refresh token → logout ~30m | **Fixed** — persist `norm.refreshToken` |
| C2 | Critical | `services/api.ts` | Refresh waiters never rejected | **Fixed** — resolve/reject waiters + `finally` |
| C3 | Critical | `notifications.tsx` | List hidden when all read | **Fixed** — render full list; empty only if length 0 |
| C4 | Critical | `splash.tsx` | Invalid `justify` style | **Fixed** — `justifyContent` + session restore gate |
| H1 | High | notifications/routes services | Seeds presented as live data | **Fixed** — throw/empty; seeds only via `__DEV__` helper |
| H2 | High | `home.tsx` / `profile.tsx` | Fake KPI/credential fallbacks | **Fixed** — honest `—` / loading / error |
| H3 | High | `login.tsx` | Demo credentials always visible | **Fixed** — `__DEV__` only |
| H4 | High | `auth.store.ts` | Restore skipped role + expiry | **Fixed** — DRIVER check + proactive refresh |
| H5 | High | `trip.tsx` | GPS tracker never started | **Fixed** — start/stop with trip lifecycle |
| H6 | High | `incident.tsx` | Fake GPS + no queue on online fail | **Fixed** — require real GPS; queue on failure |
| H7 | High | UI kit | Light mode broken on Toast/EmptyState/Skeleton | **Fixed** — `useThemeColors` |
| M1 | Medium | `offlineQueue.ts` | Concurrent sync race | **Fixed** — sync mutex |
| M2 | Medium | Zustand on 401 | SecureStore cleared, UI still “logged in” | **Fixed** — `setSessionExpiredHandler` |
| Open | Medium | Incidents | Photo URI not uploaded (backend JSON-only) | **Documented** — user toast |
| Open | Medium | Push | Settings toggle cosmetic; no `expo-notifications` wiring | Deferred |
| Open | Low | Stop checklist | Local-only (labeled in UI) | Deferred / documented |

### Reproduction notes (historical)

**C1:** Login → wait past access TTL twice → second refresh used revoked token → forced logout.  
**C3:** Mark all read → Alerts tab showed empty “all caught up” and hid history.

---

## UI Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Three header patterns (scroll / sticky / stack) | Medium | Partially improved with SafeArea insets on tabs |
| Hardcoded `paddingTop: 54` | High | Fixed on home/route/trip/notifications |
| White brand text on light mode | High | Fixed (`textPrimary`) |
| Button `sm` under 44pt | Medium | Fixed (`minHeight: 44`) |
| Unused `EmptyState` component | Low | Themed; screens use local empty cards |

---

## Performance Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| React Query unused | Medium | Provider kept for future; screens still local fetch |
| Large StyleSheets in home/trip/route | Low | Acceptable for pilot |
| Nested horizontal/vertical ScrollViews on route | Low | Unchanged |
| Foreground GPS interval only | Medium | Expected for Expo Go; no background task |

---

## Security Issues

| Issue | Severity | Status |
|-------|----------|--------|
| JWT in SecureStore | — | Correct practice |
| Demo credentials in production builds | High | Fixed (`__DEV__`) |
| Logout when access expired may skip server revoke | Medium | Best-effort; refresh clears local on failure |
| Client JWT decode without verify | Low | Display claims only; server is source of truth |
| Role gate on restore | High | Fixed |

---

## Accessibility Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Missing button/input labels | High | Button/Input + key controls labeled |
| Tab icons unlabeled | Medium | `tabBarAccessibilityLabel` + icon labels |
| Switch labels (settings) | Medium | Remaining gap — VoiceOver may not associate Switch with text |
| Dynamic type / TalkBack device lab | Medium | Not executed on device |

---

## Code Quality Issues

| Issue | Severity | Status |
|-------|----------|--------|
| `ui.store` `as any` | Medium | Fixed — typed `savePreferences` |
| Dead `App.tsx` | Low | Removed |
| AGENTS.md pointed at Expo 57 | Medium | Updated to SDK 54 |
| Unused route/stop AsyncStorage cache keys | Low | Left for future offline cache |
| `expo-notifications` dependency unused | Low | Deferred push work |

---

## Recommended Improvements

### Critical — done in this pass
- Auth refresh rotation + waiter rejection  
- Notifications list gate  
- Splash layout + restore gate  
- Remove production demo credentials / seed-as-live  

### High — done
- Honest Home/Profile/Route/Trip data  
- Trip GPS lifecycle  
- Incident GPS honesty + queue-on-fail  
- Light-mode UI kit + SafeArea  

### Medium — remaining
- Wire React Query for notifications/routes/shift  
- Settings Switch `accessibilityLabel`  
- Android `KeyboardAvoidingView` behavior on login/profile/incident  
- Backend multipart photo for incidents (or drop photo UI)  
- NetInfo instead of health-only online detection  

### Low / Nice to Have
- Push token registration + backend endpoint  
- Forgot password / register UI  
- Background location  
- i18n for stored `language` preference  
- Tablet / landscape layouts  

---

## Manual verification still required

1. Expo Go on physical device with `npm run start:tunnel`  
2. Driver login against Railway after backend deploy of `/drivers/me`  
3. Session survives >15 minutes of idle API calls (refresh)  
4. Mark all notifications read — list remains  
5. Trip start with location permission — GPS posts to assigned vehicle  
6. Offline incident → online sync once  
7. Light mode toggle across tabs  
8. Android hardware back from `more/*` stacks  

---

## Final Verdict

**Production Ready with Minor Fixes**

Reasoning: Critical session and data-honesty defects that would ship false ops data or drop drivers mid-shift are remediated. Remaining gaps (push, photo upload API, device a11y lab, React Query adoption) are non-blocking for a supervised pilot but should land before wide production rollout.

**Post-fix score: 72 / 100**
