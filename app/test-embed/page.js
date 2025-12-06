'use client'

import { Copy, ExternalLink, Settings } from 'lucide-react'
import React, { useState } from 'react'

const TestEmbedPage = () => {
  const [assistantId, setAssistantId] = useState(
    'dcddc675-d616-4089-8627-2b499da98188',
  )
  const [embedCode, setEmbedCode] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Generate embed code
  const generateEmbedCode = () => {
    if (!assistantId.trim()) {
      alert('Please enter an Assistant ID')
      return
    }

    const baseUrl = window.location.origin

    const code = `<iframe src="${baseUrl}/embed/support/${assistantId}" style="position: fixed; bottom: 0; right: 0; width: 320px; height: 100vh; border: none; background: transparent; z-index: 9999; pointer-events: none;" allow="microphone" onload="this.style.pointerEvents = 'auto';"></iframe>`

    setEmbedCode(code)
  }

  // Copy embed code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AssignX Support Widget Embed Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate and test embed codes for your AI support agents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Widget Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assistant ID *
                </label>
                <input
                  type="text"
                  value={assistantId}
                  onChange={(e) => setAssistantId(e.target.value)}
                  placeholder="Enter your VAPI Assistant ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is your VAPI assistant ID that will handle the support
                  calls
                </p>
              </div>

              <button
                onClick={generateEmbedCode}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Generate Embed Code
              </button>
            </div>
          </div>

          {/* Embed Code Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Embed Code</h2>
              {embedCode && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={togglePreview}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                </div>
              )}
            </div>

            {embedCode ? (
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm font-mono">
                <pre className="whitespace-pre-wrap">{embedCode}</pre>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  {`Enter an Assistant ID and click "Generate Embed Code" to get started`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Section */}
        {showPreview && embedCode && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <ExternalLink className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Live Preview</h2>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[400px] relative">
              <p className="text-sm text-gray-600 mb-4">
                Preview of your support widget (check bottom-right corner):
              </p>

              {/* Embed the actual widget for testing */}
              <div
                id="agentx-support-widget-preview"
                className="relative w-full"
                style={{ minHeight: '100vh', height: '600px' }}
              >
                <iframe
                  src={`/embed/support/${assistantId}`}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '320px',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    zIndex: '999',
                    pointerEvents: 'auto',
                  }}
                  allow="microphone"
                  title="AssignX Support Widget Preview"
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            How to Use Your Embed Code
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>1. Copy the embed code</strong> generated above
            </p>
            <p>
              <strong>2. Paste the iframe code directly</strong> into your
              website HTML where you want the widget to appear
            </p>
            <p>
              <strong>3. The widget will appear</strong> in the bottom-right
              corner of your site
            </p>
            <p>
              <strong>4. Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Dynamic button text and avatar from your agent settings</li>
              <li>Smart list form if your agent has smart lists configured</li>
              <li>Direct call initiation for agents without smart lists</li>
              <li>Responsive design that works on desktop and mobile</li>
            </ul>
          </div>
        </div>

        {/* Testing Tips */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            Testing Tips
          </h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p>{`• Make sure your assistant ID is valid and active in VAPI`}</p>
            <p>{`• Test with both agents that have smart lists and those that don't`}</p>
            <p>{`• Check browser console for detailed logs (look for 🔍 SUPPORT-WIDGET prefixed messages)`}</p>
            <p>{`• Ensure microphone permissions are enabled for voice calls`}</p>
            <p>{`• Test the form submission and call initiation flow`}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestEmbedPage
