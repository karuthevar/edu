# Authentication and Forum Setup

This package adds real email/password authentication and a database-backed forum using Supabase.

## 1. Create Supabase project

Create a Supabase project, then open **SQL Editor** and run `supabase-schema.sql`.

## 2. Configure authentication

In Supabase Authentication settings:

- Enable Email authentication.
- Keep email confirmation enabled for a public student community.
- Set Site URL to your production Vercel URL.
- Add local and preview redirect URLs if needed.
- Configure rate limits, CAPTCHA, and email templates before public launch.

## 3. Add public browser configuration

Edit `supabase-config.js`:

```js
window.APP_CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLISHABLE_OR_ANON_KEY'
};
```

Never place the Supabase service-role key in browser files. The public key works safely only with the included Row Level Security policies.

## 4. Moderator role

After creating a trusted adult/moderator account, set the role in Supabase SQL Editor:

```sql
update public.profiles set role='moderator' where id=(select id from auth.users where email='moderator@example.com');
```

Use `moderation.html` to review submitted reports. For production, add server-side audit logging, rate limiting, automated content filtering, and a documented escalation process.

## 5. Deploy

Upload all files to GitHub and redeploy on Vercel. No build command is needed.

## Safety design

- Public nicknames instead of required legal names
- No direct/private messaging
- No user-uploaded images or files
- Reporting workflow
- Moderator/admin roles protected by database policies
- Suspended-user enforcement
- Locked and hidden posts
- Community rules for minors and school-safe discussion
