import React, { useEffect, useState } from 'react'
import LabelingHeader from './LabelingHeader';
import AddEditTutorials from './AddEditTutorials';
import TutorialViewCard from './TutorialViewCard';
import VideoPlayerModal from './VideoPlayerModal';
import { AuthToken } from '../plan/AuthDetails';
import { HowtoVideos, HowToVideoTypes } from '@/constants/Constants';
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';

const TutorialConfig = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSnack, setShowSnack] = useState({
    type: SnackbarTypes.Error,
    message: "",
    isVisible: false
  });


  let defaultTutorials = [
    {
      id: 1,
      title: "Get Started with Creating Agents",
      description: "1:41",
      videoUrl: HowtoVideos.GettingStarted,
      enabled: true,
      videoType: HowToVideoTypes.GettingStarted,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 2,
      title: "Setting Up Your First Campaign",
      description: "11:27",
      videoUrl: HowtoVideos.Leads,
      enabled: true,
      videoType: HowToVideoTypes.FirstCampaign,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 3,
      title: "Managing Leads and Contacts",
      description: "7:15",
      videoUrl: HowtoVideos.Leads,
      enabled: false,
      videoType: HowToVideoTypes.LeadsAndContacts,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 4,
      title: "Advanced Agent Configuration",
      description: "12:20",
      videoUrl: HowtoVideos.KycQuestions,
      enabled: true,
      videoType: HowToVideoTypes.AgentConfiguration,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 5,
      title: "Integrating with CRM Systems",
      description: "8:50",
      videoUrl: HowtoVideos.Pipeline,
      enabled: false,
      videoType: HowToVideoTypes.CRMIntegration,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 6,
      title: "Analytics and Reporting",
      description: "6:10",
      videoUrl: HowtoVideos.script,
      enabled: true,
      videoType: HowToVideoTypes.Analytics,
      thumbnailSrc: "/assets/youtubeplay.png"
    }
  ]


  useEffect(() => {
    getHowToVideos();
  }, []);

  // Helper function to format duration from seconds to "M:SS" or "MM:SS" format
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getHowToVideos = async () => {
    try {
      let token = AuthToken();
      const response = await axios.get(Apis.getHowToVideo, {
        headers: {
          "Authorization": "Bearer " + token,
        }
      });
      console.log("response is of getHowToVideos", response.data);
      
      if (response.data.status === true) {
        let uploadedVideos = response.data.data || [];
        
        // Merge: Start with defaults, replace with uploaded videos if videoType matches
        const mergedTutorials = defaultTutorials.map(defaultTutorial => {
          const uploadedVideo = uploadedVideos.find(
            uv => uv.videoType === defaultTutorial.videoType
          );
          
          if (uploadedVideo) {
            // Use uploaded video, but preserve default thumbnailSrc if not provided
            return {
              ...uploadedVideo,
              thumbnailSrc: uploadedVideo.thumbnailSrc || defaultTutorial.thumbnailSrc,
              description: uploadedVideo.videoDuration 
                ? formatDuration(uploadedVideo.videoDuration) 
                : defaultTutorial.description
            };
          }
          
          // No uploaded video for this type, keep default
          return defaultTutorial;
        });
        
        setTutorials(mergedTutorials);
      } else {
        // If API fails, show defaults
        console.log("error is of getHowToVideos", response.data.message);
        setTutorials(defaultTutorials);
      }
    } catch (error) {
      console.log("error is of getHowToVideos", error);
      setTutorials(defaultTutorials); // Fallback to defaults
    }
  }

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

  const handleSaveTutorial = async (updatedData) => {
    setIsSaving(true);
    try {
      let token = AuthToken();
      let response;

      console.log("updatedData is of handleSaveTutorial", updatedData);

      // If a new video file is uploaded, send FormData

      const formData = new FormData();
      if (updatedData.media) {
      formData.append("media", updatedData.media);
      }
      formData.append("videoType", selectedTutorial.videoType);
      formData.append("title", updatedData.title);
      formData.append("enabled", isEditMode && selectedTutorial ? selectedTutorial.enabled : true);

      formData.forEach((value, key) => {
        console.log("key is of formData", key);
        console.log("value is of formData", value);
      });

      // Upload video file with metadata
      response = await axios.post(Apis.updateHowToVideo, formData, {
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "multipart/form-data",
        }
      });


      if (response.data.status === true) {
        // Refresh the list after saving to get updated data from server
        await getHowToVideos();
      }

      setShowEditModal(false);
      setSelectedTutorial(null);
      setIsEditMode(false);
    } catch (error) {
      console.log("error saving tutorial:", error);
      setShowSnack({
        type: SnackbarTypes.Error,
        message: "Failed to save tutorial. Please try again.",
        isVisible: true
      });
      // alert("Failed to save tutorial. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle functionality commented out - toggle buttons removed
  // const handleToggleSwitch = async (tutorialId) => {
  //   try {
  //     const tutorial = tutorials.find(t => t.id === tutorialId);
  //     if (!tutorial) return;

  //     const newEnabledStatus = !tutorial.enabled;
  //     let token = AuthToken();

  //     const response = await axios.put(Apis.toggleHowToVideo, {
  //       id: tutorialId,
  //       enabled: newEnabledStatus
  //     }, {
  //       headers: {
  //         "Authorization": "Bearer " + token,
  //       }
  //     });

  //     if (response.data.status === true) {
  //       setTutorials(prev => prev.map(t =>
  //         t.id === tutorialId
  //           ? { ...t, enabled: newEnabledStatus }
  //           : t
  //       ));
  //     }
  //   } catch (error) {
  //     console.log("error toggling tutorial status:", error);
  //   }
  // };

  const handlePlayVideo = (tutorial) => {
    setSelectedTutorial(tutorial);
    setShowVideoModal(true);
  };
  return (
    <div>
      <AgentSelectSnackMessage
        type={showSnack.type}
        message={showSnack.message}
        isVisible={showSnack.isVisible}
        hide={() => {
          setShowSnack({
            message: "",
            isVisible: false,
            type: SnackbarTypes.Error,

          });
        }}
      />
      {/* Banner Section */}
      <LabelingHeader
        img={"/otherAssets/tutorialIcon.png"}
        title={"Tutorial Videos"}
        description={"Control the tutorial videos you display for your users."}
      />

      {/* Brand Configuration Card */}
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* Domain Title */}
          <div className="w-full flex flex-row items-center justify-between">

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
              // onToggleSwitch={() => handleToggleSwitch(tutorial.id)} - Toggle functionality commented out - toggle buttons removed
              <TutorialViewCard
                key={tutorial.id}
                tutorialData={tutorial}
                onEditClick={handleEditClick}
                onPlayVideo={handlePlayVideo}
                isEnabled={tutorial.enabled}
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
        isLoading={isSaving}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setSelectedTutorial(null);
        }}
        videoTitle={selectedTutorial?.title}
        videoUrl={selectedTutorial?.videoUrl}
      />
    </div>
  )
}

export default TutorialConfig

const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: "600" },
  description: { fontSize: "14px", fontWeight: "500", color: "#616161" },
};