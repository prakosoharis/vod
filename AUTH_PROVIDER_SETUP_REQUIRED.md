# SMASHSTREAM authentication provider setup

The authentication implementation is safe for development testing with
`AUTH_PROVIDER_MODE=mock` and `NODE_ENV=test|development`. Mock mode fails
closed in every other environment and never returns or logs an OTP.

Real registration delivery remains blocked until these external decisions and
credentials are supplied:

- An approved Meta WhatsApp Authentication template and all
  `META_WHATSAPP_*` variables listed in `apps/api/.env.example`.
- A selected transactional email provider, verified sender domain, API
  credentials, SPF, DKIM, and DMARC.
- Google OAuth client IDs/secrets and exact web/mobile redirect URI allowlists.
- Facebook App ID/secret, exact redirect URI allowlists, and a reviewed Meta
  Data Deletion Callback.
- CAPTCHA provider/site keys if risk policy requires an external challenge.

Never add provider secrets to Vite variables, React Native environment files,
APK/IPA bundles, or Git. Google/Facebook buttons intentionally display an
unavailable state until backend authorization-code exchange, PKCE/state/nonce,
and account-linking review are fully configured.
