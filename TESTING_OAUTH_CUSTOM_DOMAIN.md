# Testing OAuth Custom Domain Redirect on Localhost

This guide explains how to test the OAuth custom domain redirect functionality on localhost.

## Prerequisites

1. **Backend API running** on localhost (or accessible URL)
2. **Frontend Next.js app running** on localhost
3. **Test user account** (agency or subaccount) with a custom domain configured
4. **OAuth provider credentials** (Google/GHL) configured for localhost

## Setup Steps

### 1. Configure Environment Variables

Make sure your `.env.local` or `.env` file has:

```bash
# Backend API URL (for localhost testing)
NEXT_PUBLIC_BASE_API_URL=http://localhost:8000/  # or your backend URL
# OR use the test environment
NEXT_PUBLIC_REACT_APP_ENVIRONMENT=Sandbox

# OAuth Redirect URIs (must be registered in OAuth provider consoles)
NEXT_PUBLIC_APP_REDIRECT_URI=http://localhost:3000/api/oauth/redirect
NEXT_PUBLIC_GHL_REDIRECT_URI=http://localhost:3000/api/oauth/redirect

# OAuth Client IDs
NEXT_PUBLIC_APP_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GHL_CLIENT_ID=your-ghl-client-id
```

### 2. Register Localhost URLs in OAuth Provider Consoles

#### Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `http://localhost:3000/api/oauth/redirect`
   - `http://localhost:3000/google-auth/callback`

#### GHL Console:
1. Go to your GHL Marketplace app settings
2. Add to **Redirect URIs**:
   - `http://localhost:3000/api/oauth/redirect`

### 3. Set Up Test Data

#### Option A: Use Existing Agency with Custom Domain
1. Log in as an agency user that has a custom domain configured
2. Or log in as a subaccount of an agency with a custom domain

#### Option B: Create Test Data via Database/API

```sql
-- 1. Create or find an agency user
-- 2. Add a custom domain record
INSERT INTO AgencyDomains (agencyId, type, domain, status, createdAt, updatedAt)
VALUES (
  <agency_id>,
  'web',
  'test.localhost',  -- or use a real test domain
  'active',
  NOW(),
  NOW()
);
```

## Testing Methods

### Method 1: Test API Endpoint Directly

#### Test the Custom Domain API Route

```bash
# Using curl (replace with your actual token)
curl -X GET http://localhost:3000/api/agency/branding/custom-domain \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  --cookie "User=YOUR_ENCODED_USER_COOKIE"
```

**Expected Response:**
```json
{
  "status": true,
  "data": {
    "agencyId": 123,
    "customDomain": "test.localhost"
  }
}
```

#### Test from Browser Console

```javascript
// Open browser console on your app (logged in)
fetch('/api/agency/branding/custom-domain', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
```

### Method 2: Test OAuth Flow with Localhost

#### Using ngrok (Recommended for OAuth Testing)

OAuth providers need to redirect to a publicly accessible URL. Use ngrok to expose localhost:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # or
   brew install ngrok
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Update OAuth Redirect URIs** in provider consoles:
   - Google: `https://your-ngrok-url.ngrok.io/api/oauth/redirect`
   - GHL: `https://your-ngrok-url.ngrok.io/api/oauth/redirect`

4. **Update environment variables:**
   ```bash
   NEXT_PUBLIC_APP_REDIRECT_URI=https://your-ngrok-url.ngrok.io/api/oauth/redirect
   NEXT_PUBLIC_GHL_REDIRECT_URI=https://your-ngrok-url.ngrok.io/api/oauth/redirect
   ```

5. **Access your app via ngrok URL:**
   ```
   https://your-ngrok-url.ngrok.io
   ```

#### Using /etc/hosts for Custom Domain Testing

To test with a custom domain on localhost:

1. **Edit `/etc/hosts` file:**
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add entry:**
   ```
   127.0.0.1 test.localhost
   ```

3. **Access app via custom domain:**
   ```
   http://test.localhost:3000
   ```

4. **Make sure your test agency has this domain configured:**
   ```sql
   UPDATE AgencyDomains 
   SET domain = 'test.localhost' 
   WHERE agencyId = <your_test_agency_id>;
   ```

### Method 3: Test OAuth Flow Step by Step

#### Step 1: Test getAgencyCustomDomain() Function

Open browser console on your app and run:

```javascript
// Import the function (or test directly)
import { getAgencyCustomDomain } from '@/utils/getAgencyCustomDomain'

// Test it
getAgencyCustomDomain().then(result => {
  console.log('Custom Domain Result:', result)
  // Expected: { agencyId: 123, customDomain: 'test.localhost' }
})
```

#### Step 2: Test OAuth State Generation

```javascript
import { generateOAuthState, parseOAuthState } from '@/utils/oauthState'

// Generate state
const state = generateOAuthState({
  agencyId: 123,
  customDomain: 'test.localhost',
  provider: 'google',
  subaccountId: null,
  originalRedirectUri: null
})

console.log('Generated State:', state)

// Parse it back
const parsed = parseOAuthState(state)
console.log('Parsed State:', parsed)
```

#### Step 3: Test OAuth Redirect Handler

1. **Manually construct OAuth callback URL:**
   ```
   http://localhost:3000/api/oauth/redirect?code=TEST_CODE&state=YOUR_STATE
   ```

2. **Or trigger actual OAuth flow:**
   - Click "Connect Google" or "Connect GHL" button
   - Complete OAuth flow
   - Check browser network tab for redirects

### Method 4: Test Without Custom Domain (Backward Compatibility)

To test that existing flows still work:

1. **Log in as a user WITHOUT a custom domain**
2. **Initiate OAuth flow**
3. **Verify:**
   - No state parameter is added to OAuth URL
   - OAuth redirects to `localhost:3000/google-auth/callback` (not custom domain)
   - Flow completes normally

## Debugging Tips

### 1. Check Browser Console

Look for:
- API call errors
- State generation/parsing errors
- Redirect issues

### 2. Check Network Tab

Monitor these requests:
- `/api/agency/branding/custom-domain` - Should return custom domain
- `/api/oauth/redirect` - Should handle OAuth callback
- OAuth provider redirects

### 3. Check Server Logs

Backend should log:
- Custom domain lookup requests
- Agency verification

Next.js should log:
- OAuth redirect handler calls
- State parsing
- Domain verification

### 4. Common Issues

#### Issue: "Not authenticated" error
**Solution:** Make sure you're logged in and User cookie is set

#### Issue: Custom domain not found
**Solution:** 
- Verify agency has custom domain in database
- Check domain status is 'active' or 'verified'
- Verify agencyId matches

#### Issue: OAuth redirect fails
**Solution:**
- Check redirect URI is registered in OAuth provider console
- Verify environment variables are set correctly
- Check ngrok URL is accessible (if using ngrok)

#### Issue: State parameter missing
**Solution:**
- Verify `getAgencyCustomDomain()` returns data
- Check custom domain is not null
- Verify state generation is called

## Test Checklist

- [ ] API endpoint `/api/agency/branding/custom-domain` returns correct data
- [ ] `getAgencyCustomDomain()` utility function works
- [ ] OAuth state generation includes custom domain when available
- [ ] OAuth state generation is skipped when no custom domain
- [ ] OAuth redirect handler verifies custom domain
- [ ] OAuth redirect handler redirects to custom domain
- [ ] OAuth callback completes successfully on custom domain
- [ ] Backward compatibility: OAuth works without custom domain
- [ ] Error handling: Invalid state falls back to existing flow
- [ ] Error handling: Domain verification failure falls back

## Quick Test Script

Save this as `test-oauth-custom-domain.js` and run in browser console:

```javascript
async function testOAuthCustomDomain() {
  console.log('🧪 Testing OAuth Custom Domain Flow...\n')
  
  // Test 1: Get custom domain
  console.log('1️⃣ Testing getAgencyCustomDomain()...')
  try {
    const { getAgencyCustomDomain } = await import('/utils/getAgencyCustomDomain.js')
    const result = await getAgencyCustomDomain()
    console.log('✅ Result:', result)
    
    if (result.customDomain) {
      console.log('✅ Custom domain found:', result.customDomain)
      
      // Test 2: Generate state
      console.log('\n2️⃣ Testing state generation...')
      const { generateOAuthState } = await import('/utils/oauthState.js')
      const state = generateOAuthState({
        agencyId: result.agencyId,
        customDomain: result.customDomain,
        provider: 'google',
        subaccountId: null,
        originalRedirectUri: null
      })
      console.log('✅ State generated:', state.substring(0, 50) + '...')
      
      // Test 3: Parse state
      console.log('\n3️⃣ Testing state parsing...')
      const { parseOAuthState } = await import('/utils/oauthState.js')
      const parsed = parseOAuthState(state)
      console.log('✅ State parsed:', parsed)
      
      console.log('\n🎉 All tests passed!')
    } else {
      console.log('ℹ️ No custom domain found (this is OK for testing backward compatibility)')
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testOAuthCustomDomain()
```

## Next Steps

After localhost testing:
1. Test on staging/dev environment
2. Test with real custom domains
3. Test with multiple agencies
4. Test error scenarios
5. Load testing (if applicable)

