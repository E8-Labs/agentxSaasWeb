import React from 'react'

const GeneralInfo = () => {

  const styles = {
    normalTxt: {
      fontWeight: "500",
      fontSize: 15
    }
  }

  return (
    <div className='h-[100%] w-full flex flex-col items-center justify-between'>
      <div className='w-8/12 max-h-[80%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2'>
        <div style={{ fontWeight: "700", fontSize: 22 }}>
          General Information
        </div>
        <div
          className='mt-2'
          style={styles.normalTxt}>
          {`Complete the profile with your customer’s or subaccount information and submit for verification`}
        </div>
        <div
          className='mt-6'
          style={styles.normalTxt}>
          Legal business name*
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Legal business name'
          />
        </div>
        <div
          className='mt-4'
          style={styles.normalTxt}>
          Profile friendly name
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Type here...'
          />
        </div>
        <div
          className='mt-4'
          style={styles.normalTxt}>
          Physical business address
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Select a country'
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address Street 1'
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address Street 2'
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address City'
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address State or Province'
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address Postal Code'
          />
        </div>
      </div>
      <div className='w-10/12 pb-12 max-h-[20%] flex flex-row items-center justify-between'>
        <button className='outline-none border-none text-purple' style={styles.normalTxt}>
          Save&Exit
        </button>
        <button className='h-[50px] w-[170px] text-white text-center rounded-lg bg-purple'>
          Continue
        </button>
      </div>
    </div>
  )
}

export default GeneralInfo
