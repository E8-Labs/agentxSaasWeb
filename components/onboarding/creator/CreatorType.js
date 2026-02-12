'use client'

import { CircularProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'

import { PersistanceKeys } from '@/constants/Constants'
import { Checkbox } from '@/components/ui/checkbox'

import Footer from '../Footer'
import Header from '../Header'
import ProgressBar from '../ProgressBar'

const CREATOR_TYPES = [
  { id: 'coach_consultant', title: 'Coach / Consultant' },
  { id: 'course_creator', title: 'Course Creator' },
  { id: 'influencer_personal_brand', title: 'Influencer / Personal Brand' },
  { id: 'ecommerce_brand_owner', title: 'E-commerce Brand Owner' },
  { id: 'educator_community_builder', title: 'Educator / Community Builder' },
  { id: 'thought_leader_speaker', title: 'Thought Leader / Speaker' },
]

const CreatorType = ({ handleContinue, handleBack }) => {
  const [selectedCreatorType, setSelectedCreatorType] = useState(null)
  const [shouldContinue, setShouldContinue] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem(PersistanceKeys.RegisterDetails)
    if (data) {
      const details = JSON.parse(data)
      if (details.creatorType) {
        setSelectedCreatorType(details.creatorType)
      }
    }
  }, [])

  useEffect(() => {
    setShouldContinue(selectedCreatorType == null || selectedCreatorType === '')
  }, [selectedCreatorType])

  const handleSelect = (id) => {
    setSelectedCreatorType(id)
  }

  const handleNext = () => {
    const data = localStorage.getItem(PersistanceKeys.RegisterDetails)
    if (data) {
      const details = JSON.parse(data)
      details.creatorType = selectedCreatorType
      localStorage.setItem(PersistanceKeys.RegisterDetails, JSON.stringify(details))
      if (selectedCreatorType) {
        handleContinue()
      }
    }
  }

  return (
    <div
      style={{ width: '100%' }}
      className="overflow-y-none flex flex-row justify-center items-center "
    >
      <div
        className="bg-white sm:rounded-2xl flex flex-col w-full sm:mx-2 md:w-10/12 h-[100%] sm:h-[95%] py-4 relative"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="h-[95svh] sm:h-[92svh] overflow-hidden pb-24">
          <div className="h-[10%]">
            <Header />
          </div>
          <div className="flex flex-col items-center px-4 w-full h-[100%]">
            <div
              className="mt-6 w-10/12 sm:w-full md:w-11/12 md:text-4xl text-lg font-[650] sm:font-[600]"
              style={{ textAlign: 'center' }}
            >
              What type of creator are you?
            </div>

            <div
              className="mt-2 pb-10 sm:mt-8 w-full md:w-10/12 lg:w-7/12 gap-4 flex flex-col overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin"
              style={{
                scrollbarColor: 'hsl(var(--brand-primary, 270 75% 50%)) transparent',
              }}
            >
              {CREATOR_TYPES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="border-none outline-none"
                >
                  <div
                    className="border bg-white flex flex-row items-center w-full rounded-2xl pt-3"
                    style={{
                      border:
                        selectedCreatorType === item.id
                          ? '2px solid hsl(var(--brand-primary, 270 75% 50%))'
                          : '',
                      backgroundColor:
                        selectedCreatorType === item.id
                          ? 'hsl(var(--brand-primary, 270 75% 50%) / 0.05)'
                          : '',
                    }}
                  >
                    <div className="flex flex-row items-start px-4 w-full py-2 gap-2">
                      <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                        <div className="sm:hidden flex items-center">
                          <Checkbox
                            checked={selectedCreatorType === item.id}
                            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                          />
                        </div>
                        <div className="flex items-center sm:flex hidden">
                          <Checkbox
                            checked={selectedCreatorType === item.id}
                            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-start text-base text-black leading-tight">
                            {item.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="px-4 pt-3 pb-2">
            <ProgressBar value={66} />
          </div>
          <div
            className="flex items-center justify-between w-full "
            style={{ minHeight: '50px' }}
          >
            <Footer
              handleContinue={handleNext}
              handleBack={handleBack}
              shouldContinue={shouldContinue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatorType
