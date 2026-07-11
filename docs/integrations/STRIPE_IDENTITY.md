# Stripe Identity — setup guide

The verification integration is built and tested against **Stripe Identity**. To take it from the
simulation provider to real verifications, do the following on your side. (No code changes needed —
it's all configuration.)

## 1. Stripe account (you, ~30 min)
1. Create/log in to a [Stripe account](https://dashboard.stripe.com) for your registered Australian
   business entity.
2. In the dashboard, enable **Identity** (Products → Identity). Stripe Identity is priced
   per verification — check current AU pricing and factor it into unit economics.
3. Copy your **Secret key** (`sk_live_…` for production, `sk_test_…` to trial). Never commit it.

## 2. Register the webhook (you, ~10 min)
1. Dashboard → Developers → Webhooks → **Add endpoint**.
2. URL: `https://<your-api-domain>/verification/webhook`.
3. Subscribe to these events:
   - `identity.verification_session.verified`
   - `identity.verification_session.requires_input`
   - `identity.verification_session.canceled`
   - `identity.verification_session.processing` (optional)
4. Copy the endpoint's **Signing secret** (`whsec_…`).

## 3. Configure the API (you/ops)
Set these environment variables where the API runs (never in source):

```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Once `STRIPE_SECRET_KEY` is present the API automatically switches from the simulation provider to
real Stripe sessions, and the dev-only `/verification/submit` shortcut is disabled.

## 4. How the flow works (already implemented)
1. App calls `POST /verification/session` → API creates a Stripe VerificationSession (with the user's
   id in `metadata.user_id`) and returns a **client secret**.
2. App presents Stripe's Identity SDK using that secret (this is the mobile-side work — see the
   Flutter task in the roadmap).
3. Stripe processes the document + selfie and calls `POST /verification/webhook`.
4. The API **verifies the signature**, then flips the user's status: `verified → approved`,
   `requires_input → manual_review`, `canceled → rejected`. Only the session id is stored — **Stripe
   holds the ID document, we never do** (Phase 10 data-minimization).
5. `requireVerified`-gated routes (matches, chat) unlock the moment status is `approved`.

## 5. Test it before going live
- Use `sk_test_…` + Stripe's **test verification** flow to exercise the full loop.
- Locally, run `stripe listen --forward-to localhost:3000/verification/webhook` (Stripe CLI) so real
  test events hit your machine with valid signatures.

## Security notes (built in)
- Webhook signatures are verified to Stripe's exact HMAC-SHA256 scheme with a 5-minute replay window.
- The webhook is the **only** way status becomes `approved` in Stripe mode — a client cannot
  self-approve.
- Raw ID documents never touch our database or logs.
