# Stripe Setup for Wavelength Self-Serve Checkout

## 1. Create Products in Stripe

Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products) and create two products:

### Program Finder
- **Name:** Program Finder
- **Pricing:** One-time payment, **$1,500.00 USD**
- After creating, copy the **Price ID** (starts with `price_`)

### Feasibility Study
- **Name:** Feasibility Study
- **Pricing:** One-time payment, **$3,000.00 USD**
- After creating, copy the **Price ID** (starts with `price_`)

## 2. Set Up Webhook

Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks) and click **Add endpoint**:

- **Endpoint URL:** `https://withwavelength.com/api/webhooks/stripe`
- **Events to send:** Select only `checkout.session.completed`
- After creating, click the endpoint and copy the **Signing Secret** (starts with `whsec_`)

## 3. Get API Keys

Go to [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys):

- Copy the **Publishable key** (starts with `pk_live_`)
- Copy the **Secret key** (starts with `sk_live_`)

## 4. Add Environment Variables to Vercel

Go to [Vercel > Settings > Environment Variables](https://vercel.com/dashboard) and add these 5 variables for **Production + Preview + Development**:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (from step 3) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from step 2) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (from step 3) |
| `STRIPE_PRICE_PROGRAM_FINDER` | `price_...` (Program Finder price ID from step 1) |
| `STRIPE_PRICE_FEASIBILITY_STUDY` | `price_...` (Feasibility Study price ID from step 1) |

## 5. Redeploy

After adding all env vars, trigger a new deployment on Vercel so the variables take effect.

## Testing

Before going live, you can use Stripe test mode:
- Use test API keys (`sk_test_...`, `pk_test_...`) in Preview/Development environments
- Use Stripe CLI to forward webhooks locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Test card number: `4242 4242 4242 4242`, any future expiry, any CVC
