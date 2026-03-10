'use client'

import React, { useState } from 'react'
import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { UserTypeOptions } from '@/constants/UserTypeOptions'
import { PersistanceKeys } from '@/constants/Constants'
import Apis from '../apis/Apis'
import axios from 'axios'

const CreateTemplateStep2 = ({
  handleBack,
  step1Data,
  onSaved,
}) => {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const industryLabel =
    UserTypeOptions.find((o) => o.userType === step1Data?.industry)?.title ||
    step1Data?.industry

  const handleSave = async () => {
    if (!step1Data?.industry || !step1Data?.name) return
    setSaving(true)
    setError(null)
    try {
      const UserDetails = localStorage.getItem(PersistanceKeys.LocalStorageUser)
      const AuthToken = UserDetails ? JSON.parse(UserDetails)?.token : null
      if (!AuthToken) {
        setError('Please log in again')
        setSaving(false)
        return
      }
      const payload = {
        industry: step1Data.industry,
        name: step1Data.name,
        agentRole: step1Data.agentRole || '',
        description: step1Data.description || '',
        agentType: 'both',
        promptOutbound: null,
        promptInbound: null,
        objections: [],
        guardrails: [],
        kycs: [],
      }
      const res = await axios.post(Apis.createTemplate, payload, {
        headers: { Authorization: 'Bearer ' + AuthToken },
      })
      if (res?.data?.status && onSaved) {
        onSaved(res.data.data)
      } else {
        setError(res?.data?.message || 'Failed to save template')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
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
            Review and save your template. You can add script, objections, and
            guardrails later by editing the template.
          </p>

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-black">
              Review
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-600">Agent Type</dt>
                <dd className="text-black">{industryLabel}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Agent&apos;s Name</dt>
                <dd className="text-black">{step1Data?.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Agent&apos;s Role</dt>
                <dd className="text-black">{step1Data?.agentRole || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Description</dt>
                <dd className="text-black">{step1Data?.description || '—'}</dd>
              </div>
            </dl>
            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </Body>
      <Footer
        handleBack={handleBack}
        handleContinue={handleSave}
        shouldContinue={saving}
        registerLoader={saving}
      />
      <ProgressBar value={100} />
    </>
  )
}

export default CreateTemplateStep2
