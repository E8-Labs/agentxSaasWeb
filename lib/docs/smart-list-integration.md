# Smart List Integration for Agent Embed Widgets

## Overview

The Smart List Integration feature allows agents to be associated with custom lead capture forms (smart lists) that can be displayed in embed widgets. This enables users to collect structured lead information before starting conversations with AI agents.

## Key Concepts

### Smart List Types
- **`general`** - Upload-based lead sheets (default for CSV imports)
- **`inbound`** - Inbound lead collections
- **`manual`** - Manually created smart lists for agent association

### Agent Integration
- Each agent can have **one** associated smart list
- Each smart list can be associated with **multiple** agents
- Only `manual` type smart lists can be associated with agents
- Smart lists include custom form fields and configuration

## Database Schema Changes

### AgentModel Table - New Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `smartListEnabled` | BOOLEAN | `false` | Enable/disable smart list for agent |
| `supportButtonText` | STRING(10) | `'Get Help'` | Customizable button text (max 10 chars) |
| `supportButtonAvatar` | STRING | `NULL` | URL for support button avatar (1:1 ratio) |
| `smartListId` | INTEGER | `NULL` | Foreign key to LeadSheetModels |

### LeadSheetModel - Type Field Enhanced

The `type` field now supports dynamic values:
- `'general'` - Upload-based lead sheets
- `'inbound'` - Inbound leads
- `'manual'` - Agent smart lists

### Migration

Migration file: `20250923000000-add-smart-list-support-to-agents.cjs`

```bash
npm run db:migrate
```

## API Endpoints

### 1. Create Smart List with Agent Association

**Endpoint:** `POST /agentx/api/lead/addSmartList`

**Enhanced Parameters:**
```json
{
  "sheetName": "Customer Support Form",
  "columns": ["Full Name", "phone", "email", "Issue Type"],
  "tags": ["support", "urgent"],
  "inbound": false,
  "enrich": false,
  "agentId": 123  // NEW: Optional agent association
}
```

**Behavior:**
- If `agentId` provided: Sets `type: 'manual'` and associates with agent
- If `inbound: true`: Sets `type: 'inbound'`
- Otherwise: Sets `type: 'general'` (default)

### 2. Get Smart Lists with Type Filter

**Endpoint:** `GET /agentx/api/lead/getSheets?type={type}`

**Parameters:**
- `type` (optional): Filter by smart list type

**Examples:**
```javascript
// Get all sheets
GET /agentx/api/lead/getSheets

// Get only manual smart lists for agent association
GET /agentx/api/lead/getSheets?type=manual

// Get only upload-based sheets
GET /agentx/api/lead/getSheets?type=general
```

### 3. Get Manual Smart Lists Only

**Endpoint:** `GET /agentx/api/lead/getManualSmartLists`

**Purpose:** Specifically for agent association dropdowns

**Response:**
```json
{
  "status": true,
  "message": "Manual Smart Lists for Agent Association",
  "data": [
    {
      "id": 123,
      "sheetName": "Customer Support Form",
      "type": "manual",
      "enrich": false,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "tags": [{"tag": "support"}],
      "columns": [{"columnName": "Full Name"}]
    }
  ]
}
```

### 4. Update Agent Support Button Settings

**Endpoint:** `POST /agentx/api/agent/updateAgentSupportButton`

**Parameters:**
```json
{
  "agentId": 123,
  "supportButtonText": "Chat Now",     // Optional, max 10 chars
  "smartListEnabled": true,             // Optional
  "smartListId": 456,                   // Optional, must be manual type
  "media": "<file>"                     // Optional, avatar image upload
}
```

**Features:**
- Updates only provided parameters
- Validates smart list exists and is type 'manual'
- Handles image upload for support button avatar
- Returns updated agent settings

### 5. Get Agent with Smart List Data

**Endpoint:** `GET /agentx/api/agent/getUserByAgent/:modelIdVapi`

**Enhanced Response:**
```json
{
  "status": true,
  "message": "User details retrieved successfully",
  "data": {
    "user": { /* user data */ },
    "agent": {
      "smartListEnabled": true,
      "supportButtonText": "Get Help",
      "supportButtonAvatar": "https://...",
      "smartListId": 123,
      /* other agent fields */
    },
    "smartList": {
      "id": 123,
      "sheetName": "Customer Support Form",
      "type": "manual",
      "enrich": false,
      "columns": [
        {"columnName": "Full Name"},
        {"columnName": "phone"},
        {"columnName": "email"}
      ],
      "tags": [{"tag": "support"}]
    }
  }
}
```

## Implementation Flow

### Frontend Integration Flow

1. **Create Smart List**
   ```javascript
   // Create smart list associated with agent
   POST /agentx/api/lead/addSmartList
   {
     "sheetName": "Lead Capture Form",
     "columns": ["Full Name", "phone", "email", "Company"],
     "agentId": 123
   }
   ```

2. **Configure Agent Settings**
   ```javascript
   // Update agent support button
   POST /agentx/api/agent/updateAgentSupportButton
   {
     "agentId": 123,
     "supportButtonText": "Get Quote",
     "smartListEnabled": true,
     "smartListId": 456
   }
   ```

3. **Get Available Smart Lists**
   ```javascript
   // Populate dropdown for agent association
   GET /agentx/api/lead/getManualSmartLists
   ```

4. **Retrieve Agent Configuration**
   ```javascript
   // Get agent with smart list for embed widget
   GET /agentx/api/agent/getUserByAgent/vapi-model-id
   ```

### Embed Widget Integration

The embed widget can now:

1. **Display Custom Button**
   - Use `agent.supportButtonText` for button label
   - Use `agent.supportButtonAvatar` for button icon

2. **Show Lead Capture Form**
   - Use `smartList.columns` to generate form fields
   - Show form before starting conversation if `agent.smartListEnabled`

3. **Collect Lead Data**
   - Submit form data to create lead with `smartList.id`
   - Store conversation as call activity on the lead

## Database Relationships

```
AgentModel (many-to-one) → LeadSheetModel
   ↓
smartListId → id (where type = 'manual')

LeadSheetModel (one-to-many) → LeadSheetColumnModel
LeadSheetModel (one-to-many) → LeadSheetTagModel
```

## Usage Examples

### Creating Agent with Smart List

```javascript
// 1. Create smart list for agent
const smartListResponse = await fetch('/agentx/api/lead/addSmartList', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sheetName: "Website Inquiry Form",
    columns: ["Full Name", "phone", "email", "Budget", "Timeline"],
    tags: ["website", "inquiry"],
    agentId: 123
  })
})

// 2. Configure support button
const buttonResponse = await fetch('/agentx/api/agent/updateAgentSupportButton', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData // includes supportButtonText, smartListEnabled, avatar
})
```

### Getting Smart Lists for Dropdown

```javascript
const smartLists = await fetch('/agentx/api/lead/getManualSmartLists', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())

// Populate dropdown
const dropdown = smartLists.data.map(list => ({
  value: list.id,
  label: list.sheetName
}))
```

## Error Handling

### Common Validation Errors

- **Support button text too long**: "Support button text must be 10 characters or less"
- **Invalid smart list**: "Invalid smart list ID or smart list not found"
- **Wrong smart list type**: Only `type: 'manual'` smart lists can be associated
- **Agent not found**: "No such agent"

### Status Codes

- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `404` - Agent/Smart list not found
- `500` - Server error

## Security Considerations

- All endpoints require JWT authentication
- Team-based access control (users can only access their team's data)
- Smart list association validates ownership
- File uploads are validated and stored securely
- Foreign key constraints ensure data integrity

## Performance Notes

- Smart list data is included in `getUserByAgent` response to minimize API calls
- Indexes on `userId`, `createdAt`, and `id` for efficient queries
- Caching can be implemented for frequently accessed smart lists
- Database migrations include proper constraint naming for easy rollback

## Future Enhancements

- **Smart list templates**: Pre-built form templates for common use cases
- **Conditional logic**: Show/hide fields based on previous answers
- **Multi-step forms**: Break long forms into multiple steps
- **Form analytics**: Track form completion rates and field performance
- **Custom validation**: Client-side and server-side field validation rules
- **Webhooks**: Trigger external systems when forms are submitted

## Migration Guide

### Existing Users

1. Run database migration to add new columns
2. Existing agents will have default values:
   - `smartListEnabled: false`
   - `supportButtonText: 'Get Help'`
   - `smartListId: null`
3. No breaking changes to existing API endpoints
4. New functionality is opt-in via configuration

### Development Setup

1. Ensure MySQL server is running
2. Run migration: `npm run db:migrate`
3. Test endpoints with appropriate authentication
4. Verify foreign key constraints are working

## Troubleshooting

### Migration Issues
- Ensure MySQL server is running before migration
- Check database connection settings in `.env`
- Verify user permissions for DDL operations

### API Issues
- Verify JWT token is valid and not expired
- Check agent exists and user has permission
- Ensure smart list type is 'manual' for association
- Validate file uploads meet size and format requirements