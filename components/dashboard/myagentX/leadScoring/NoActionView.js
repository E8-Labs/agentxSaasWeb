import Image from 'next/image';
import React from 'react'

function NoActionView({
    title = "No scoring data available",
    featureName = "Scoring",
    setShowAddScoringModal
}) {
    return (
        <div className='flex flex-col items-center justify-center mt-6 w-full'>

            <Image src={"/otherAssets/starImage.png"}   
                height={100} width={100} alt='*'
            />

            <h3 className="text-[15] font-[400] text-gray-900 italic">
                {title}
            </h3>

            {/* Button Section */}
            <button
                className="mt-2 flex items-center px-6 py-3 bg-[#7902DF] font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                onClick={() => {
                    setShowAddScoringModal(true);
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    fill="#"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                Add Scores
            </button>

        </div>
    )
}

export default NoActionView