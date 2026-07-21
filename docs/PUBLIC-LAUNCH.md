# Public launch checklist

Automated prep is complete on branch `arena/019f85cf-things-that-matter`.

## If the repo is not public yet

A GitHub App token may lack permission to change visibility. Do this once in the UI:

1. Open https://github.com/MatomeMb/.Things-That-Matter/settings
2. Scroll to **Danger Zone** → **Change repository visibility** → **Public**
3. Confirm

## Recommended GitHub settings (UI)

- Description: `Fairflow — commerce infrastructure for South African merchants`
- Website: `https://fairflow.co.za`
- Topics: `fairflow`, `typescript`, `hono`, `react`, `commerce`, `paystack`, `supabase`, `open-source`
- **Settings → Code security** → enable **Private vulnerability reporting**
- **Branches** → protect `main` (require PR) once CI is green

## After going public

1. Pin this repository on your GitHub profile
2. Link it from LinkedIn / CV with live site https://fairflow.co.za
3. Ensure production portal has `VITE_ADMIN_EMAILS` set (staff elevation)
