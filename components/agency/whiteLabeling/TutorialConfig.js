import axios from 'axios'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { HowToVideoTypes, HowtoVideos } from '@/constants/Constants'

import { AuthToken } from '../plan/AuthDetails'
import AddEditTutorials from './AddEditTutorials'
import LabelingHeader from './LabelingHeader'
import TutorialViewCard from './TutorialViewCard'
import VideoPlayerModal from './VideoPlayerModal'

const TutorialConfig = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedTutorial, setSelectedTutorial] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [tutorials, setTutorials] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [showSnack, setShowSnack] = useState({
    type: SnackbarTypes.Error,
    message: '',
    isVisible: false,
  })

  let defaultTutorials = [
    {
      id: 1,
      title: 'Get Started with Creating Agents',
      description: '1:41',
      videoUrl: HowtoVideos.GettingStarted,
      enabled: true,
      videoType: HowToVideoTypes.GettingStarted,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/createagent/CreateAgent1.js
    },
    // {
    //   id: 2,
    //   title: 'Setting Up Your First Campaign',
    //   description: '11:27',
    //   videoUrl: HowtoVideos.Leads,
    //   enabled: true,
    //   videoType: HowToVideoTypes.FirstCampaign,
    //   thumbnailSrc: '/assets/youtubeplay.png',
    //   // Used in: (First Campaign tutorial - uses Leads video URL)
    // },
    {
      id: 3,
      title: 'Managing Leads and Contacts',
      description: '7:15',
      videoUrl: HowtoVideos.Leads,
      enabled: false,
      videoType: HowToVideoTypes.LeadsAndContacts,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/dashboard/leads/Leads1.js, components/admin/users/AdminLeads1.js
    },
    {
      id: 4,
      title: 'Learn about asking questions (KYC)',// old title = Learn about asking questions (KYC) 
      description: '12:20',
      videoUrl: HowtoVideos.KycQuestions,
      enabled: true,
      videoType: HowToVideoTypes.AgentConfiguration,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/kycQuestions/buyerKyc/BuyerKycs.js, components/kycQuestions/SellerKycs.js, components/pipeline/KYCs.js
    },
    {
      id: 5,
      title: 'Learn about pipeline and stages',
      description: '8:50',
      videoUrl: HowtoVideos.Pipeline,
      enabled: false,
      videoType: HowToVideoTypes.CRMIntegration,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/pipeline/Pipeline1.js
    },
    {
      id: 6,
      title: 'Learn about creating a script',
      description: '6:10',
      videoUrl: HowtoVideos.script,
      enabled: true,
      videoType: HowToVideoTypes.Script,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/pipeline/Pipeline2.js, app/dashboard/agents/page.js, components/admin/users/AdminAgentX.js
    },
    {
      id: 7,
      title: 'Learn about phone numbers',
      description: '01:52',
      videoUrl: HowtoVideos.LetsTalkDigits,
      enabled: true,
      videoType: HowToVideoTypes.PhoneNumbers,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/createagent/CreateAgent4.js
    },
    {
      id: 8,
      title: 'Learn how to add Tools',
      description: '05:56',
      videoUrl: HowtoVideos.Tools,
      enabled: true,
      videoType: HowToVideoTypes.Tools,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/dashboard/myagentX/mcp/MCPView.js
    },
    {
      id: 9,
      title: 'Learn how to add Twilio Trust Hub',
      description: '14:31',
      videoUrl: HowtoVideos.TwilioTrustHub,
      enabled: true,
      videoType: HowToVideoTypes.TwilioTrustHub,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/twiliohub/getProfile/CustomerProfile.js
    },
    {
      id: 10,
      title: 'Learn how to add a calendar',
      description: '02:42',
      videoUrl: HowtoVideos.Calendar,
      enabled: true,
      videoType: HowToVideoTypes.Calendar,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: app/dashboard/agents/page.js, components/dashboard/myagentX/UserCallender.js, components/pipeline/AddCalender.js
    },
    {
      id: 11,
      title: 'Welcome to AgentX',
      description: '05:02',
      videoUrl: HowtoVideos.WalkthroughWatched,
      enabled: true,
      videoType: HowToVideoTypes.Walkthrough,
      thumbnailSrc: '/assets/youtubeplay.png',
      // Used in: components/dashboard/Navbar/ProfileNav.js
    },
  ]

  useEffect(() => {
    getHowToVideos()
  }, [])

  // Helper function to format duration from seconds to "M:SS" or "MM:SS" format
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getHowToVideos = async () => {
    try {
      let token = AuthToken()
      const response = await axios.get(Apis.getHowToVideo, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
      console.log('response is of getHowToVideos', response.data)

      if (response.data.status === true) {
        let uploadedVideos = response.data.data || []

        // Merge: Start with defaults, replace with uploaded videos if videoType matches
        const mergedTutorials = defaultTutorials.map((defaultTutorial) => {
          const uploadedVideo = uploadedVideos.find(
            (uv) => uv.videoType === defaultTutorial.videoType,
          )

          if (uploadedVideo) {
            // Use uploaded video, but preserve default thumbnailSrc if not provided
            return {
              ...uploadedVideo,
              thumbnailSrc:
                uploadedVideo.thumbnailSrc || defaultTutorial.thumbnailSrc,
              description: uploadedVideo.videoDuration
                ? formatDuration(uploadedVideo.videoDuration)
                : defaultTutorial.description,
            }
          }

          // No uploaded video for this type, keep default
          return defaultTutorial
        })

        setTutorials(mergedTutorials)
      } else {
        // If API fails, show defaults
        console.log('error is of getHowToVideos', response.data.message)
        setTutorials(defaultTutorials)
      }
    } catch (error) {
      console.log('error is of getHowToVideos', error)
      setTutorials(defaultTutorials) // Fallback to defaults
    }
  }

  const handleEditClick = (tutorial) => {
    setSelectedTutorial(tutorial)
    setIsEditMode(true)
    setShowEditModal(true)
  }

  const handleAddNewTutorial = () => {
    setSelectedTutorial(null)
    setIsEditMode(false)
    setShowEditModal(true)
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
    setSelectedTutorial(null)
    setIsEditMode(false)
  }

  const handleSaveTutorial = async (updatedData) => {
    // Early return if nothing changed (title same and no new media)
    if (selectedTutorial && updatedData.title === selectedTutorial.title && !updatedData.media) {
      return
    }
    setIsSaving(true)
    try {
      let token = AuthToken()
      let response

      console.log('updatedData is of handleSaveTutorial', updatedData)
      console.log('selectedTutorial is', selectedTutorial)
      console.log('isEditMode is', isEditMode)

      const formData = new FormData()

      // Check if this is an uploaded video (has database properties like uploadStatus, userId, or videoUrl from uploads)
      // Default tutorials have IDs like 1, 2, 3 and videoUrl from HowtoVideos constants
      // IMPORTANT: Default tutorials have numeric IDs (1-11) but are NOT uploaded videos
      // Uploaded videos have database IDs (typically > 100) and uploadStatus/userId properties
      const isUploadedVideo =
        selectedTutorial &&
        // Must have uploadStatus OR userId (database properties) OR uploaded videoUrl
        (selectedTutorial.uploadStatus !== undefined ||
          selectedTutorial.userId !== undefined ||
          (selectedTutorial.videoUrl &&
            (selectedTutorial.videoUrl.includes('/uploads/') ||
              selectedTutorial.videoUrl.includes('/agentx/uploads/') ||
              selectedTutorial.videoUrl.includes('/agentxtest/uploads/')))) &&
        // AND the ID must be a database ID (not a default tutorial ID 1-11)
        selectedTutorial.id &&
        typeof selectedTutorial.id === 'number' &&
        selectedTutorial.id > 11 // Database IDs are > 11, default tutorial IDs are 1-11

      console.log('isUploadedVideo check:', {
        id: selectedTutorial?.id,
        idType: typeof selectedTutorial?.id,
        idGreaterThan11: selectedTutorial?.id > 11,
        uploadStatus: selectedTutorial?.uploadStatus,
        userId: selectedTutorial?.userId,
        videoUrl: selectedTutorial?.videoUrl,
        isUploadedVideo: isUploadedVideo,
      })

      // Only append videoId if this is an existing uploaded video (not a default tutorial)
      // Default tutorials have IDs 1-11, uploaded videos have database IDs > 11
      if (isEditMode && isUploadedVideo && selectedTutorial.id && selectedTutorial.id > 11) {
        formData.append('videoId', selectedTutorial.id)
        console.log('Appending videoId:', selectedTutorial.id)
      } else {
        console.log('NOT appending videoId - using upload endpoint for default tutorial or new upload')
      }

      // Only append media if a new file is selected
      if (updatedData.media) {
        formData.append('media', updatedData.media)
      }

      // Only append videoType if we have it (for new uploads or when updating)
      if (selectedTutorial && selectedTutorial.videoType) {
        formData.append('videoType', selectedTutorial.videoType)
      }

      formData.append('title', updatedData.title)
      formData.append(
        'enabled',
        isEditMode && selectedTutorial ? selectedTutorial.enabled : true,
      )

      formData.forEach((value, key) => {
        console.log('key is of formData', key)
        console.log('value is of formData', value)
      })

      // Use update endpoint only if editing an existing uploaded video
      // Use upload endpoint for default tutorials (even in "edit" mode) or new uploads
      const apiEndpoint =
        isEditMode && isUploadedVideo && selectedTutorial.id
          ? Apis.updateHowToVideo
          : Apis.uploadHowToVideo

      console.log('Using API endpoint:', apiEndpoint)
      console.log('isUploadedVideo:', isUploadedVideo)

      response = await axios.post(apiEndpoint, formData, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.status === true) {
        // Refresh the list after saving to get updated data from server
        await getHowToVideos()
        setShowSnack({
          type: SnackbarTypes.Success,
          message: 'Tutorial saved successfully!',
          isVisible: true,
        })
      }

      setShowEditModal(false)
      setSelectedTutorial(null)
      setIsEditMode(false)
    } catch (error) {
      console.log('error saving tutorial:', error)
      setShowSnack({
        type: SnackbarTypes.Error,
        message:
          error.response?.data?.message ||
          'Failed to save tutorial. Please try again.',
        isVisible: true,
      })
    } finally {
      setIsSaving(false)
    }
  }

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
    setSelectedTutorial(tutorial)
    setShowVideoModal(true)
  }
  return (
    <div>
      <AgentSelectSnackMessage
        type={showSnack.type}
        message={showSnack.message}
        isVisible={showSnack.isVisible}
        hide={() => {
          setShowSnack({
            message: '',
            isVisible: false,
            type: SnackbarTypes.Error,
          })
        }}
      />
      {/* Banner Section */}
      <LabelingHeader
        img={'/otherAssets/tutorialIcon.png'}
        title={'Tutorial Videos'}
        description={'Control the tutorial videos you display for your users.'}
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
          setShowVideoModal(false)
          setSelectedTutorial(null)
        }}
        videoTitle={selectedTutorial?.title}
        videoUrl={selectedTutorial?.videoUrl}
      />
    </div>
  )
}

export default TutorialConfig

const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: '600' },
  description: { fontSize: '14px', fontWeight: '500', color: '#616161' },
}
