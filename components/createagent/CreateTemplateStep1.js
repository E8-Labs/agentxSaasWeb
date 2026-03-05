'use client'

import React, { useState } from 'react'
import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { Input } from '@/components/ui/input'
import { UserTypeOptions } from '@/constants/UserTypeOptions'

const CreateTemplateStep1 = ({ handleContinue, handleBack, initialData }) => {
  const [industry, setIndustry] = useState(initialData?.industry ?? null)
  const [name, setName] = useState(initialData?.name ?? '')
  const [agentRole, setAgentRole] = useState(initialData?.agentRole ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')

  const canContinue =
    industry != null &&
    name.trim().length > 0 &&
    name.trim().length <= 20 &&
    agentRole.trim().length <= 20 &&
    description.trim().length <= 120

  const onContinue = () => {
    if (!canContinue) return
    const selected = UserTypeOptions.find((o) => o.id === industry || o.userType === industry)
    handleContinue({
      industry: selected?.userType ?? industry,
      name: name.trim().slice(0, 20),
      agentRole: agentRole.trim().slice(0, 20),
      description: description.trim().slice(0, 120),
    })
  }

  return (
    <>
      <Header />
      <Body>
        <div className="mx-auto max-w-2xl px-4 py-6">
          <h1 className="text-2xl font-bold text-black">
            Create your AI agent template
          </h1>
          <p className="mt-1 text-sm text-black/80">
            The agent you create can be added to subaccounts as a template or
            published to the marketplace.
          </p>

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-black">
              Get Started
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Agent Type
                </label>
                <select
                  value={industry ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setIndustry(v ? (Number(v) || v) : null)
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-purple-500"
                >
                  <option value="">Select</option>
                  {UserTypeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Agent&apos;s Name
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type here"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 20))}
                    maxLength={20}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-black"
                  />
                  <span className="text-xs text-gray-500">
                    {name.length}/20
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Agent&apos;s Role
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type here"
                    value={agentRole}
                    onChange={(e) => setAgentRole(e.target.value.slice(0, 20))}
                    maxLength={20}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-black"
                  />
                  <span className="text-xs text-gray-500">
                    {agentRole.length}/20
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Description
                </label>
                <div className="flex items-start gap-2">
                  <textarea
                    placeholder="Type here"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value.slice(0, 120))
                    }
                    maxLength={120}
                    rows={3}
                    className="w-full flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-purple-500"
                  />
                  <span className="text-xs text-gray-500">
                    {description.length}/120
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Body>
      <Footer
        handleBack={handleBack}
        handleContinue={onContinue}
        shouldContinue={!canContinue}
      />
      <ProgressBar value={50} />
    </>
  )
}

export default CreateTemplateStep1
