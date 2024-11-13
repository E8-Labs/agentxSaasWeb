import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';

const CreateAccount3 = ({ handleContinue, handleBack }) => {

  const router = useRouter();

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "700"
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500"
    }
  }

  return (
    <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
      <div className='bg-gray-100 rounded-lg w-10/12 max-h-[90vh] py-4 overflow-auto'>
        {/* header */}
        <Header />
        {/* Body */}
        <div className='flex flex-col items-center px-4 w-full'>
          <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
            Your Contact Information
          </div>
          <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

            <div style={styles.headingStyle}>
              What's your full name
            </div>
            <input
              placeholder='Name'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
            />

            <div style={styles.headingStyle}>
              What's your email address
            </div>
            <input
              placeholder='Email address'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
            />

            <div style={styles.headingStyle}>
              What's your phone number
            </div>
            <input
              placeholder='Phone Number'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
            />

            <div style={styles.headingStyle}>
              What's your farm
            </div>
            <input
              placeholder='Your territory  '
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
            />

            <div style={styles.headingStyle}>
              Your brokerage
            </div>
            <input
              placeholder='Brokerage'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
            />

            <div style={styles.headingStyle}>
              Average transaction volume per year
            </div>
            <input
              placeholder='Value'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
            />

          </div>
        </div>
        <div>
          <ProgressBar value={80} />
        </div>

        <Footer handleContinue={handleContinue} handleBack={handleBack} />
      </div>
    </div>
  )
}

export default CreateAccount3
