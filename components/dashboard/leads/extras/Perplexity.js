import { get } from 'draft-js/lib/DefaultDraftBlockRenderMap'
import Image from 'next/image'
import React, { useState } from 'react'
import {
  TypographyBody,
  TypographyCaption,
  TypographyBodySemibold,
  TypographyBodyMedium,
  TypographyH2,
  TypographyTitle,
} from '@/lib/typography'

function Perplexity({ selectedLeadsDetails }) {
  let enrichData = selectedLeadsDetails?.enrichData
    ? JSON.parse(selectedLeadsDetails?.enrichData)
    : ''

  let profiles = enrichData?.profiles

  profiles = [
    ...(profiles?.length > 0 ? profiles : []),
    ...(enrichData?.images?.length > 0 ? enrichData?.images : []),
    ...(enrichData?.videos?.length > 0 ? enrichData?.videos : []),
    ...(enrichData?.citations?.length > 0 ? enrichData?.citations : []),
  ]

  const [isExpanded, setIsExpanded] = useState(false)
  // console.log('profiles', profiles)

  // enrichData.summary = "Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development."

  // console.log('profiles', profiles)

  const getIcon = (item) => {
    if (item.icon) {
      if (item.icon === 'instagram') {
        return '/svgIcons/instagram.svg'
      } else if (item.icon === 'youtube') {
        return '/svgIcons/youtube.svg'
      } else if (item.icon === 'linkedin') {
        return '/svgIcons/linkedin.svg'
      } else {
        return '/svgIcons/globe.svg'
      }
    } else {
      return '/svgIcons/globe.svg'
    }
  }

  const getProfileView = (item, index) => {
    if (item.name) {
      return (
        <div className="w-full flex flex-col h-[100px] px-2 py-2 bg-[#FAFAFA] rounded">
          <div className="flex flex-row items-center gap-2 mb-1">
            <Image
              src={getIcon(item)}
              height={24}
              width={24}
              alt="*"
              // style={{ borderRadius: "50%" }}
            />
            <TypographyBodyMedium className="text-muted-foreground">
              {item.name}
            </TypographyBodyMedium>
          </div>

          <TypographyBodyMedium
            className="h-[50px] overflow-auto text-left"
          >
            {item.description.length > 12
              ? `${item.description.slice(0, 12)}..`
              : item.description}
          </TypographyBodyMedium>
        </div>
      )
    } else {
      return (
        <div>
          <div className="w-full flex flex-col h-[100px] px-2 py-2 bg-[#FAFAFA] rounded">
            <div className="flex flex-row items-center gap-2 mb-1">
              <Image
                src={getIcon(item)}
                height={24}
                width={24}
                alt="*"
                // style={{ borderRadius: "50%" }}
              />
              <TypographyBodyMedium className="text-muted-foreground">
                {getSourceName(item.url)}
              </TypographyBodyMedium>
            </div>

            <TypographyBodyMedium className="h-[50px] overflow-auto text-left">
              {item.url}
            </TypographyBodyMedium>
          </div>
        </div>
      )
    }
  }

  function getSourceName(url) {
    try {
      const parsedUrl = new URL(url)
      const host = parsedUrl.hostname // e.g., "andresgonzalez.webflow.io"
      const parts = host.split('.')

      // For Webflow subdomains like "andresgonzalez.webflow.io"
      if (parts.length > 2 && parts.includes('webflow')) {
        return parts[0] // "andresgonzalez"
      }

      // For custom domains
      let name = parts[parts.length - 2] // e.g., "webflow" from "andresgonzalez.webflow.io"
      return name // fallback
    } catch (err) {
      // console.error("Invalid", err);
      return null
    }
  }

  const calculateConfidanseScore = () => {
    let score = 0
    let avgScore = 0
    if (profiles.length > 0) {
      profiles.map((item) => {
        if (item.confidence_score) {
          score += item.confidence_score
        }
      })

      avgScore = (score / profiles.length) * 100

      // console.log('avgScore', avgScore)
    }
    return avgScore
  }

  return (
    <div
      className="w-full flex flex-col items-center mt-3 gap-3 h-[42vh]"
      style={{
        overflow: 'auto',
        scrollbarWidth: 'none',
        // overflowX: "hidden",
      }}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          {/* <Image
                        src={"/svgIcons/image.svg"}
                        height={24}
                        width={24}
                        alt="*"
                        style={{ borderRadius: "50%" }}
                    /> */}

          <TypographyH2 className="whitespace-nowrap">
            More {selectedLeadsDetails?.firstName}
          </TypographyH2>
        </div>

        <div className="flex flex-row items-center gap-2 ">
          <Image
            src={'/svgIcons/confidanceIcon.svg'}
            height={24}
            width={24}
            alt="*"
          />

          <TypographyH2 className="whitespace-nowrap">
            Confidence Score:{' '}
            <span className="text-brand-primary">
              {calculateConfidanseScore().toFixed(2)}%
            </span>
          </TypographyH2>
        </div>
      </div>
      <div className="w-full flex flex-row items-start gap-2">
        <div className="grid grid-cols-3 gap-3 w-[80%] h-auto overflow-y-auto">
          {profiles?.length > 0
            ? profiles.slice(0, 6).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    window.open(item.url, '_blank')
                  }}
                >
                  {getProfileView(item, index)}
                </button>
              ))
            : ''
              // <div>No Profiles Found</div>
          }
        </div>
        {profiles?.length > 6 && (
          <div className="flex flex-col items-center gap-3 p-3">
            <div className="flex flex-row items-center">
              <Image
                src={'/svgIcons/image1.svg'}
                height={24}
                width={24}
                alt="*"
                style={{ borderRadius: '50%' }}
              />
              <Image
                src={'/svgIcons/image2.svg'}
                height={24}
                width={24}
                alt="*"
                style={{ borderRadius: '50%' }}
              />
              <Image
                src={'/svgIcons/image3.svg'}
                height={24}
                width={24}
                alt="*"
                style={{ borderRadius: '50%' }}
              />
            </div>
            <TypographyBodyMedium className="text-muted-foreground">
              +{profiles.length - 6} sources
            </TypographyBodyMedium>
          </div>
        )}
      </div>

      <div className="w-full flex flex-row items-cneter gap-2 mt-5">
        <Image src={'/svgIcons/sparkles.svg'} height={24} width={24} alt="*" />

        <TypographyTitle>More detail</TypographyTitle>
      </div>

      <div className="flex flex-col items-start w-full">
        <TypographyBodySemibold className="mt-4">
          {enrichData?.summary?.length > 400
            ? isExpanded
              ? `${enrichData.summary}`
              : `${enrichData.summary.slice(0, 400)}...`
            : enrichData.summary}
        </TypographyBodySemibold>
        {enrichData?.summary?.length > 400 && (
          <button
            onClick={() => {
              setIsExpanded(!isExpanded)
            }}
            className="mt-2 text-brand-primary underline"
          >
            <TypographyBodySemibold className="text-brand-primary underline">
              {isExpanded ? 'Read Less' : 'Read more'}
            </TypographyBodySemibold>
          </button>
        )}
      </div>
    </div>
  )
}

export default Perplexity
