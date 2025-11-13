import React, { useEffect, useState } from 'react'
import LabelingHeader from './LabelingHeader';
import AddEditTutorials from './AddEditTutorials';
import TutorialViewCard from './TutorialViewCard';
import VideoPlayerModal from './VideoPlayerModal';
import { AuthToken } from '../plan/AuthDetails';
import { HowtoVideos, HowToVideoTypes } from '@/constants/Constants';
import axios from 'axios';
import Apis from '@/components/apis/Apis';

const TutorialConfig = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tutorials, setTutorials] = useState([]);



  let defaultTutorials = [
    {
      id: 1,
      title: "Get Started with Creating Agents",
      description: "1:41",
      videoUrl: HowtoVideos.GettingStarted,
      enabled: true,
      videoType:HowToVideoTypes.GettingStarted,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 2,
      title: "Setting Up Your First Campaign",
      description: "11:27",
      videoUrl: HowtoVideos.Leads,
      enabled: true,
      videoType:HowToVideoTypes.FirstCampaign,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 3,
      title: "Managing Leads and Contacts",
      description: "7:15",
      videoUrl: HowtoVideos.Leads,
      enabled: false,
      videoType:HowToVideoTypes.LeadsAndContacts,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 4,
      title: "Advanced Agent Configuration",
      description: "12:20",
      videoUrl: HowtoVideos.KycQuestions,
      enabled: true,
      videoType:HowToVideoTypes.AgentConfiguration,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 5,
      title: "Integrating with CRM Systems",
      description: "8:50",
      videoUrl: HowtoVideos.Pipeline,
      enabled: false,
      videoType:HowToVideoTypes.CRMIntegration,
      thumbnailSrc: "/assets/youtubeplay.png"
    },
    {
      id: 6,
      title: "Analytics and Reporting",
      description: "6:10",
      videoUrl: HowtoVideos.script,
      enabled: true,
      videoType:HowToVideoTypes.Analytics,
      thumbnailSrc: "/assets/youtubeplay.png"
    }
  ]


  useEffect(() => {
    getHowToVideos();
  }, []);



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
        let tutorials = response.data.data;
        if (tutorials.length > 0) {
          setTutorials(tutorials);
        } else {
          setTutorials(defaultTutorials);
        }
      } else {
        console.log("error is of getHowToVideos", response.data.message);
      }
    } catch (error) {
      console.log("error is of getHowToVideos", error);
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
    try {
      let token = AuthToken();
      let payload = {
        title: updatedData.title,
        videoUrl: updatedData.videoUrl,
        videoType: updatedData.videoType,
        enabled: isEditMode && selectedTutorial ? selectedTutorial.enabled : true
      };

      if (isEditMode && selectedTutorial) {
        // Update existing tutorial
        payload.id = selectedTutorial.id;
        const response = await axios.put(Apis.updateHowToVideo, payload, {
          headers: {
            "Authorization": "Bearer " + token,
          }
        });
        
        if (response.data.status === true) {
          setTutorials(prev => prev.map(tutorial =>
            tutorial.id === selectedTutorial.id
              ? { ...tutorial, ...payload }
              : tutorial
          ));
        }
      } else {
        // Add new tutorial - using update endpoint which may handle creation
        const response = await axios.put(Apis.updateHowToVideo, payload, {
          headers: {
            "Authorization": "Bearer " + token,
          }
        });
        
        if (response.data.status === true) {
          const newTutorial = {
            id: response.data.data?.id || Math.max(...tutorials.map(t => t.id || 0), 0) + 1,
            title: updatedData.title,
            description: "0:00", // Default duration
            videoUrl: updatedData.videoUrl,
            enabled: true,
            videoType: updatedData.videoType,
            thumbnailSrc: "/assets/youtubeplay.png"
          };
          setTutorials(prev => [...prev, newTutorial]);
        }
      }
      
      setShowEditModal(false);
      setSelectedTutorial(null);
      setIsEditMode(false);
    } catch (error) {
      console.log("error saving tutorial:", error);
    }
  };

  const handleToggleSwitch = async (tutorialId) => {
    try {
      const tutorial = tutorials.find(t => t.id === tutorialId);
      if (!tutorial) return;

      const newEnabledStatus = !tutorial.enabled;
      let token = AuthToken();
      
      const response = await axios.put(Apis.toggleHowToVideo, {
        id: tutorialId,
        enabled: newEnabledStatus
      }, {
        headers: {
          "Authorization": "Bearer " + token,
        }
      });

      if (response.data.status === true) {
        setTutorials(prev => prev.map(t =>
          t.id === tutorialId
            ? { ...t, enabled: newEnabledStatus }
            : t
        ));
      }
    } catch (error) {
      console.log("error toggling tutorial status:", error);
    }
  };

  const handlePlayVideo = (tutorial) => {
    setSelectedTutorial(tutorial);
    setShowVideoModal(true);
  };
  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={"/agencyIcons/Notification.png"}
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
              <TutorialViewCard
                key={tutorial.id}
                tutorialData={tutorial}
                onEditClick={handleEditClick}
                onToggleSwitch={() => handleToggleSwitch(tutorial.id)}
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
        videoDescription={selectedTutorial?.description}
      />
    </div>
  )
}

export default TutorialConfig

const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: "600" },
  description: { fontSize: "14px", fontWeight: "500", color: "#616161" },
};