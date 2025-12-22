'use client'

import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import Apis from '../apis/Apis'

interface PhoneNumber {
  id: number
  phone: string
  e164: string
  phoneSid: string
  usageType: 'vapi' | 'internal_dialer' | 'internal' | 'unassigned'
  isActive: boolean
  provider: string
}

export default function DialerSettings() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedNumberId, setSelectedNumberId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  const fetchPhoneNumbers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token

      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch('/api/dialer/phone-numbers', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Failed to fetch phone numbers')
        return
      }

      setPhoneNumbers(data.data || [])
      const dialerNumber = data.data?.find((pn: PhoneNumber) => pn.usageType === 'internal_dialer')
      if (dialerNumber) {
        setSelectedNumberId(dialerNumber.id)
      }
    } catch (error: any) {
      console.error('Error fetching phone numbers:', error)
      toast.error('Failed to fetch phone numbers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchPhoneNumbers()
    }
  }, [open])

  const handleSetDialerNumber = async (phoneNumberId: number) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token

      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch('/api/dialer/phone-numbers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumberId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Failed to set dialer number')
        return
      }

      setSelectedNumberId(phoneNumberId)
      toast.success('Internal dialer number set successfully')
      fetchPhoneNumbers()
    } catch (error: any) {
      console.error('Error setting dialer number:', error)
      toast.error('Failed to set dialer number')
    } finally {
      setLoading(false)
    }
  }

  const getUsageTypeBadge = (usageType: string) => {
    switch (usageType) {
      case 'internal_dialer':
        return <Badge className="bg-blue-500">Dialer</Badge>
      case 'vapi':
        return <Badge className="bg-green-500">VAPI</Badge>
      case 'internal':
        return <Badge className="bg-gray-500">Internal</Badge>
      default:
        return <Badge className="bg-gray-300">Unassigned</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Configure Dialer Number</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Internal Dialer Number</DialogTitle>
          <DialogDescription>
            Choose a Twilio number to use for the dialer. This number will be used as the caller ID for all dialer calls.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {loading && phoneNumbers.length === 0 ? (
            <div className="text-center py-8">Loading phone numbers...</div>
          ) : phoneNumbers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No phone numbers available. Please purchase a Twilio number first.
            </div>
          ) : (
            <div className="space-y-2">
              {phoneNumbers.map((pn) => (
                <div
                  key={pn.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    selectedNumberId === pn.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{pn.phone}</div>
                      <div className="text-sm text-gray-500">{pn.phoneSid}</div>
                    </div>
                    {getUsageTypeBadge(pn.usageType)}
                  </div>
                  <Button
                    size="sm"
                    variant={selectedNumberId === pn.id ? 'default' : 'outline'}
                    onClick={() => handleSetDialerNumber(pn.id)}
                    disabled={loading || selectedNumberId === pn.id}
                  >
                    {selectedNumberId === pn.id ? 'Selected' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
