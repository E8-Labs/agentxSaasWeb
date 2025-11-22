import { HowToVideoTypes, HowtoVideos } from '@/constants/Constants'

/**
 * Get the default video URL for a given videoType
 * Maps videoType to the corresponding HowtoVideos constant
 */
const getDefaultVideoUrl = (videoType) => {
  const videoTypeMap = {
    [HowToVideoTypes.GettingStarted]: HowtoVideos.GettingStarted,
    [HowToVideoTypes.FirstCampaign]: HowtoVideos.Leads,
    [HowToVideoTypes.LeadsAndContacts]: HowtoVideos.Leads,
    [HowToVideoTypes.AgentConfiguration]: HowtoVideos.KycQuestions,
    [HowToVideoTypes.CRMIntegration]: HowtoVideos.Pipeline,
    [HowToVideoTypes.Analytics]: HowtoVideos.script,
    [HowToVideoTypes.Generic]: HowtoVideos.GettingStarted, // Fallback
  }

  return videoTypeMap[videoType] || HowtoVideos.GettingStarted
}

/**
 * Get the default tutorial data for a given videoType
 */
const getDefaultTutorial = (videoType) => {
  const defaultTutorials = {
    [HowToVideoTypes.GettingStarted]: {
      title: 'Get Started with Creating Agents',
      description: '1:41',
      videoUrl: HowtoVideos.GettingStarted,
    },
    [HowToVideoTypes.FirstCampaign]: {
      title: 'Setting Up Your First Campaign',
      description: '11:27',
      videoUrl: HowtoVideos.Leads,
    },
    [HowToVideoTypes.LeadsAndContacts]: {
      title: 'Managing Leads and Contacts',
      description: '7:15',
      videoUrl: HowtoVideos.Leads,
    },
    [HowToVideoTypes.AgentConfiguration]: {
      title: 'Advanced Agent Configuration',
      description: '12:20',
      videoUrl: HowtoVideos.KycQuestions,
    },
    [HowToVideoTypes.CRMIntegration]: {
      title: 'Integrating with CRM Systems',
      description: '8:50',
      videoUrl: HowtoVideos.Pipeline,
    },
    [HowToVideoTypes.Analytics]: {
      title: 'Analytics and Reporting',
      description: '6:10',
      videoUrl: HowtoVideos.script,
    },
  }

  return (
    defaultTutorials[videoType] || {
      title: 'Tutorial Video',
      description: '0:00',
      videoUrl: HowtoVideos.GettingStarted,
    }
  )
}

/**
 * Format duration from seconds to "M:SS" or "MM:SS" format
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Get tutorial videos based on user role
 * Returns merged videos (agency/subaccount videos + defaults)
 */
export const getTutorialVideos = () => {
  try {
    const localData = localStorage.getItem('User')
    if (!localData) {
      return []
    }

    const userData = JSON.parse(localData)
    const user = userData?.user

    // Default tutorials
    const defaultTutorials = [
      {
        id: 1,
        title: 'Get Started with Creating Agents',
        description: '1:41',
        videoUrl: HowtoVideos.GettingStarted,
        enabled: true,
        videoType: HowToVideoTypes.GettingStarted,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 2,
        title: 'Setting Up Your First Campaign',
        description: '11:27',
        videoUrl: HowtoVideos.Leads,
        enabled: true,
        videoType: HowToVideoTypes.FirstCampaign,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 3,
        title: 'Managing Leads and Contacts',
        description: '7:15',
        videoUrl: HowtoVideos.Leads,
        enabled: true,
        videoType: HowToVideoTypes.LeadsAndContacts,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 4,
        title: 'Advanced Agent Configuration',
        description: '12:20',
        videoUrl: HowtoVideos.KycQuestions,
        enabled: true,
        videoType: HowToVideoTypes.AgentConfiguration,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 5,
        title: 'Integrating with CRM Systems',
        description: '8:50',
        videoUrl: HowtoVideos.Pipeline,
        enabled: true,
        videoType: HowToVideoTypes.CRMIntegration,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 6,
        title: 'Analytics and Reporting',
        description: '6:10',
        videoUrl: HowtoVideos.script,
        enabled: true,
        videoType: HowToVideoTypes.Analytics,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
    ]

    // Check if user is a subaccount
    if (user?.userRole === 'AgencySubAccount') {
      // Get agency videos from profile
      const agencyVideos = user?.agencyVideos || []

      // Merge agency videos with defaults
      return defaultTutorials.map((defaultTutorial) => {
        const agencyVideo = agencyVideos.find(
          (av) => av.videoType === defaultTutorial.videoType,
        )

        if (agencyVideo) {
          // Always format duration from videoDuration if available, otherwise use default
          const formattedDuration =
            agencyVideo.videoDuration && agencyVideo.videoDuration > 0
              ? formatDuration(agencyVideo.videoDuration)
              : defaultTutorial.description

          console.log(
            `[TutorialVideos] Merging agency video for ${defaultTutorial.videoType}:`,
            {
              videoDuration: agencyVideo.videoDuration,
              formattedDuration: formattedDuration,
              title: agencyVideo.title,
            },
          )

          return {
            ...agencyVideo,
            id: defaultTutorial.id,
            thumbnailSrc: '/assets/youtubeplay.png',
            description: formattedDuration,
          }
        }

        return defaultTutorial
      })
    }

    // Normal user - return defaults only
    return defaultTutorials
  } catch (error) {
    console.error('Error getting tutorial videos:', error)
    return []
  }
}

/**
 * Get video URL for a specific videoType
 * Returns the dynamic video URL if available, otherwise falls back to default
 */
export const getVideoUrlByType = (videoType) => {
  if (!videoType) {
    return null
  }

  try {
    const tutorials = getTutorialVideos()
    const tutorial = tutorials.find((t) => t.videoType === videoType)

    if (tutorial && tutorial.videoUrl) {
      return tutorial.videoUrl
    }

    // Fallback to default
    return getDefaultVideoUrl(videoType)
  } catch (error) {
    console.error('Error getting video URL by type:', error)
    return getDefaultVideoUrl(videoType)
  }
}

/**
 * Get tutorial data (title, description, URL) for a specific videoType
 */
export const getTutorialByType = (videoType) => {
  if (!videoType) {
    return null
  }

  try {
    const tutorials = getTutorialVideos()
    const tutorial = tutorials.find((t) => t.videoType === videoType)

    if (tutorial) {
      // Ensure description is properly formatted from videoDuration if available
      let description = tutorial.description
      if (tutorial.videoDuration && tutorial.videoDuration > 0) {
        description = formatDuration(tutorial.videoDuration)
      }

      return {
        title: tutorial.title,
        description: description,
        videoUrl: tutorial.videoUrl,
      }
    }

    // Fallback to default
    return getDefaultTutorial(videoType)
  } catch (error) {
    console.error('Error getting tutorial by type:', error)
    return getDefaultTutorial(videoType)
  }
}
