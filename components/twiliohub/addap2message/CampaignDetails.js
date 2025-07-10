import React from 'react'

const CampaignDetails = ({
  handleContinue
}) => {
  return (
    <div className='h-[100%] flex flex-col items-center justify-between'>
      <div className='w-full overflow-auto'>
        <div>
          Welcome capaign
        </div>
      </div>
      <div className='w-full flex flex-row items-center gap-4'>
        <button className='w-1/2 bg-purple10 h-[50px] rounded-lg'>Exit</button>
        <button onClick={handleContinue} className='w-1/2 bg-purple text-white h-[50px] rounded-lg'>handleContinue</button>
      </div>
    </div>
  )
}

export default CampaignDetails
