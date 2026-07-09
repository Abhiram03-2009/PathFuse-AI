# iOS app (Capacitor) + TestFlight

The iOS app is a native shell (Capacitor) around the same web app in `src/`.
`.github/workflows/ios-testflight.yml` builds it on a macOS GitHub-hosted
runner and uploads the result straight to TestFlight — you don't need a Mac.

Bundle ID: `com.pathfuseai.app`

## 1. One-time Apple Developer Portal setup

1. Go to [developer.apple.com/account/resources/identifiers](https://developer.apple.com/account/resources/identifiers/list) → **Identifiers** → **+** → **App IDs** → **App**.
   - Description: `PathFuse AI`
   - Bundle ID (explicit): `com.pathfuseai.app`
   - Leave capabilities as default unless you add push notifications/etc. later.
2. **Certificates** → **+** → **Apple Distribution** (under "Software").
   - On a Mac: open Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority, save the `.certSigningRequest`, upload it here, download the resulting `.cer`, double-click to install it into your keychain.
   - No Mac available? You can generate the CSR from any OpenSSL install — ask if you want that walkthrough instead.
3. In Keychain Access, find the new "Apple Distribution: ..." certificate, right-click → **Export** → save as `Certificates.p12` with a password you'll remember (this becomes `P12_PASSWORD`).
4. **Profiles** → **+** → **App Store Connect** (distribution) → select the `com.pathfuseai.app` App ID → select your distribution certificate → name it (e.g. "PathFuse AI App Store") → download the `.mobileprovision` file.

## 2. Create the app record in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → **+** → **New App**.
   - Platform: iOS
   - Name: `PathFuse AI` (must be unique across the App Store — pick an alternate if taken)
   - Primary language, Bundle ID: pick `com.pathfuseai.app` from the dropdown (it appears after step 1.1)
   - SKU: anything unique, e.g. `pathfuseai-ios`
2. You don't need to fill in store listing details yet — that's only required before you submit for public App Store review. TestFlight builds can go out before that's finished.

## 3. Create an App Store Connect API key (used by CI to upload builds)

1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API** → **+** to generate a new key.
   - Access: **App Manager** (or Admin) is enough.
2. Download the `.p8` file **immediately** — Apple only lets you download it once.
3. Note the **Key ID** and **Issuer ID** shown on that page.

## 4. Add GitHub Secrets

In the GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, add:

| Secret name | Value |
|---|---|
| `BUILD_CERTIFICATE_BASE64` | `base64 -i Certificates.p12 \| pbcopy` (Mac) or `[Convert]::ToBase64String([IO.File]::ReadAllBytes("Certificates.p12"))` (PowerShell) — paste the output |
| `P12_PASSWORD` | The password you set when exporting the `.p12` |
| `KEYCHAIN_PASSWORD` | Any random string — only used to protect the temporary CI keychain for the duration of the build |
| `PROVISIONING_PROFILE_BASE64` | Same base64 trick, applied to the downloaded `.mobileprovision` file |
| `APPLE_TEAM_ID` | Your 10-character Team ID — Apple Developer account → **Membership details** |
| `APP_STORE_CONNECT_ISSUER_ID` | From step 3 |
| `APP_STORE_CONNECT_KEY_ID` | From step 3 |
| `APP_STORE_CONNECT_API_KEY` | Paste the **raw contents** of the `.p8` file (open it in a text editor and copy everything, including the `-----BEGIN PRIVATE KEY-----` lines) |

PowerShell one-liner for base64-encoding a file on Windows:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\file")) | Set-Clipboard
```

## 5. Run the workflow

The workflow (`.github/workflows/ios-testflight.yml`) runs when you either:

- Go to the **Actions** tab → **iOS Build & TestFlight** → **Run workflow**, or
- Push a git tag matching `v*.*.*`, e.g. `git tag v1.0.0 && git push origin v1.0.0`

It builds the web app, syncs it into the Capacitor iOS project, signs it with your
distribution certificate + provisioning profile, archives it, and uploads it to
App Store Connect. Processing usually takes 5-15 minutes after upload before the
build shows up in TestFlight (Apple does automated compliance scanning).

## 6. Install it on your iPhone via TestFlight

1. App Store Connect → your app → **TestFlight** tab.
2. Under **Internal Testing**, create a group (if none exists) and add yourself
   (your Apple ID email) as a tester — internal testers get access instantly,
   no Apple review needed.
3. On your iPhone, install the **TestFlight** app from the App Store.
4. You'll get an email/notification invite — open it in TestFlight and install
   the build.
5. Every time you re-run the workflow (new tag or manual dispatch), a new build
   number ships and TestFlight will prompt you to update.

## Local development (optional, requires a Mac + Xcode)

```sh
npm run ios:sync   # builds the web app and copies it into ios/
npm run ios:open   # opens the project in Xcode
```

## Required: add the native redirect URL in Supabase

Native Google/Apple sign-in opens an in-app browser and Supabase redirects back
to the app via the custom URL scheme `com.pathfuseai.app://auth/callback`
(registered in `ios/App/App/Info.plist`, handled in `src/contexts/AuthContext.tsx`
+ `src/lib/nativeAuth.ts`). For this to work, add that exact URL to:

**Supabase dashboard → Authentication → URL Configuration → Redirect URLs** →
add `com.pathfuseai.app://auth/callback`

Email/password sign-in doesn't use a redirect and is unaffected either way.

Without this, Supabase will reject the OAuth redirect and sign-in will fail
silently or show an error page in the in-app browser. Email/password sign-in
sign-in is unaffected. Flag if you want this built out next.
