import React from 'react'

const PointOfContact = ({
  handleBack
}) => {
  return (
    <div className='h-[100%] flex flex-col items-center justify-between'>
      <div className='w-full overflow-auto'>
        <div>
          Welcome point of contact
        </div>
      </div>
      <div className='w-full flex flex-row items-center gap-4'>
        <button
          className='w-1/2 bg-purple10 h-[50px] rounded-lg'
          onClick={handleBack}>
          Back
        </button>
        <button className='w-1/2 bg-purple text-white h-[50px] rounded-lg'>handleContinue</button>
      </div>
    </div>
  )
}

export default PointOfContact;
