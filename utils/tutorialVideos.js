import { HowToVideoTypes, HowtoVideos } from '@/constants/Constants'
import { UserRole } from '@/constants/UserRole'

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
    [HowToVideoTypes.Script]: HowtoVideos.script,
    [HowToVideoTypes.LeadScoring]: HowtoVideos.LeadScoring,
    [HowToVideoTypes.PhoneNumbers]: HowtoVideos.LetsTalkDigits,
    [HowToVideoTypes.Tools]: HowtoVideos.Tools,
    [HowToVideoTypes.TwilioTrustHub]: HowtoVideos.TwilioTrustHub,
    [HowToVideoTypes.Calendar]: HowtoVideos.Calendar,
    [HowToVideoTypes.Walkthrough]: HowtoVideos.WalkthroughWatched,
    [HowToVideoTypes.ConnectBankAgency]: HowtoVideos.ConnectBankAgency,
    [HowToVideoTypes.SettingGlobalNumber]: HowtoVideos.SettingGlobalNumber,
    [HowToVideoTypes.TwilioIntegrationAgency]: HowtoVideos.TwilioIntegrationAgency,
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
      title: 'Learn about asking questions (KYC)',
      description: '12:20',
      videoUrl: HowtoVideos.KycQuestions,
    },
    [HowToVideoTypes.CRMIntegration]: {
      title: 'Learn about pipeline and stages ',//'Integrating with CRM Systems',
      description: '8:50',
      videoUrl: HowtoVideos.Pipeline,
    },
    [HowToVideoTypes.Script]: {
      title: 'Learn about creating a script',
      description: '13:56',
      videoUrl: HowtoVideos.script,
    },
    [HowToVideoTypes.LeadScoring]: {
      title: 'Learn about lead scoring',
      description: '06:13',
      videoUrl: HowtoVideos.LeadScoring,
    },
    [HowToVideoTypes.PhoneNumbers]: {
      title: 'Learn about phone numbers',
      description: '01:52',
      videoUrl: HowtoVideos.LetsTalkDigits,
    },
    [HowToVideoTypes.Tools]: {
      title: 'Learn how to add Tools',
      description: '05:56',
      videoUrl: HowtoVideos.Tools,
    },
    [HowToVideoTypes.TwilioTrustHub]: {
      title: 'Learn how to add Twilio Trust Hub',
      description: '14:31',
      videoUrl: HowtoVideos.TwilioTrustHub,
    },
    [HowToVideoTypes.Calendar]: {
      title: 'Learn how to add a calendar',
      description: '02:42',
      videoUrl: HowtoVideos.Calendar,
    },
    [HowToVideoTypes.Walkthrough]: {
      title: 'Welcome to AssignX',
      description: '05:02',
      videoUrl: HowtoVideos.WalkthroughWatched,
    },
    [HowToVideoTypes.ConnectBankAgency]: {
      title: 'Learn how to connect Stripe',
      description: '4:39',
      videoUrl: HowtoVideos.ConnectBankAgency,
    },
    [HowToVideoTypes.SettingGlobalNumber]: {
      title: 'Setting Global Number',
      description: '2:52',
      videoUrl: HowtoVideos.SettingGlobalNumber,
    },
    [HowToVideoTypes.TwilioIntegrationAgency]: {
      title: 'Twilio Integration - Agency',
      description: '1:55',
      videoUrl: HowtoVideos.TwilioIntegrationAgency,
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
        title: 'Learn about asking questions (KYC)',
        description: '12:20',
        videoUrl: HowtoVideos.KycQuestions,
        enabled: true,
        videoType: HowToVideoTypes.AgentConfiguration,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 5,
        title: 'Learn about pipeline and stages ',//'Integrating with CRM Systems',
        description: '8:50',
        videoUrl: HowtoVideos.Pipeline,
        enabled: true,
        videoType: HowToVideoTypes.CRMIntegration,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 6,
        title: 'Learn about creating a script',
        description: '13:56',
        videoUrl: HowtoVideos.script,
        enabled: true,
        videoType: HowToVideoTypes.Script,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 7,
        title: 'Learn about phone numbers',
        description: '01:52',
        videoUrl: HowtoVideos.LetsTalkDigits,
        enabled: true,
        videoType: HowToVideoTypes.PhoneNumbers,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 8,
        title: 'Learn how to add Tools',
        description: '05:56',
        videoUrl: HowtoVideos.Tools,
        enabled: true,
        videoType: HowToVideoTypes.Tools,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 9,
        title: 'Learn how to add Twilio Trust Hub',
        description: '14:31',
        videoUrl: HowtoVideos.TwilioTrustHub,
        enabled: true,
        videoType: HowToVideoTypes.TwilioTrustHub,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 10,
        title: 'Learn how to add a calendar',
        description: '02:42',
        videoUrl: HowtoVideos.Calendar,
        enabled: true,
        videoType: HowToVideoTypes.Calendar,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 11,
        title: 'Welcome to AssignX',
        description: '05:02',
        videoUrl: HowtoVideos.WalkthroughWatched,
        enabled: true,
        videoType: HowToVideoTypes.Walkthrough,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
      {
        id: 12,
        title: 'Learn about lead scoring',
        description: '06:13',
        videoUrl: HowtoVideos.LeadScoring,
        enabled: true,
        videoType: HowToVideoTypes.LeadScoring,
        thumbnailSrc: '/assets/youtubeplay.png',
      },
    ]

    // Check if user is a subaccount
    if (user?.userRole === UserRole.AgencySubAccount) {
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
