import React, { useEffect, useState } from 'react'
import TutorialViewCard from '@/components/agency/whiteLabeling/TutorialViewCard';
import VideoPlayerModal from '@/components/agency/whiteLabeling/VideoPlayerModal';
import { getTutorialVideos } from '@/utils/tutorialVideos';

const TutorialsView = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [tutorials, setTutorials] = useState([]);

  useEffect(() => {
    const videos = getTutorialVideos();
    setTutorials(videos);
  }, []);

  const handlePlayVideo = (tutorial) => {
    setSelectedTutorial(tutorial);
    setShowVideoModal(true);
  };

  // Dummy function for edit (not used in read-only view)
  const handleEditClick = () => {
    // No-op for read-only view
  };

  return (
    <div className="w-full flex flex-col items-center pt-8">
      <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
        {/* Header */}
        <div className="w-full mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Tutorial Videos</h2>
          <p className="text-gray-600 mt-2">Watch these tutorials to learn how to use the platform</p>
        </div>

        {/* Tutorial Videos */}
        <div className="w-full flex flex-col gap-8">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="w-full">
              <TutorialViewCard
                tutorialData={tutorial}
                onEditClick={handleEditClick}
                onPlayVideo={handlePlayVideo}
                isEnabled={tutorial.enabled}
                thumbnailSrc={tutorial.thumbnailSrc || "/assets/youtubeplay.png"}
                readOnly={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setSelectedTutorial(null);
        }}
        videoTitle={selectedTutorial?.title}
        videoUrl={selectedTutorial?.videoUrl}
        videoDescription={selectedTutorial?.description}
      />
    </div>
  );
};

export default TutorialsView;

