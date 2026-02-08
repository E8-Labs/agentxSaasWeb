import Image from 'next/image'

import { AgentXOrb } from '@/components/common/AgentXOrb'
import { AudioWaveActivity } from './askskycomponents/AudioWaveActivity'
import { VoiceWavesComponent } from './askskycomponents/voice-waves'
import { MYAGENTX_URL } from './constants'
import { useUser } from '@/hooks/redux-hooks'
import { useEffect } from 'react'

const DEFAULT_LOGO_SRC = "/assets/assignX.png"  //'/agentx-logo.png'
const DEFAULT_LOGO_ALT = 'AgentX Logo'

export function VoiceInterface({
  loading,
  loadingMessage,
  isSpeaking,
  poweredByLogoUrl,
  poweredByLink,
  poweredByAlt,
  poweredByText,
}) {

  //redux user local data
  const { user: reduxUser, setUser: setReduxUser } = useUser();


  const link = poweredByLink ?? MYAGENTX_URL
  const showTextOnly = !!poweredByText
  const logoUrl = poweredByLogoUrl ?? DEFAULT_LOGO_SRC
  const alt = poweredByAlt ?? DEFAULT_LOGO_ALT
  const isExternalLogo = !showTextOnly && (logoUrl.startsWith('http://') || logoUrl.startsWith('https://'))
  //AgentX show powered by logo base on user role
  const userRole = reduxUser?.userRole


  return (
    <>
      <div className="h-[200px] w-[200px] flex flex-col items-center justify-between mb-8">
        <div className="relative w-[125px] h-[150px] mx-auto mt-4">
          {/* Gradient Glow Border */}
          {/* <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 blur-2xl opacity-70"></div> */}

          {/* Image */}
          <AgentXOrb
            size={120}
            alt="AgentX Orb"
            className="relative z-10 rounded-full bg-white shadow-lg object-cover"
          />
        </div>
        {loading ? (
          <p
            style={{
              whiteSpace: 'nowrap',
            }}
            className="mt-10 italic w-full text-center truncate"
          >
            {loadingMessage}
          </p>
        ) : isSpeaking ? (
          <VoiceWavesComponent className="mt-12" />
        ) : (
          <AudioWaveActivity
            isActive={isSpeaking}
            barCount={15}
            className="mt-10"
          />
        )}
      </div>
      {
        userRole === 'AgentX' && (
          <div className="relative w-2/3 flex flex-col h-5 items-center justify-center gap-6 z-10">
            <div className="h-full flex justify-center items-center gap-1">
              <p className="text-xs pt-1">Powered by</p>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-medium"
              >
                {showTextOnly ? (
                  <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                    {poweredByText}
                  </span>
                ) : isExternalLogo ? (
                  <img
                    src={logoUrl}
                    alt={alt}
                    className="max-h-[14px] w-auto h-auto object-contain"
                    style={{ height: 14 }}
                  />
                ) : (
                  <Image
                    src={logoUrl}
                    alt={alt}
                    className="w-auto h-auto"
                    height={14}
                    width={60}
                  />
                )}
              </a>
            </div>
          </div>
        )
      }
    </>
  )
}
