'use client'

import axios from 'axios'
import classNames from 'classnames'
import { m } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'

import { AgentXOrb } from '@/components/common/AgentXOrb'
import CloseBtn from '@/components/globalExtras/CloseBtn'

import Apis from '../apis/Apis'
import { API_KEY, DEFAULT_ASSISTANT_ID } from './constants'

export default function VapiChatWidget({
  assistantId = DEFAULT_ASSISTANT_ID,
  show = true,
  setShowVapiChatWidget,
}) {
  const [vapi, setVapi] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let instance
    let mounted = true

    const initVapi = async () => {
      try {
        const mod = await import('@vapi-ai/web')
        const VapiClient = mod.default ?? mod
        instance = new VapiClient(API_KEY)

        if (!mounted) return

        // Save Vapi instance
        setVapi(instance)
        // Connect to assistant in chat mode

        instance.on('call-start', () => {
          instance.setMuted(true)
          setLoading(false)
          // setOpen(true);
          // setStatusMessage("Call started with Sky");
        })
        instance.on('call-end', () => {
          // setOpen(false);
          // setIsSpeaking(false);
          // setStatusMessage("Call ended");
          open = false
        })

        instance.on('speech-start', () => setIsSpeaking(true))
        instance.on('speech-end', () => setIsSpeaking(false))

        // Listen to incoming messages
        instance.on('message', (msg) => {
          console.log('msg received ', msg)
          if (msg?.type === 'conversation-update') {
            let newMsg = msg?.messages || []

            newMsg = newMsg.filter((m) => {
              if (m.role === 'system') {
                return null
              }
              return m
            })
            setMessages(newMsg)
          }
        })

        instance.on('error', (err) => {
          console.error('Vapi error:', err)
          handleClose()
        })
      } catch (err) {
        console.error('Failed to initialize Vapi:', err)
      }
    }

    initVapi()

    return () => {
      mounted = false
      if (instance?.removeAllListeners) instance.removeAllListeners()
      instance?.stop?.()
    }
  }, [assistantId])

  const sendMessage = async () => {
    if (!inputValue.trim() || !vapi) return

    const userMessage = {
      role: 'user',
      content: inputValue,
    }

    // Show user message
    // setMessages((prev) => [...prev, userMessage]);

    // Send to Vapi assistant
    try {
      await vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: inputValue,
        },
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }

    setInputValue('')
  }
  const getProfileSupportDetails = async () => {
    console.log('get profile support details api calling')
    let user = null
    try {
      const data = localStorage.getItem('User')

      if (data) {
        user = JSON.parse(data)

        let path = Apis.profileSupportDetails

        const response = await axios.get(path, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            console.log('profile support details are', response.data)
            let data = response.data.data
            let pipelineData = data.pipelines

            delete data.pipelines

            return {
              profile: user.user,
              additionalData: response.data.data,
              pipelines: pipelineData,
            }
          } else {
            console.log('profile support message is', response.data.message)

            return user.user
          }
        }
      }
    } catch (e) {
      console.log('error in get profile suppport details api is', e)
      return user.user
    }
  }

  useEffect(() => {
    startChat()
    // muteAssistantAudio(true)
  }, [vapi])
  // Function to mute/unmute assistant audio
  const muteAssistantAudio = (mute) => {
    // Find all audio elements (Vapi might create them)
    const audioElements = document.querySelectorAll('audio')
    console.log(
      `${mute ? 'Muting' : 'Unmuting'} ${audioElements.length} audio elements`,
    )

    audioElements.forEach((audio) => {
      audio.muted = mute
    })

    // Also check for any audio elements in shadow DOM or iframes
    const iframes = document.querySelectorAll('iframe')
    iframes.forEach((iframe) => {
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document
        if (iframeDoc) {
          const iframeAudioElements = iframeDoc.querySelectorAll('audio')
          iframeAudioElements.forEach((audio) => {
            audio.muted = mute
          })
        }
      } catch (e) {
        console.error(e)
        // Cross-origin iframe, can't access
        console.log('Cannot access iframe audio elements (cross-origin)')
      }
    })
  }

  const startChat = async () => {
    console.log('starting chat')
    if (vapi) {
      // vapi.setMuted(true)
      let userProfile = await getProfileSupportDetails()

      let pipelineData = userProfile?.pipelines || []

      delete userProfile?.pipelines
      const assistantOverrides = {
        recordingEnabled: false,
        variableValues: {
          customer_details: JSON.stringify(userProfile),
        },
      }

      console.log('assistante overrides', assistantOverrides)

      vapi.start(assistantId, assistantOverrides)
      // setLoading(false);
    }
  }

  const handleClose = async () => {
    try {
      await vapi?.stop()
    } catch (err) {
      console.warn('Error stopping Vapi:', err)
    }
    setShowVapiChatWidget(false)
    show = false
    // setOpen(false);
    // setShouldStartCall(false);
    // setShowAskSkyModal(false);
  }

  if (!show) return null

  return (
    <div className="fixed bottom-6 flex flex-col items-end gap-2 right-6 w-[350px] max-h-[600px]">
      <div className="w-full h-full bg-white shadow-lg rounded-xl flex flex-col z-[9999] border border-gray-200">
        <div className="p-4 font-semibold text-purple-700 text-lg border-b border-gray-100">
          Chat with Sky
        </div>

        {loading ? (
          <div className="w-full flex items-center justify-center pb-4">
            <AgentXOrb
              size={120}
              alt="AgentX Orb"
              className="relative z-10 rounded-full bg-white shadow-lg object-cover"
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={classNames(
                    'max-w-[80%] px-3 py-2 text-sm rounded',
                    msg.role === 'user'
                      ? 'self-end ml-auto text-end'
                      : 'bg-blue-100 self-start mr-auto',
                  )}
                >
                  {msg.message}
                </div>
              ))}
            </div>

            <div className="p-3 border-t flex items-center gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={sendMessage}
                className="bg-purple text-white px-4 py-2 text-sm rounded"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
      <div className="self-end">
        <CloseBtn onClick={handleClose} />
      </div>
    </div>
  )
}
