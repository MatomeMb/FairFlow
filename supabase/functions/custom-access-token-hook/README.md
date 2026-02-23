# Supabase Custom Access Token Hook

This Edge Function injects the user's role into the JWT claims on every authentication event.

## Deployment

```bash
# Deploy the function
supabase functions deploy custom-access-token-hook --no-verify-jwt

# Set environment variables (if not already set in Supabase Dashboard)
supabase secrets set SUPABASE_URL=your_project_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Register the Hook

1. Go to Supabase Dashboard → Authentication → Hooks
2. Click "Enable Hook" for **Custom Access Token**
3. Select function: `custom-access-token-hook`
4. Save

## How It Works

- Triggered on every login/token refresh
- Queries `user_roles` table for the user's role
- Injects `user_role` claim into the JWT
- Defaults to `consumer` if no role is assigned
- Frontend reads this claim via `jwt-decode`

## Testing

After deployment, log in via the app and check the JWT:

```javascript
// In browser console
const token = localStorage.getItem('sb-<project>-auth-token');
const jwt = JSON.parse(token).access_token;
console.log(jwt_decode(jwt)); // Should contain user_role claim
```
