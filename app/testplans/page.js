'use client';

import { useState } from 'react';
import { Check, Zap, ArrowDown } from 'lucide-react';

export default function TestPlansPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Free',
      price: '$0',
      billing: 'Billed Monthly',
      description: 'Perfect to start for free to leverage AI',
      features: [
        '1 AI Agent',
        '500 Contacts',
        '20 AI Credits',
        'Standard Languages',
        'Custom Emails (10 email = 1 credit)',
        'Advanced LLMs',
        'AI Powered CRM (Copilot)',
        'Local Phone Number',
        '1 Guest Seat',
        'DNC Check',
        'Lead Enrichment (Perplexity)',
        'API Access',
        '10,000+ Integrations',
        'AI Academy'
      ],
      highlightedFeature: '1 AI Agent'
    },
    {
      name: 'Starter',
      price: '$87',
      billing: 'Billed Monthly',
      description: 'Perfect for lead updates and prospecting',
      features: [
        'Everything in Free, and',
        '3 AI Agents',
        '5,000 Contacts',
        '120 AI Credits',
        'Advanced Languages',
        'Text Messages (10 text = 1 credit)',
        '2 Guest Seats',
        'Custom Voicemails',
        'Twilio Trust Hub',
        'Live Call Transfer',
        'Tools & Actions',
        'Calendar (GHL, Cal, Google)',
        'RAG Knowledge Base',
        'Embed, Browser, Webhook Access',
        'Support Tickets'
      ],
      highlightedFeature: '3 AI Agents'
    },
    {
      name: 'Growth',
      price: '$297',
      billing: 'Billed Monthly',
      description: 'Perfect for an AI workforce at your service',
      features: [
        'Everything in Starter, and',
        '6 AI Agents',
        '10,000 Contacts',
        '380 AI Credits',
        '4 Guest Seats',
        'GHL Subaccount & Snapshots',
        'Zoom Support',
        'Priority Support (Email/SMS)',
        'Priority Support Tickets',
        'Lead Source (Coming soon)',
        'AI Powered iMessage (Coming soon)',
        'AI Powered Emails (Coming soon)'
      ],
      highlightedFeature: '6 AI Agents',
      popular: true
    },
    {
      name: 'Scale',
      price: '$597',
      billing: 'Billed Monthly',
      description: 'Ideal for growing businesses',
      features: [
        'Everything in Growth, and',
        'Unlimited Agents',
        'Unlimited Contacts',
        '800 AI Credits',
        'Unlimited Seats',
        'Success Manager'
      ],
      highlightedFeature: 'Unlimited Agents',
      bestValue: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-black">Agentx</h1>
          <div className="ml-4 h-0.5 bg-purple-600 flex-1"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        {/* Title Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-12">
          <div className="mb-8 lg:mb-0">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">
              Grow Your Business
            </h2>
            <p className="text-lg text-gray-700">
              AI Agents from just $1.50 per day — gets more done than coffee. Cheaper too. 😉
            </p>
          </div>

          {/* Billing Cycle Options */}
          <div className="flex gap-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <div className="relative">
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  billingCycle === 'quarterly'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Quarterly
              </button>
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                Save 20%
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yearly
              </button>
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                Save 30%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 ${
                plan.bestValue
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border-2 border-purple-200'
              }`}
            >
              {/* Popular/Best Value Badge */}
              {(plan.popular || plan.bestValue) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {plan.popular ? 'Popular' : 'Best Value'}
                    <ArrowDown className="w-3 h-3" />
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">{plan.price}</div>
                <div className={`text-sm ${plan.bestValue ? 'text-purple-100' : 'text-gray-600'}`}>
                  {plan.billing}
                </div>
                <p className={`text-sm mt-2 ${plan.bestValue ? 'text-purple-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-medium mb-6 transition-colors ${
                  plan.bestValue
                    ? 'bg-white text-purple-600 hover:bg-gray-100'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Get Started
              </button>

              <div className="space-y-3">
                {Array.isArray(plan.features) && plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.bestValue ? 'text-white' : 'text-green-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        feature === plan.highlightedFeature
                          ? 'bg-yellow-200 text-black px-2 py-1 rounded font-medium'
                          : plan.bestValue
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
