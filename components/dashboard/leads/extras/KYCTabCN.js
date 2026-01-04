'use client'

import React from 'react'
import { UserCheck } from 'lucide-react'
import Image from 'next/image'

import {
  TypographyBody,
  TypographyCaption,
  TypographyBodySemibold,
} from '@/lib/typography'

const KYCTabCN = ({ kycs = [] }) => {
  if (kycs?.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center w-full mt-12">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <UserCheck className="h-6 w-6" />
        </div>
        <TypographyBody className="mt-4 italic text-muted-foreground">
          KYC Data collected from calls will be shown here
        </TypographyBody>
      </div>
    )
  }

  return (
    <div className="w-full mt-4 pb-12">
      {kycs.map((item, index) => (
        <div key={index} className="w-full flex flex-row gap-2 mt-2">
          <div className="h-full w-0.5 bg-destructive" />
          <div className="h-full w-full">
            <TypographyBodySemibold className="mt-4">
              {item.question &&
              typeof item.question === 'string'
                ? item.question
                    .split('ylz8ibb4uykg29mogltl')
                    .join('')
                    .trim()
                : ''}
            </TypographyBodySemibold>
            <TypographyBody className="mt-1 text-muted-foreground">
              {item.answer}
            </TypographyBody>
          </div>
        </div>
      ))}
    </div>
  )
}

export default KYCTabCN

