# Buzzel Vehicle Recovery Solutions

Mobile-first, desktop-responsive roadside assistance and vehicle recovery MVP based on the supplied Buzzel prototype and the stakeholder-updated requirements.

## Included

- Individual and company customer accounts
- Vehicle/fleet registration
- 12-month annual coverage
- One-off/pay-per-request roadside assistance and recovery
- Vehicle-type pricing
- Configurable demo high-risk areas and security handling
- Demo payment flow + Paystack test integration
- Customer/Admin/Team request chat
- Manual job assignment/reassignment
- Mutual completion confirmation
- Admin close-with-reason override
- Dispute management
- Admin and Super Admin dashboards
- Super Admin audit logs and pricing/risk configuration
- Supabase Auth/Postgres/Realtime with RLS
- Optional Google Maps and Resend integration
- Mobile-first customer UI with responsive desktop operational dashboards

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres and Realtime
- Zod validation
- Paystack test mode / demo fallback
- Google Maps/geocoding optional
- Resend optional

## Backend

The live Supabase project has already been created and migrated:

- Project: `buzzel-vehicle-recovery`
- Ref: `tbxdehxvaegmvfbucarr`
- Region: London (`eu-west-2`)

The migration files remain in `supabase/migrations/` for source control.

## Start here

Read **`DEPLOYMENT.md`**. A short version is also available in **`SETUP_CHECKLIST.txt`**.

For local development:

```bash
npm install
npm run test
npm run dev
```

The zip includes `.env.local` with the known non-secret environment values already filled in. You only need to paste your server-side Supabase secret and any optional integration keys you choose to enable.

## Important secrets

Never expose or commit:

- `SUPABASE_SECRET_KEY`
- `PAYSTACK_SECRET_KEY`
- `RESEND_API_KEY`

`.env.local` is ignored by Git.
