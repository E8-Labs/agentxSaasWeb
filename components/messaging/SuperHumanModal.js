import { Box, Modal } from '@mui/material'
import React from 'react'
import CloseBtn from '../globalExtras/CloseBtn'
import Image from 'next/image'

const SuperHumanModal = ({ open, onClose, onStart, allowAIEmailAndText, shouldShowAiEmailAndTextRequestFeature, shouldShowAllowAiEmailAndTextUpgrade }) => {
    return (
        <div>
            <div
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                }}
            >
                <CloseBtn onClick={onClose} />
            </div>
            <img
                src="/superHuman.png"
                alt="superhuman icon"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
            <div className='text-start mt-2 text-[18px] font-semibold'>AI Powered Emails & Texts</div>
            <div className='text-start text-sm text-[#666666] mt-2'>
                Your agent can send and respond to messages for you instantly and intelligently. Never miss a reply, and handle conversations at scale without being glued to your inbox.
            </div>
            <button className='w-full h-[50px] mt-4 rounded-lg bg-brand-primary text-white mt-4' style={{ fontWeight: '600', fontSize: 15 }} onClick={onStart}>
                {
                    allowAIEmailAndText ? "Get Started" :
                        shouldShowAiEmailAndTextRequestFeature ? "Request Feature" :
                            shouldShowAllowAiEmailAndTextUpgrade ? "Upgrade Plan" : ""
                }
            </button>
        </div>
    )
}

export default SuperHumanModal