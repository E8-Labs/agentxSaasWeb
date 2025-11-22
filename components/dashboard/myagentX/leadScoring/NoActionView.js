import IntroVideoModal from '@/components/createagent/IntroVideoModal';
import VideoCard from '@/components/createagent/VideoCard';
import { HowtoVideos, HowToVideoTypes } from '@/constants/Constants';
import { getVideoUrlByType, getTutorialByType } from '@/utils/tutorialVideos';
import Image from 'next/image';
import React, { useState } from 'react'

function NoActionView({
    title = "No scoring data available",
    featureName = "Scoring",
    setShowAddScoringModal
}) {
    const [introVideoModal, setIntroVideoModal] = useState(false);
    return (
        <div className='flex flex-col items-center justify-center mt-6 w-full'>

            <div className="flex items-center justify-center w-24 h-24 mt-3 rounded-lg">
                <img
                    src="/otherAssets/starImage.png"
                    alt="No Calendar Icon"
                    className="w-30 h-30"
                />
            </div>

            <h3 className="text-[15] font-[400] text-gray-900 italic -mt-4">
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


            <div className="flex flex-col w-full flex-col items-center justify-center mt-3">

                <div className="w-6/12">
                    <VideoCard
                        duration={(() => {
                            const tutorial = getTutorialByType(HowToVideoTypes.Scoring);
                            return tutorial?.description || "1:47";
                        })()}
                        horizontal={false}
                        playVideo={() => {
                            setIntroVideoModal(true);
                        }}
                        title={getTutorialByType(HowToVideoTypes.Scoring)?.title || "Learn how to add Scoring"}
                    />
                    {/* Intro modal */}
                    <IntroVideoModal
                        open={introVideoModal}
                        onClose={() => setIntroVideoModal(false)}
                        videoTitle={getTutorialByType(HowToVideoTypes.Scoring)?.title || "Learn how to add Scoring"}
                        videoUrl={getVideoUrlByType(HowToVideoTypes.Scoring) || HowtoVideos.LeadScoring}
                    />
                </div>
            </div>

        </div>
    )
}

export default NoActionView