import React from 'react'

function UnlockMessagesView() {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
    <Image src='/otherAssets/noTemView.png' alt='no tem view' width={240} height={240} />
    <div className='text-2xl font-bold'>Unlock Messages</div>
    <div className='text-sm text-gray-500'>Upgrade to unlock this feature and start sending SMS messages to your leads.</div>
    <button className='bg-blue-500 text-white px-4 py-2 rounded-md'>Upgrade</button>
    </div>
  )
}

export default UnlockMessagesView