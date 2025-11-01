import React, { useState } from 'react'
import LabelingHeader from './LabelingHeader';
import AddEditTutorials from './AddEditTutorials';
import TutorialViewCard from './TutorialViewCard';

const TutorialConfig = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tutorials, setTutorials] = useState([
    {
      id: 1,
      title: "Get Started with Creating Agents",
      description: "5:30",
      videoUrl: "https://example.com/video-url-1",
      isEnabled: true,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 2,
      title: "Setting Up Your First Campaign",
      description: "3:45",
      videoUrl: "https://example.com/video-url-2",
      isEnabled: true,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 3,
      title: "Managing Leads and Contacts",
      description: "7:15",
      videoUrl: "https://example.com/video-url-3",
      isEnabled: false,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 4,
      title: "Advanced Agent Configuration",
      description: "12:20",
      videoUrl: "https://example.com/video-url-4",
      isEnabled: true,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 5,
      title: "Integrating with CRM Systems",
      description: "8:50",
      videoUrl: "https://example.com/video-url-5",
      isEnabled: false,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 6,
      title: "Analytics and Reporting",
      description: "6:10",
      videoUrl: "https://example.com/video-url-6",
      isEnabled: true,
      thumbnailSrc: "/assets/youtubeplay.png"
    }
  ]);

  const handleEditClick = (tutorial) => {
    setSelectedTutorial(tutorial);
    setIsEditMode(true);
    setShowEditModal(true);
  };

  const handleAddNewTutorial = () => {
    setSelectedTutorial(null);
    setIsEditMode(false);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedTutorial(null);
    setIsEditMode(false);
  };

  const handleSaveTutorial = (updatedData) => {
    if (isEditMode && selectedTutorial) {
      // Update existing tutorial
      setTutorials(prev => prev.map(tutorial => 
        tutorial.id === selectedTutorial.id 
          ? { ...tutorial, title: updatedData.title, videoUrl: updatedData.videoUrl }
          : tutorial
      ));
    } else {
      // Add new tutorial
      const newTutorial = {
        id: Math.max(...tutorials.map(t => t.id)) + 1,
        title: updatedData.title,
        description: "0:00", // Default duration
        videoUrl: updatedData.videoUrl,
        isEnabled: true,
        thumbnailSrc: "/assets/youtubeplay.png"
      };
      setTutorials(prev => [...prev, newTutorial]);
    }
    setShowEditModal(false);
    setSelectedTutorial(null);
    setIsEditMode(false);
    // Here you can add API call to save the tutorial data
    console.log("Saving tutorial:", updatedData);
  };

  const handleToggleSwitch = (tutorialId) => {
    setTutorials(prev => prev.map(tutorial => 
      tutorial.id === tutorialId 
        ? { ...tutorial, isEnabled: !tutorial.isEnabled }
        : tutorial
    ));
  };
  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={"/agencyIcons/Notification.png"}
        title={"Tutorial Videos"}
        description={"Manage alerts and tailor the platform experience for your valued clients."}
      />

      {/* Brand Configuration Card */}
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* Domain Title */}
          <div className="w-full flex flex-row items-center justify-between">
            <div>
              <div className="text-start mb-2" style={styles.semiBoldHeading}>Tutorial Videos</div>
              <div className="text-start" style={styles.description}>Update, customize and optimize your platform experience.</div>
            </div>
            {/*
              <button
                onClick={handleAddNewTutorial}
                className="bg-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add New Tutorial
              </button>
            */}
          </div>
          {/* Tutorial Videos */}
          <div className="w-full flex flex-col gap-8">
            {tutorials.map((tutorial) => (
              <TutorialViewCard
                key={tutorial.id}
                tutorialData={tutorial}
                onEditClick={handleEditClick}
                onToggleSwitch={() => handleToggleSwitch(tutorial.id)}
                isEnabled={tutorial.isEnabled}
                thumbnailSrc={tutorial.thumbnailSrc}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Edit Tutorial Modal */}
      <AddEditTutorials
        showModal={showEditModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveTutorial}
        tutorialData={selectedTutorial}
        isEditMode={isEditMode}
      />
    </div>
  )
}

export default TutorialConfig

const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: "600" },
  description: { fontSize: "14px", fontWeight: "500", color: "#616161" },
};