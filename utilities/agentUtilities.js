import parsePhoneNumberFromString from 'libphonenumber-js'
import Image from 'next/image'

import voicesList from '@/components/createagent/Voices'
import { models } from '@/constants/Constants'
import { AgentXOrb } from '@/components/common/AgentXOrb'

export const getAgentImage = (item) => {
  //// //console.log;

  // Extract subagents
  const subagents = item?.agents || []
  //// //console.log;

  // Iterate through subagents to find the first valid profile image or voice ID
  for (const subAgent of subagents) {
    // Check for thumb_profile_image
    if (subAgent.thumb_profile_image) {
      return (
        <div
          className="flex flex-row items-center justify-center"
          style={{
            height: '62px',
            width: '62px',
            borderRadius: '50%',
            backgroundColor: 'white',
            overflow: 'hidden', // Ensures no part of the image spills outside the container
          }}
        >
          <img
            src={subAgent?.thumb_profile_image}
            alt="*"
            className="rounded-full"
            style={{
              height: '100%', // Makes the image fill the height of the container
              width: '100%', // Makes the image fill the width of the container
              objectFit: 'cover', // Ensures the image fully covers the container without empty space
              // backgroundColor: 'red' // Optional fallback background color
            }}
          />
        </div>
      )
    }

    // Check for voiceId and map it to an image
    if (subAgent.voiceId) {
      const selectedVoice = voicesList.find(
        (voice) => voice.voice_id === subAgent.voiceId,
      )
      // //console.log;
      if (selectedVoice && selectedVoice.img) {
        return (
          <div
            className="flex flex-row items-center justify-center"
            style={{
              height: '62px',
              width: '62px',
              borderRadius: '50%',
              backgroundColor: 'white',
            }}
          >
            <Image
              src={selectedVoice.img}
              height={62}
              width={62}
              alt="*"
              className="rounded-full"
              style={
                {
                  // margin: "5px"
                }
              }
            />
          </div>
        )
      }
    }
  }

  // Fallback image
  return (
    <div className="rounded-full flex flex-row items-center justify-center">
      <AgentXOrb size={42} style={{ margin: '18px' }} />
    </div>
  )
}

// Helper function to get initials from a lead
const getLeadInitials = (lead) => {
  if (!lead) return 'L'
  
  const firstName = lead.firstName || ''
  const lastName = lead.lastName || ''
  const name = lead.name || ''
  
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase()
  } else if (name) {
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
    } else if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase()
    }
  }
  
  return 'L'
}

// Function to get lead profile picture with initials fallback
export const getLeadProfileImage = (lead, imgHeight = 27, imgWidth = 27) => {
  if (lead?.thumb_profile_image) {
    return (
      <div
        className="flex flex-row items-center justify-center"
        style={{
          height: `${imgHeight}px`,
          width: `${imgWidth}px`,
          borderRadius: '50%',
          backgroundColor: 'white',
          overflow: 'hidden',
        }}
      >
        <img
          src={lead.thumb_profile_image}
          alt="*"
          className="rounded-full"
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    )
  }

  // Fallback to initials in a rounded circle
  const initials = getLeadInitials(lead)
  const bgColor = lead?.firstName 
    ? `hsl(${(lead.firstName.charCodeAt(0) * 137.508) % 360}, 70%, 50%)`
    : 'hsl(var(--brand-primary))'

  return (
    <div
      className="flex flex-row items-center justify-center rounded-full"
      style={{
        height: `${imgHeight}px`,
        width: `${imgWidth}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: 'white',
        fontSize: `${Math.max(10, imgHeight * 0.4)}px`,
        fontWeight: '600',
      }}
    >
      {initials}
    </div>
  )
}

export const getAgentsListImage = (
  subAgent,
  imgHeight,
  imgWidth,
  from = "",
  showExtraheight = true,

) => {
  //// //console.log;

  // Extract subagents
  // const subagents = item.agents || [];
  //// //console.log;

  // console.log("Sub agent passed is", subAgent);
  //// //console.log;

  let height = imgHeight || 62
  let width = imgWidth || 62

  //// //console.log;
  //// //console.log;

  console.log("subAgent? is", subAgent)
  if (subAgent?.thumb_profile_image) {
    return (
      <div
        className="flex flex-row items-center justify-center"
        style={{
          height: `${imgHeight}px`,
          width: `${imgWidth}px`,
          borderRadius: '50%',
          backgroundColor: 'white',
          overflow: 'hidden', // Ensures no part of the image spills outside the container
        }}
      >
        <img
          src={subAgent?.thumb_profile_image}
          alt="*"
          className="rounded-full"
          style={{
            height: '100%', // Makes the image fill the height of the container
            width: '100%', // Makes the image fill the width of the container
            objectFit: 'cover', // Ensures the image fully covers the container without empty space
            // backgroundColor: 'red' // Optional fallback background color
          }}
        />
      </div>
    )
  }

  // Check for voiceId and map it to an image
  if (subAgent?.voiceId) {
    const selectedVoice = voicesList.find(
      (voice) => voice.voice_id === subAgent.voiceId,
    )
    //// //console.log;
    if (selectedVoice && selectedVoice.img) {
      // Use container dimensions for voice images to prevent overflow
      const containerHeight = imgHeight || 45
      const containerWidth = imgWidth || 45
      
      // Manual sizing for Axel and Max - same approach as user side
      // Their images are naturally larger, so we manually reduce their dimensions
      let imageHeight = containerHeight
      let imageWidth = containerWidth
      
      if (selectedVoice.name === 'Axel' && from !== "agentsList") {
        // Axel: Use smaller dimensions to match other agents' visual size
        // Based on user side: height=28, width=28 (for 45px container, scale proportionally)
        imageHeight = 28
        imageWidth = 28
      } else if (selectedVoice.name === 'Max' && from !== "agentsList") {
        // Max: Use smaller dimensions to match other agents' visual size
        // Based on user side: height=26, width=32 (for 45px container, scale proportionally)
        imageHeight = 26
        imageWidth = 32
      }
      
      return (
        <div
          className="flex flex-row items-center justify-center"
          style={{
            height: `${containerHeight}px`,
            width: `${containerWidth}px`,
            borderRadius: '50%',
            backgroundColor: 'white',
            overflow: 'hidden', // Ensure image doesn't overflow container
          }}
        >
          <Image
            src={selectedVoice.img}
            height={imageHeight}
            width={imageWidth}
            alt="*"
            className="rounded-full"
            style={{
              height: `${imageHeight}px`,
              width: `${imageWidth}px`,
              objectFit: 'cover', // Use cover to fill container while maintaining aspect ratio
            }}
          />
        </div>
      )
    }
  }

  // Fallback image
  return (
    <div
      className={`h-[${height}] w-[${width}] rounded-full flex flex-row items-center justify-center`}
    >
      <AgentXOrb width={height} height={width} />
    </div>
  )
}

//format the phonenumber

// export const formatPhoneNumber = (rawNumber) => {
//   if (rawNumber) {
//     const phoneNumber = parsePhoneNumberFromString(
//       rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
//     );
//     // ////console.log;
//     return phoneNumber
//       ? phoneNumber.formatInternational()
//       : "No phone number";
//   } else {
//     return "No phone number";
//   }
// };

export const formatPhoneNumber = (rawNumber) => {
  if (rawNumber) {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber.startsWith('+') ? rawNumber : `+${rawNumber}`,
    )

    if (phoneNumber) {
      const countryCode = phoneNumber.countryCallingCode // Get the country code
      const nationalNumber = phoneNumber.nationalNumber // Get the national number

      // Format the number as "+1 (619) 257 6042"
      if (phoneNumber.country === 'US' && nationalNumber.length === 10) {
        const match = nationalNumber.match(/^(\d{3})(\d{3})(\d{4})$/)
        if (match) {
          return `+${countryCode} (${match[1]}) ${match[2]} ${match[3]}`
        }
      }

      // Default to international format if not US or doesn't match the criteria
      return phoneNumber.formatInternational()
    }

    return 'No phone number'
  }

  return 'No phone number'
}

////agent profile image
export const getAgentProfileImage = (subAgent) => {
  //// //console.log;

  // Extract subagents
  // //console.log;

  if (subAgent?.thumb_profile_image) {
    return (
      <div
        className="flex flex-row items-center justify-center"
        style={{
          height: '62px',
          width: '62px',
          borderRadius: '50%',
          backgroundColor: 'white',
          overflow: 'hidden', // Ensures no part of the image spills outside the container
        }}
      >
        <img
          src={subAgent?.thumb_profile_image}
          alt="*"
          className="rounded-full"
          style={{
            height: '100%', // Makes the image fill the height of the container
            width: '100%', // Makes the image fill the width of the container
            objectFit: 'cover', // Ensures the image fully covers the container without empty space
            // backgroundColor: 'red' // Optional fallback background color
          }}
        />
      </div>
    )
  }

  // Check for voiceId and map it to an image
  if (subAgent?.voiceId) {
    const selectedVoice = voicesList.find(
      (voice) => voice.voice_id === subAgent?.voiceId,
    )
    // //console.log;
    if (selectedVoice && selectedVoice.img) {
      // Manual sizing for Axel and Max - same approach as user side
      let imageHeight = 62
      let imageWidth = 62
      
      if (selectedVoice.name === 'Axel') {
        // Axel: Scale down proportionally for 62px container
        imageHeight = 38
        imageWidth = 38
      } else if (selectedVoice.name === 'Max') {
        // Max: Scale down proportionally for 62px container
        imageHeight = 36
        imageWidth = 44
      }
      
      return (
        <div
          className="flex flex-row items-center justify-center"
          style={{
            height: '62px',
            width: '62px',
            borderRadius: '50%',
            backgroundColor: 'white',
            overflow: 'hidden', // Ensure image doesn't overflow container
          }}
        >
          <Image
            src={selectedVoice.img}
            height={imageHeight}
            width={imageWidth}
            alt="*"
            className="rounded-full"
            style={{
              height: `${imageHeight}px`,
              width: `${imageWidth}px`,
              objectFit: 'cover',
            }}
          />
        </div>
      )
    }
  }

  // Fallback image
  return (
    <div className="rounded-full flex flex-row items-center justify-center">
      <AgentXOrb size={42} style={{ margin: '18px' }} />
    </div>
  )
}

const agentMemoji = (agent) => {
  const selectedVoice = voicesList.find(
    (voice) => voice.voice_id === agent?.voiceId,
  )
  if (selectedVoice && selectedVoice.img) {
    // console.log("showing the compared avatar")
    return (
      <div
        className="flex flex-row items-center justify-center"
        style={{
          height: '40px',
          width: '40px',
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
      >
        <Image
          src={selectedVoice.img}
          height={40}
          width={40}
          alt="*"
          className="rounded-full"
        />
      </div>
    )
  } else {
    return (
      <div
        className="flex flex-row items-center justify-center"
        style={{
          height: '40px',
          width: '40px',
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
      >
        <Image
          src={'/assets/avatar1.png'}
          height={40}
          width={40}
          alt="*"
          className="rounded-full"
        />
      </div>
    )
  }
}

export function getAgentImageWithMemoji(agent) {
  // console.log('agent', agent)
  const agents = agent.agents || []
  if (agents.length > 0) {
    let img
    if (agents[0].agentType === 'outbound') {
      img = agents[0]?.thumb_profile_image

      if (img) {
        return (
          <Image
            className="rounded-full"
            src={img}
            height={40}
            width={40}
            style={{
              height: '40px',
              width: '40px',
              resize: 'cover',
            }}
            alt="*"
          />
        )
      } else {
        return agentMemoji(agents[0])
      }
    } else {
      if (agents.length > 1) {
        img = agents[1]?.thumb_profile_image
        if (img) {
          return (
            <Image
              className="rounded-full"
              src={img}
              height={40}
              width={40}
              style={{
                height: '40px',
                width: '40px',
                resize: 'cover',
              }}
              alt="*"
            />
          )
        } else {
          return agentMemoji(agents[1])
        }
      }
    }
  }
  return '-'
}

export function findLLMModel(value) {
  let model = null
  for (const m of models) {
    if (m.model == value) {
      model = m
    }
  }
  if (model === null) {
    return models[0] // Default to the first model if not found
  }

  return model
}

export function agentImage(agent) {
  let img = agent?.thumb_profile_image
  if (img) {
    return (
      <Image
        className="rounded-full"
        src={img}
        height={40}
        width={40}
        style={{
          height: '40px',
          width: '40px',
          resize: 'cover',
        }}
        alt="*"
      />
    )
  } else {
    return agentMemoji(agent)
  }
}

