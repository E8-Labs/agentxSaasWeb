import React from 'react'
import Image from 'next/image'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'

function Page() {
  return (
    <div className='w-full flex flex-col items-center'>
      <div className=' w-full flex flex-row justify-between items-center py-4 px-10'
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>
          Integration
        </div>
        <div className="flex flex-col">
          <NotficationsDrawer />
        </div>
      </div>

      <div className='p-10 flex flex-col items-center w-7/12' style={{ alignSelf: 'flex-start' }}>
        <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>
          <div className='flex flex-row items-center gap-5'>
            <Image src={'/otherAssets/twiloImage.png'}
              height={47}
              width={47}
              alt='twilo'
            />
            <div className='flex flex-col gap-2'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                Twilio
              </div>

              <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                Get a phone num from Twilio
              </div>
            </div>
          </div>

          <button className='px-4 py-2 bg-purple border rounded-lg'>
            <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
              Add
            </div>
          </button>
        </div>

        <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>
          <div className='flex flex-row items-center gap-5'>
            <Image src={'/otherAssets/calenderImage.png'}
              height={47}
              width={47}
              alt='calender'
            />
            <div className='flex flex-col gap-2'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                Calender
              </div>

              <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                Connect to Cal.me, Calendly, smtp to google or apple calendar
              </div>
            </div>
          </div>

          <button className='px-4 py-2 bg-purple border rounded-lg'>
            <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
              Add
            </div>
          </button>
        </div>

        <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>

          <div className='flex flex-row items-center gap-5'>
            <Image src={'/otherAssets/fubImage.png'}
              height={47}
              width={47}
              alt='fub'
            />
            <div className='flex flex-col gap-2'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                FUB
              </div>

              <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                API Keys to send hot leads and booked meetings
              </div>
            </div>
          </div>

          <button className='px-4 py-2 bg-purple border rounded-lg'>
            <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
              Add
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Page