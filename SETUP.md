# খামার ম্যানেজিং — Setup

## Run locally / host
Static PWA, no build step. Serve the folder over HTTPS (required for install, service worker, notifications):
`npx serve .` for testing, or deploy to Firebase Hosting / Netlify / GitHub Pages.

Works fully **offline on the device without any setup** (data in IndexedDB).

## Enable Google Sign-In + cloud backup (required setup — not connected by default)
1. Create a project at https://console.firebase.google.com
2. Build → Authentication → Sign-in method → enable **Google**. Add your hosting domain under Authorized domains.
3. Build → Firestore Database → create database, then publish `firestore.rules` (per-user privacy).
4. (Optional, for photo/document cloud copies) Build → Storage → publish `storage.rules`.
5. Project settings → Your apps → Web app → copy the config object into `config.js`.
6. Reload the app → Settings → Sign in with Google.

Sync is last-write-wins per record with stable IDs, so no duplicates are created; deletions sync too.

## Notifications
Reminders fire while the app is open/installed and running (permission is asked in Notifications). Push while the app is fully closed needs a push server (Firebase Cloud Messaging) — not included.

## Sponsor / ad area
Hidden by default. An administrator enables it by writing a Firestore document at `config/ads` with `{enabled:true, imageUrl:'https://…', link:'https://…'}`; optional per-slot overrides under `slots.footer`. Requires Firebase to be configured.

## Medical disclaimer
Vaccine schedules and disease information are general educational guidance; confirm with a qualified veterinarian.
