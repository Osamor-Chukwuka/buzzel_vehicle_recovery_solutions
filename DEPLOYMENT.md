# Buzzel deployment checklist

The Supabase backend for this build already exists and the migrations have already been applied to:

- Project: `buzzel-vehicle-recovery`
- Project ref: `tbxdehxvaegmvfbucarr`
- Region: London (`eu-west-2`)

You do **not** need to run the migrations again against that same project. The SQL files are included under `supabase/migrations/` for source control and disaster recovery.

## 1. Local run

```bash
npm install
npm run test
npm run dev
```

The included `.env.local` already contains the Supabase URL and publishable key. Before using Admin/Super Admin functions, replace:

```text
SUPABASE_SECRET_KEY=PASTE_YOUR_SUPABASE_SECRET_KEY_HERE
```

with the project's server-side secret key from **Supabase Dashboard -> Project Settings -> API Keys**.

Do not commit `.env.local` to Git. It is already ignored by `.gitignore`.

## 2. Create the first Super Admin

1. Start the app and sign up normally with the email you want to use as the initial Super Admin.
2. In Supabase SQL Editor, run:

```sql
update public.profiles
set role = 'super_admin'
where id = (
  select id
  from auth.users
  where lower(email) = lower('YOUR_EMAIL_HERE')
  limit 1
);
```

3. Sign out and sign back in.

From then on, the Super Admin can invite Admins and recovery/team members from the application.

## 3. Deploy to Vercel

Easiest path:

1. Create a private GitHub repository.
2. Copy this project into it and push to `main`.
3. In Vercel, choose **Add New -> Project** and import the repository.
4. Framework should detect as **Next.js**.
5. Add the environment variables below to Production, Preview and Development as appropriate.
6. Deploy.
7. Copy the final Vercel URL and update `NEXT_PUBLIC_APP_URL` in Vercel to that URL, then redeploy.

Required Vercel variables:

```text
NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://tbxdehxvaegmvfbucarr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_lNyrAAVM_uq1tT4bC5DMLg_Q6YStqh7
SUPABASE_SECRET_KEY=<your Supabase secret key>
BUZZEL_DEMO_MODE=true
BUZZEL_CURRENCY=NGN
RESEND_FROM_EMAIL=Buzzel <onboarding@resend.dev>
```

Optional integration variables:

```text
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
RESEND_API_KEY=
```

The app is intentionally able to demo without Paystack, Google Maps or Resend credentials when demo mode is enabled.

## 4. Supabase Auth URLs

After Vercel gives you the deployed URL, open Supabase Dashboard -> Authentication -> URL Configuration and set:

- Site URL: your Vercel production URL
- Redirect URL: `https://YOUR-PROJECT.vercel.app/auth/callback`
- For local development also allow: `http://localhost:3000/auth/callback`

Email/password auth works without configuring Google OAuth. Google sign-in is optional for the demo and can be enabled later in Supabase Auth providers.

## 5. Optional Paystack test mode

Use **test keys only** for this MVP. Put the test secret/public keys in Vercel. Configure the Paystack webhook to:

```text
https://YOUR-PROJECT.vercel.app/api/payments/paystack/webhook
```

If Paystack keys are blank and `BUZZEL_DEMO_MODE=true`, the app uses its demo payment flow instead.

## 6. Optional Google Maps

Create a Google Maps API key with the APIs needed for geocoding/maps and set both Maps environment variables. For a proper production setup, use/restrict browser and server keys separately. For the interview MVP, one restricted test key can be used for both.

## 7. Optional Resend

Add `RESEND_API_KEY`. The default `onboarding@resend.dev` sender is suitable only for Resend testing. For real delivery, verify a sending domain and replace `RESEND_FROM_EMAIL`.

## 8. Pre-demo checks

- Customer can sign up and add a vehicle.
- Annual coverage quote/payment demo works.
- One-off roadside/recovery request works.
- Covered vehicle does not receive an incident/security charge.
- High-risk uncovered request receives the demo security charge.
- Super Admin can see Admin settings and audit logs.
- Admin can assign a team member.
- Request chat works between participants.
- Team completion moves to customer confirmation rather than directly to Completed.
- Customer confirmation completes the request.
- Admin close requires a reason.
- Dispute can be raised and Admin/Super Admin can resolve it.

## Notes

- Supabase is on the free tier for this project.
- Pricing and high-risk zones are demo/configurable values, not final Buzzel commercial rates or real security intelligence.
- Do not expose `SUPABASE_SECRET_KEY`, `PAYSTACK_SECRET_KEY`, or `RESEND_API_KEY` in any `NEXT_PUBLIC_*` variable.
