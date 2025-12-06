'use client'

import { CircularProgress } from '@mui/material'
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'

const stripePublicKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY

const stripePromise = loadStripe(stripePublicKey)

function ConfirmPayment() {
  return (
    <Suspense>
      <ConfirmPaymentCode />
    </Suspense>
  )
}

function ConfirmPaymentCode() {
  const searchParams = useSearchParams()
  const pi = searchParams.get('pi')
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = AuthToken()
    if (pi && token) {
      fetch(`${Apis.getPaymentIntent}?pi=${pi}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Payment intent is ', data)
          if (data.status && data.data?.client_secret) {
            setClientSecret(data.data.client_secret)
          } else {
            toast.error('Unable to fetch payment intent.')
          }
          setLoading(false)
        })
        .catch(() => {
          toast.error('Server error.')
          setLoading(false)
        })
    }
  }, [pi])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center mt-20 text-red-600 font-semibold">
        Payment link is invalid or expired.
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 border rounded-xl shadow-lg">
      <h1 className="text-xl font-bold text-center mb-4">
        Complete Your Payment
      </h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentConfirmationForm clientSecret={clientSecret} />
      </Elements>
    </div>
  )
}
function PaymentConfirmationForm({ clientSecret }) {
  console.log('Client secret ', clientSecret)
  const [processing, setProcessing] = useState(false)
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe) return

    setProcessing(true)

    const result = await stripe.confirmCardPayment(clientSecret)

    if (result.error) {
      toast.error(result.error.message)
    } else if (result.paymentIntent.status === 'succeeded') {
      toast.success('Payment successful!')
      // Optional redirect:
      // router.push("/thank-you");
    }

    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        {`Click the button below to complete your payment. If authentication is
        required, you'll be prompted automatically.`}
      </p>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-purple text-white rounded-lg hover:bg-purple"
        disabled={processing}
      >
        {processing ? 'Processing...' : 'Confirm Payment'}
      </button>
    </form>
  )
}

export default ConfirmPayment
