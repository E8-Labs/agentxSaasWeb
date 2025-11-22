import parsePhoneNumberFromString from 'libphonenumber-js'
import Image from 'next/image'

import voicesList from '@/components/createagent/Voices'
import { models } from '@/constants/Constants'

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
      <Image
        src="/agentXOrb.gif"
        height={42}
        width={42}
        className="rounded-full"
        alt="*"
        style={{
          margin: '18px',
        }}
      />
    </div>
  )
}

export const getAgentsListImage = (
  subAgent,
  imgHeight,
  imgWidth,
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

  if (subAgent?.thumb_profile_image) {
    return (
      <div
        className="flex flex-row items-center justify-center"
        style={{
          height: '45px',
          width: '45px',
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
      return (
        // <div className="bg-white rounded-full h-[43px] flex flex-row items-center justify-center">
        <div
          className="flex flex-row items-center justify-center"
          style={{
            height: '45px',
            width: '45px',
            borderRadius: '50%',
            backgroundColor: 'white',
          }}
        >
          <Image
            src={selectedVoice.img}
            height={height}
            width={width}
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

  // Fallback image
  return (
    <div
      className={`h-[${height}] w-[${width}] rounded-full flex flex-row items-center justify-center`}
    >
      <Image src="/agentXOrb.gif" height={height} width={width} alt="*" />
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

      // Format the number as "1 (805) 457 9527"
      if (phoneNumber.country === 'US' && nationalNumber.length === 10) {
        const match = nationalNumber.match(/^(\d{3})(\d{3})(\d{4})$/)
        if (match) {
          return `${countryCode} (${match[1]}) ${match[2]} ${match[3]}`
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

  // Fallback image
  return (
    <div className="rounded-full flex flex-row items-center justify-center">
      <Image
        src="/agentXOrb.gif"
        height={42}
        width={42}
        className="rounded-full"
        alt="*"
        style={{
          margin: '18px',
        }}
      />
    </div>
  )
}

const agentMemoji = (agent) => {
  const selectedVoice = voicesList.find(
    (voice) => voice.voice_id === agent?.voiceId,
  )
  console.log('Avatar got details', agent)
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
    console.log('showing the hard coated avatar')
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
  console.log('Selected model:', model)
  if (model === null) {
    return models[0] // Default to the first model if not found
  }

  return model
}

export function agentImage(agent) {
  console.log('Agent passed is', agent)
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
    console.log('Passing to avatar')
    return agentMemoji(agent)
  }
}
