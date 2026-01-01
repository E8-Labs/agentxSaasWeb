# Twilio Dialer Testing Guide

This guide explains how to test the Twilio Dialer functionality and troubleshoot common issues.

## Prerequisites

1. **Install Dependencies**:
   ```bash
   cd agentxSaasWeb
   npm install @twilio/voice-sdk
   ```

2. **Environment Variables** (in `agentxSaasWeb/.env`):
   - `NEXT_PUBLIC_BASE_API_URL` - Your backend API URL
   - `NEXT_PUBLIC_APP_URL` - Your frontend URL (for webhooks)

3. **Database Migrations**:
   ```bash
   cd agentxapis
   npm run db:migrate
   ```

4. **Backend Running**: Ensure the Express backend is running

---

## Testing Steps

### Step 1: Set Internal Dialer Number

Before making calls, you must configure an internal dialer number:

1. **Navigate to Settings** (or wherever DialerSettings component is placed)
2. **Click "Configure Dialer Number"**
3. **Select a Twilio number** from your available numbers
4. **Click "Select"** to mark it as `internal_dialer`

**Expected Result**: 
- Number is marked with "Selected" badge
- Other numbers are unselected
- Success toast appears

**API Test**:
```bash
# Get phone numbers
curl -X GET http://localhost:3000/api/dialer/phone-numbers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Set internal dialer number
curl -X POST http://localhost:3000/api/dialer/phone-numbers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumberId": 123}'
```

---

### Step 2: Test from Lead Details

1. **Open Leads Dashboard**
2. **Click on a lead** to open Lead Details
3. **Click the "Dialer" button** next to the phone number
4. **Dialer Modal should open** with:
   - Phone number pre-filled (from lead)
   - Status badge showing current state
   - Call button enabled

**Expected Result**:
- Modal opens immediately
- Phone number is pre-filled in E.164 format
- Status shows "IDLE" or "INITIALIZING"
- No errors in console

**Troubleshooting**:
- If modal doesn't open: Check browser console for errors
- If phone number is missing: Verify `selectedLeadsDetails.phone` exists
- If "No internal dialer number" error: Complete Step 1 first

---

### Step 3: Initialize Device

When the modal opens, it should automatically:

1. **Check for dialer number** (API call to `/api/dialer/phone-numbers`)
2. **Request Access Token** (API call to `/api/dialer/calls/token`)
3. **Initialize Twilio Device** (browser-side)

**Expected Console Logs**:
```
Twilio Device registered
```

**API Test**:
```bash
# Get access token
curl -X POST http://localhost:3000/api/dialer/calls/token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response**:
```json
{
  "status": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Troubleshooting**:
- **409 Error**: "No internal dialer number set" → Complete Step 1
- **401 Error**: Invalid/expired JWT token → Re-login
- **500 Error**: Check backend logs for Voice SDK credential issues

---

### Step 4: Make a Test Call

1. **Ensure phone number is in E.164 format** (e.g., `+1234567890`)
2. **Click "Call" button**
3. **Grant microphone permission** when browser prompts
4. **Wait for call to connect**

**Expected Flow**:
1. Status: `IDLE` → `REQUESTING-MIC` (microphone permission)
2. Status: `CONNECTING` (device.connect called)
3. Status: `RINGING` (Twilio is dialing)
4. Status: `IN-CALL` (call answered)
5. Status: `ENDED` (call disconnected)

**Expected Console Logs**:
```
Twilio Device registered
Call connected
Call ended
```

**Troubleshooting**:
- **Microphone permission denied**: Check browser settings, allow microphone access
- **Call fails immediately**: Check Twilio account balance, number capabilities
- **No audio**: Check browser audio settings, ensure microphone is working
- **Call doesn't connect**: Check network, verify TwiML endpoint is accessible

---

### Step 5: Verify Call Logging

After making a call, verify it's logged:

1. **Check `LeadCallsSent` table** in database
2. **Verify fields are populated**:
   - `fromNumber` = internal dialer number
   - `toNumber` = destination number
   - `twilioCallSid` = Twilio Call SID
   - `status` = call status
   - `direction` = 'outbound'
   - `isWebCall` = true
   - `callOrigin` = 'Dialer'

**Database Query**:
```sql
SELECT * FROM LeadCallsSents 
WHERE isWebCall = true 
AND callOrigin = 'Dialer' 
ORDER BY createdAt DESC 
LIMIT 10;
```

**Troubleshooting**:
- **No record created**: Check webhook endpoint `/api/dialer/calls/status`
- **Missing fields**: Verify migration ran successfully
- **Wrong status**: Check Twilio webhook delivery

---

## Testing Different User Types

### Normal User (AgentX Twilio)

**Setup**:
- User has NOT connected own Twilio
- User purchased number via AgentX

**Test**:
1. Set internal dialer number (from AgentX-purchased number)
2. Make call
3. Verify call billed to AgentX account
4. Check credentials resolved to platform `.env`

---

### Normal User (Own Twilio)

**Setup**:
- User connected their own Twilio account
- User has numbers in their account

**Test**:
1. Set internal dialer number (from user's account)
2. Make call
3. Verify Voice SDK credentials auto-provisioned in `UserTwilioAccounts`
4. Verify call billed to user's account

---

### Subaccount (Agency Twilio)

**Setup**:
- Subaccount user
- Agency has connected Twilio
- Subaccount has NOT connected own Twilio

**Test**:
1. Set internal dialer number
2. Make call
3. Verify credentials resolved to agency's account
4. Verify Voice SDK credentials stored in agency's `UserTwilioAccounts`

---

### Subaccount (Own Twilio)

**Setup**:
- Subaccount user
- Subaccount connected their own Twilio (even though they're subaccount)

**Test**:
1. Set internal dialer number (from subaccount's account)
2. Make call
3. Verify credentials resolved to SUBACCOUNT's account (not agency)
4. Verify call billed to subaccount's account

---

## Common Issues & Solutions

### Issue: "No internal dialer number set"

**Symptoms**: Error message when clicking Dialer button

**Solutions**:
1. Go to settings and select a number as internal dialer
2. Verify number exists in `UserPhoneNumbers` table
3. Check `usageType = 'internal_dialer'` in database

---

### Issue: "Device not initialized"

**Symptoms**: Call button disabled, error in console

**Solutions**:
1. Check browser console for errors
2. Verify JWT token is valid
3. Check `/api/dialer/calls/token` endpoint returns token
4. Verify Twilio Voice SDK is installed: `npm list @twilio/voice-sdk`

---

### Issue: "Failed to get access token"

**Symptoms**: 409 or 500 error when requesting token

**Solutions**:
1. **409 Error**: Set internal dialer number first
2. **500 Error**: 
   - Check backend logs
   - Verify Voice SDK credentials exist (or auto-provisioning works)
   - Check Twilio account credentials are valid

---

### Issue: Call connects but no audio

**Symptoms**: Call status shows "IN-CALL" but can't hear anything

**Solutions**:
1. Check browser microphone permissions
2. Verify microphone is not muted
3. Check browser audio settings
4. Test microphone in other applications
5. Check Twilio Device logs in console

---

### Issue: Call fails immediately

**Symptoms**: Call status goes to "ERROR" right away

**Solutions**:
1. Check Twilio account balance
2. Verify number has voice capability
3. Check destination number format (must be E.164)
4. Verify TwiML endpoint is accessible: `POST /api/dialer/calls/twiml`
5. Check Twilio webhook logs

---

### Issue: Call not logged in database

**Symptoms**: Call completes but no record in `LeadCallsSent`

**Solutions**:
1. Verify webhook endpoint is accessible: `POST /api/dialer/calls/status`
2. Check Twilio webhook configuration in TwiML App
3. Verify webhook signature validation (check backend logs)
4. Check database connection
5. Verify migration ran (fields exist in table)

---

## Debugging Checklist

### Frontend Debugging

- [ ] Check browser console for errors
- [ ] Verify `@twilio/voice-sdk` is installed
- [ ] Check network tab for API calls:
  - [ ] `GET /api/dialer/phone-numbers` (200 OK)
  - [ ] `POST /api/dialer/calls/token` (200 OK, returns token)
- [ ] Verify JWT token in localStorage
- [ ] Check microphone permissions in browser
- [ ] Test in different browsers (Chrome, Firefox, Safari)

### Backend Debugging

- [ ] Check backend logs for errors
- [ ] Verify Express route `/api/dialer/*` is mounted
- [ ] Test API endpoints directly with Postman/curl
- [ ] Verify database migrations ran
- [ ] Check `UserPhoneNumbers` table for `usageType='internal_dialer'`
- [ ] Check `UserTwilioAccounts` for Voice SDK credentials
- [ ] Verify Twilio credentials are valid (test with Twilio REST API)

### Twilio Debugging

- [ ] Check Twilio Console → Monitor → Logs
- [ ] Verify TwiML App Voice URL is correct
- [ ] Check Twilio account balance
- [ ] Verify phone number has voice capability
- [ ] Test TwiML endpoint manually:
  ```bash
  curl -X POST https://your-domain.com/api/dialer/calls/twiml \
    -d "To=+1234567890&From=+0987654321"
  ```

---

## Manual API Testing

### 1. Get Phone Numbers

```bash
curl -X GET "http://localhost:3000/api/dialer/phone-numbers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected**: List of phone numbers with `usageType` field

---

### 2. Set Internal Dialer Number

```bash
curl -X POST "http://localhost:3000/api/dialer/phone-numbers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumberId": 123}'
```

**Expected**: Success message

---

### 3. Get Access Token

```bash
curl -X POST "http://localhost:3000/api/dialer/calls/token" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected**: JWT token string

---

### 4. Test TwiML Endpoint

```bash
curl -X POST "http://localhost:3000/api/dialer/calls/twiml" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "To=+1234567890&From=+0987654321&AccountSid=ACxxx"
```

**Expected**: TwiML XML response

---

### 5. Test Status Callback (Simulate Twilio Webhook)

```bash
curl -X POST "http://localhost:3000/api/dialer/calls/status" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Twilio-Signature: SIGNATURE" \
  -d "CallSid=CAxxx&CallStatus=completed&From=+1234567890&To=+0987654321"
```

**Expected**: 200 OK, TwiML response

---

## Browser Console Testing

Open browser console and test manually:

```javascript
// 1. Get token
const token = await fetch('/api/dialer/calls/token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json())

// 2. Initialize Device
const { Device } = await import('@twilio/voice-sdk')
const device = new Device(token.token)

// 3. Listen for events
device.on('registered', () => console.log('Registered'))
device.on('error', (e) => console.error('Error:', e))

// 4. Make call
const call = await device.connect({
  params: { To: '+1234567890' }
})

call.on('accept', () => console.log('Call accepted'))
call.on('disconnect', () => console.log('Call disconnected'))
```

---

## Expected Behavior

### Successful Call Flow

1. **Click Dialer Button** → Modal opens
2. **Modal Opens** → Device initializes (2-3 seconds)
3. **Click Call** → Microphone permission requested
4. **Permission Granted** → Status: CONNECTING
5. **Twilio Dials** → Status: RINGING
6. **Call Answered** → Status: IN-CALL
7. **Call Ends** → Status: ENDED
8. **Database Updated** → Record in `LeadCallsSent`

### Error Scenarios

1. **No Dialer Number** → Error: "No internal dialer number set"
2. **Invalid Token** → Error: "Failed to get access token"
3. **Microphone Denied** → Error: "Microphone permission required"
4. **Call Failed** → Status: ERROR, error message displayed
5. **Network Issue** → Error: "Failed to initialize dialer"

---

## Next Steps After Testing

1. **Verify call logging** in database
2. **Check call quality** (audio clarity)
3. **Test with different phone numbers** (US, international)
4. **Test error scenarios** (invalid numbers, network issues)
5. **Verify billing** (calls charged to correct account)

---

**Last Updated**: December 22, 2025


