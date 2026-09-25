# ShilpSaathi Mobile (Expo SDK 57)

React Native app with the same design and backend as `../web`: artisan dashboard + 6-step AI wizard
(camera → background removal → voice in Hindi/English → AI listing → fair price → publish),
enquiries with the AI negotiation copilot, and the buyer marketplace (filters, bulk orders, chat, deal confirmation).
The admin panel stays on the web app.

## Run on your phone (Expo Go)

1. Install **Expo Go** from the Play Store / App Store (it must support SDK 57 — update it if it is old).
2. Start the backend on your laptop (`cd ../backend && npm run dev`).
3. Start the app:
   ```bash
   cd sih-artisan-app/mobile
   npm install
   npx expo start
   ```
4. Scan the QR code with Expo Go (Android) or the Camera app (iPhone). **Phone and laptop must be on the same Wi-Fi.**

The app finds the backend automatically at `http://<your-laptop-ip>:4000/api` (the same IP Expo uses).
If Windows asks whether to allow Node.js on the network, click **Allow** — otherwise the phone can't reach port 4000
and the app shows **Offline demo** (it still works on sample data).

Different network / tunnel? Create `mobile/.env` from `.env.example` and set `EXPO_PUBLIC_API_BASE_URL`
to a backend URL the phone can reach, then restart `npx expo start`.

Other targets: press `a` for an Android emulator (uses `http://10.0.2.2:4000/api`), `w` for a browser preview.

## Notes
- **No API keys in this app** — all AI calls go through the backend (`backend/.env`).
- Voice is recorded as AAC on Android and 16 kHz WAV on iOS (`src/media.js`), both accepted by Gemini.
- Mic and camera work over plain `http://` here (unlike the website on a phone, which needs `https://`).
- Installable APK: `npx eas build -p android --profile preview` (needs a free Expo account; `eas.json` is created on first run).

## Structure
```
App.js                  navigation: guest → artisan tabs / buyer tabs (one session per role)
src/api.js              backend client + offline fallbacks (mirrors web/src/api.js)
src/sampleData.js       offline demo data (copy of backend seed)
src/constants.js        crafts, languages, formatters (copy of web/src/constants.js)
src/theme.js, src/ui.js design tokens + shared components
src/media.js            camera/gallery, image resize, recording format
src/screens/Auth.js     welcome, OTP login, onboarding
src/screens/artisan/    dashboard, AI wizard, products, enquiries & negotiation, storefront
src/screens/buyer/      marketplace, filters, product detail, bulk enquiry, chats, dashboard
```
