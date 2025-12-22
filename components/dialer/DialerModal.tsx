'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import DialerSettings from './DialerSettings'

// @ts-ignore - Twilio Voice SDK types
import { Device, Call } from '@twilio/voice-sdk'

type CallStatus = 'idle' | 'requesting-mic' | 'connecting' | 'ringing' | 'in-call' | 'ended' | 'error'

interface DialerModalProps {
  open: boolean
  onClose: () => void
  initialPhoneNumber?: string
  leadId?: number
  leadName?: string
}

export default function DialerModal({
  open,
  onClose,
  initialPhoneNumber = '',
  leadId,
  leadName,
}: DialerModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [device, setDevice] = useState<Device | null>(null)
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [hasDialerNumber, setHasDialerNumber] = useState(false)
  const [checkingDialerNumber, setCheckingDialerNumber] = useState(true)
  const [initializing, setInitializing] = useState(false)

  // Update phone number when initialPhoneNumber changes
  useEffect(() => {
    if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber)
    }
  }, [initialPhoneNumber])

  // Initialize device when modal opens
  useEffect(() => {
    if (open) {
      checkDialerNumber()
      initializeDevice()
    } else {
      // Cleanup when modal closes
      if (activeCall) {
        activeCall.disconnect()
        setActiveCall(null)
      }
      if (device) {
        device.destroy()
        setDevice(null)
      }
      setCallStatus('idle')
    }

    return () => {
      if (device) {
        device.destroy()
      }
    }
  }, [open])

  const checkDialerNumber = async () => {
    try {
      setCheckingDialerNumber(true)
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token
      if (!token) {
        setHasDialerNumber(false)
        return
      }

      const response = await fetch('/api/dialer/phone-numbers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.status && data.data) {
        const hasDialer = data.data.some((pn: any) => pn.usageType === 'internal_dialer')
        setHasDialerNumber(hasDialer)
        if (!hasDialer) {
          toast.error('No internal dialer number set. Please configure one first.')
        }
      } else {
        setHasDialerNumber(false)
      }
    } catch (error) {
      console.error('Error checking dialer number:', error)
      setHasDialerNumber(false)
    } finally {
      setCheckingDialerNumber(false)
    }
  }

  const initializeDevice = async () => {
    if (initializing) return

    try {
      setInitializing(true)
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token
      if (!token) {
        toast.error('Not authenticated')
        return
      }

      // Get access token from backend
      const response = await fetch('/api/dialer/calls/token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            leadId: leadId || null,
            leadName: leadName || null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setHasDialerNumber(false)
          toast.error('No internal dialer number set. Please configure one in settings.')
        } else {
          toast.error(data.message || 'Failed to get access token')
        }
        return
      }

      // Initialize Twilio Device
      const twilioDevice = new Device(data.token, {
        logLevel: 1,
      })

      twilioDevice.on('registered', () => {
        console.log('Twilio Device registered')
      })

      twilioDevice.on('error', (error: any) => {
        console.error('Twilio Device error:', error)
        setCallStatus('error')
        toast.error(`Device error: ${error.message}`)
      })

      twilioDevice.on('incoming', (call: Call) => {
        console.log('Incoming call:', call)
        // Handle incoming calls if needed
      })

      setDevice(twilioDevice)
    } catch (error: any) {
      console.error('Error initializing device:', error)
      toast.error('Failed to initialize dialer')
    } finally {
      setInitializing(false)
    }
  }

  const handleCall = async () => {
    if (!device) {
      toast.error('Device not initialized. Please wait...')
      return
    }

    if (!phoneNumber) {
      toast.error('Please enter a phone number')
      return
    }

    if (!hasDialerNumber) {
      toast.error('No internal dialer number set. Please configure one first.')
      return
    }

    try {
      setCallStatus('requesting-mic')

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop()) // Stop immediately, Device will handle it

      setCallStatus('connecting')

      const user = JSON.parse(localStorage.getItem('User') || '{}')
      const call = await device.connect({
        params: {
          To: phoneNumber,
          tenantId: user.agencyId || user.id,
          userId: user.id,
          leadId: leadId || '',
          leadName: leadName || '',
        },
      })

      setActiveCall(call)
      setCallStatus('ringing')

      call.on('accept', () => {
        setCallStatus('in-call')
        toast.success('Call connected')
      })

      call.on('disconnect', () => {
        setCallStatus('ended')
        setActiveCall(null)
        toast.info('Call ended')
      })

      call.on('cancel', () => {
        setCallStatus('ended')
        setActiveCall(null)
        toast.info('Call canceled')
      })

      call.on('error', (error: any) => {
        console.error('Call error:', error)
        setCallStatus('error')
        setActiveCall(null)
        toast.error(`Call error: ${error.message}`)
      })
    } catch (error: any) {
      console.error('Error making call:', error)
      setCallStatus('error')
      toast.error(`Failed to make call: ${error.message}`)
    }
  }

  const handleEndCall = () => {
    if (activeCall) {
      activeCall.disconnect()
      setActiveCall(null)
      setCallStatus('idle')
    }
  }

  const getStatusBadge = () => {
    const statusColors: Record<CallStatus, string> = {
      idle: 'bg-gray-500',
      'requesting-mic': 'bg-yellow-500',
      connecting: 'bg-blue-500',
      ringing: 'bg-blue-500',
      'in-call': 'bg-green-500',
      ended: 'bg-gray-500',
      error: 'bg-red-500',
    }

    return (
      <Badge className={statusColors[callStatus] || 'bg-gray-500'}>
        {callStatus.replace('-', ' ').toUpperCase()}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Twilio Dialer</DialogTitle>
              <DialogDescription>
                {leadName ? `Calling ${leadName}` : 'Make a call directly from your browser'}
              </DialogDescription>
            </div>
            <DialerSettings />
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {checkingDialerNumber || initializing ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">Initializing dialer...</div>
            </div>
          ) : !hasDialerNumber ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No internal dialer number configured. Please set one to start making calls.
              </p>
              <DialerSettings />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge()}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number (E.164 format)</label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={callStatus === 'in-call' || callStatus === 'connecting' || callStatus === 'ringing'}
                />
              </div>

              <div className="flex gap-2">
                {callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error' ? (
                  <Button onClick={handleCall} className="flex-1" disabled={!device || initializing}>
                    {initializing ? 'Initializing...' : 'Call'}
                  </Button>
                ) : (
                  <Button onClick={handleEndCall} className="flex-1" variant="destructive">
                    End Call
                  </Button>
                )}
              </div>

              {callStatus === 'in-call' && (
                <div className="text-center py-4">
                  <div className="text-lg font-semibold text-green-600">Call in progress...</div>
                  <div className="text-sm text-gray-500 mt-2">
                    You can close this dialog - the call will continue
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
