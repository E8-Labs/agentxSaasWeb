'use client'

import { useEffect, useState, useRef } from 'react'
import { Button as ButtonBase } from '../ui/button'
import { Input as InputBase } from '../ui/input'
import { Card as CardBase, CardContent as CardContentBase, CardDescription as CardDescriptionBase, CardHeader as CardHeaderBase, CardTitle as CardTitleBase } from '../ui/card'
import { Badge } from '../ui/badge'
import { toast } from '@/utils/toast'
import DialerSettings from './DialerSettings'

// @ts-ignore - Twilio Voice SDK types
import { Device, Call } from '@twilio/voice-sdk'

// Type assertions for components from .jsx files
const Button = ButtonBase as any
const Input = InputBase as any
const Card = CardBase as any
const CardContent = CardContentBase as any
const CardDescription = CardDescriptionBase as any
const CardHeader = CardHeaderBase as any
const CardTitle = CardTitleBase as any

type CallStatus = 'idle' | 'requesting-mic' | 'connecting' | 'ringing' | 'in-call' | 'ended' | 'error'

export default function TwilioDialer() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [device, setDevice] = useState<Device | null>(null)
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [hasDialerNumber, setHasDialerNumber] = useState(false)
  const [checkingDialerNumber, setCheckingDialerNumber] = useState(true)

  useEffect(() => {
    checkDialerNumber()
    initializeDevice()

    return () => {
      if (device) {
        device.destroy()
      }
    }
  }, [])

  const checkDialerNumber = async () => {
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token
      if (!token) return

      const response = await fetch('/api/dialer/phone-numbers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.status && data.data) {
        const hasDialer = data.data.some((pn: any) => pn.usageType === 'internal_dialer')
        setHasDialerNumber(hasDialer)
      }
    } catch (error) {
      console.error('Error checking dialer number:', error)
    } finally {
      setCheckingDialerNumber(false)
    }
  }

  const initializeDevice = async () => {
    try {
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
        body: JSON.stringify({}),
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
      // Configure edge for US/Canada users - use US East (ashburn) for best coverage
      // This ensures device registers in US region, matching phone number configuration
      const twilioDevice = new Device(data.token, {
        logLevel: 1,
        edge: 'ashburn', // US East edge - matches phone number inbound processing region (us1)
      } as any)

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
    }
  }

  const handleCall = async () => {
    if (!device) {
      toast.error('Device not initialized')
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
      <Badge variant="outline" className={statusColors[callStatus] || 'bg-gray-500'}>
        {callStatus.replace('-', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (checkingDialerNumber) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Twilio Dialer</CardTitle>
            <CardDescription>Make calls directly from your browser</CardDescription>
          </div>
          <DialerSettings />
        </div>
      </CardHeader>
      <CardContent>
        {!hasDialerNumber ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No internal dialer number configured. Please set one to start making calls.
            </p>
            <DialerSettings />
          </div>
        ) : (
          <div className="space-y-4">
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
                <Button onClick={handleCall} className="flex-1" disabled={!device}>
                  Call
                </Button>
              ) : (
                <Button onClick={handleEndCall} className="flex-1" variant="destructive">
                  End Call
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
