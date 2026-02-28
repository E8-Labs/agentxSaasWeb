---
Document: Inbound Dial Handling - Frontend Implementation Plan
Version: 1.1
Status: Ready for Implementation (Validated)
Last Updated: 2025-01-07
Author: Claude
---

# Inbound Dial Handling - Frontend Implementation Plan

[← Back to Index](./index.md)

## Prerequisites

- [ ] Backend API endpoints implemented (see backend plan)
- [ ] Understand current DialerSettings component (see [current-state.md](./current-state.md))

## Phase 1: Add API Constants

### What to Implement

- [ ] Add new API endpoint constants for inbound settings

### Implementation

**File:** `components/apis/Apis.js`

Add to the Apis object:

```javascript
// Inbound dial handling
getInboundAgents: `${BasePath}api/agent/list`,
getInboundSettings: (phoneNumberId) => `${BasePath}api/dialer/phone-numbers/${phoneNumberId}/inbound-settings`,
updateInboundSettings: (phoneNumberId) => `${BasePath}api/dialer/phone-numbers/${phoneNumberId}/inbound-settings`,
```

---

## Phase 2: Update DialerSettings Component

### What to Implement

- [ ] Add state for inbound settings
- [ ] Fetch inbound agents on dialog open
- [ ] Fetch settings when phone number is selected
- [ ] Add inbound settings form UI
- [ ] Implement save functionality

### Implementation

**File:** `components/dialer/DialerSettings.tsx`

#### Add Imports

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
```

#### Add Types

```tsx
interface Agent {
  id: number;
  name: string;
  agentType: 'inbound' | 'outbound';
  modelIdVapi: string;
}

interface InboundSettings {
  forwardingNumber: string | null;
  defaultVoiceAgentId: number | null;
  defaultVoiceAgent?: Agent;
}
```

#### Add State

```tsx
// Inbound settings state
const [forwardingNumber, setForwardingNumber] = useState<string>('');
const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
const [inboundAgents, setInboundAgents] = useState<Agent[]>([]);
const [loadingAgents, setLoadingAgents] = useState(false);
const [savingSettings, setSavingSettings] = useState(false);
const [forwardingError, setForwardingError] = useState<string>('');
```

#### Add Fetch Functions

```tsx
// Fetch inbound agents
const fetchInboundAgents = async () => {
  try {
    setLoadingAgents(true);
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token;

    const response = await fetch(`${Apis.getInboundAgents}?agentType=inbound`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.status && data.data) {
      setInboundAgents(data.data.filter((agent: Agent) => agent.agentType === 'inbound'));
    }
  } catch (error) {
    console.error('Error fetching inbound agents:', error);
    toast.error('Failed to load voice agents');
  } finally {
    setLoadingAgents(false);
  }
};

// Fetch inbound settings for selected phone number
const fetchInboundSettings = async (phoneNumberId: number) => {
  try {
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token;

    const response = await fetch(Apis.getInboundSettings(phoneNumberId), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.status && data.data) {
      setForwardingNumber(data.data.forwardingNumber || '');
      setSelectedAgentId(data.data.defaultVoiceAgentId);
    }
  } catch (error) {
    console.error('Error fetching inbound settings:', error);
  }
};
```

#### Add Save Function

```tsx
// Validate forwarding number
const validateForwardingNumber = (value: string): boolean => {
  if (!value) return true; // Optional
  return /^\+[1-9]\d{1,14}$/.test(value);
};

// Save inbound settings
const handleSaveInboundSettings = async () => {
  if (!selectedNumberId) {
    toast.error('Please select a phone number first');
    return;
  }

  if (forwardingNumber && !validateForwardingNumber(forwardingNumber)) {
    setForwardingError('Please enter a valid E.164 phone number (e.g., +12025551234)');
    return;
  }

  try {
    setSavingSettings(true);
    setForwardingError('');

    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token;

    const response = await fetch(Apis.updateInboundSettings(selectedNumberId), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        forwardingNumber: forwardingNumber || null,
        defaultVoiceAgentId: selectedAgentId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save settings');
    }

    toast.success('Inbound settings saved successfully');
  } catch (error: any) {
    console.error('Error saving inbound settings:', error);
    toast.error(error.message || 'Failed to save inbound settings');
  } finally {
    setSavingSettings(false);
  }
};
```

#### Add useEffect Hooks

```tsx
// Fetch agents when dialog opens
useEffect(() => {
  if (open) {
    fetchInboundAgents();
  }
}, [open]);

// Fetch settings when phone number is selected
useEffect(() => {
  if (selectedNumberId) {
    fetchInboundSettings(selectedNumberId);
  } else {
    // Reset form when no number selected
    setForwardingNumber('');
    setSelectedAgentId(null);
  }
}, [selectedNumberId]);

// Clear error when forwarding number changes
useEffect(() => {
  if (forwardingError && validateForwardingNumber(forwardingNumber)) {
    setForwardingError('');
  }
}, [forwardingNumber]);
```

#### Add UI Elements

Add this after the phone number list section in the dialog:

```tsx
{/* Inbound Call Settings Section */}
{selectedNumberId && (
  <div className="mt-6 pt-6 border-t border-gray-200">
    <h4 className="font-medium text-base mb-4">Inbound Call Routing</h4>

    {/* Forwarding Number */}
    <div className="space-y-2 mb-4">
      <label className="text-sm font-medium">Forwarding Number (Optional)</label>
      <Input
        type="tel"
        placeholder="+1234567890"
        value={forwardingNumber}
        onChange={(e) => setForwardingNumber(e.target.value)}
        className={forwardingError ? 'border-red-500' : ''}
      />
      {forwardingError ? (
        <p className="text-xs text-red-500">{forwardingError}</p>
      ) : (
        <p className="text-xs text-gray-500">
          Incoming calls will try this number first. If no answer after 25 seconds,
          the call will be routed to your voice agent.
        </p>
      )}
    </div>

    {/* Default Voice Agent */}
    <div className="space-y-2 mb-4">
      <label className="text-sm font-medium">Default Voice Agent *</label>
      {loadingAgents ? (
        <div className="text-sm text-gray-500">Loading agents...</div>
      ) : inboundAgents.length === 0 ? (
        <div className="text-sm text-gray-500">
          No inbound agents found. Create an inbound agent first.
        </div>
      ) : (
        <Select
          value={selectedAgentId?.toString() || ''}
          onValueChange={(value) => setSelectedAgentId(value ? Number(value) : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an inbound agent" />
          </SelectTrigger>
          <SelectContent>
            {inboundAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id.toString()}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <p className="text-xs text-gray-500">
        {forwardingNumber
          ? 'This agent will answer if the forwarding number is unavailable.'
          : 'All incoming calls will be answered by this agent.'}
      </p>
    </div>

    {/* Save Button */}
    <Button
      onClick={handleSaveInboundSettings}
      disabled={savingSettings || !selectedAgentId || loadingAgents}
      className="w-full"
    >
      {savingSettings ? 'Saving...' : 'Save Inbound Settings'}
    </Button>
  </div>
)}
```

---

## Phase 3: Handle Loading States

### What to Implement

- [ ] Show loading indicator while fetching settings
- [ ] Disable form while saving
- [ ] Handle error states gracefully

### Implementation

Add loading state for settings:

```tsx
const [loadingSettings, setLoadingSettings] = useState(false);

// Update fetchInboundSettings
const fetchInboundSettings = async (phoneNumberId: number) => {
  try {
    setLoadingSettings(true);
    // ... existing code
  } finally {
    setLoadingSettings(false);
  }
};
```

Add loading UI:

```tsx
{loadingSettings ? (
  <div className="mt-6 pt-6 border-t border-gray-200">
    <div className="text-center py-4 text-gray-500">
      Loading inbound settings...
    </div>
  </div>
) : (
  // ... existing inbound settings form
)}
```

---

## Success Criteria

- [ ] Inbound agents dropdown populated correctly
- [ ] Current settings loaded when phone number selected
- [ ] Forwarding number validated as E.164
- [ ] Settings saved successfully with success toast
- [ ] Error messages displayed appropriately
- [ ] Loading states shown during async operations

## Troubleshooting

### Agents not loading
- Check API endpoint is correct
- Verify user has inbound agents created
- Check console for network errors

### Settings not saving
- Check phone number is selected
- Verify agent is selected
- Check forwarding number format if provided
- Check console for API errors

### Form not resetting
- Ensure selectedNumberId changes trigger useEffect
- Clear state when no number selected
