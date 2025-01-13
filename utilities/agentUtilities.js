import voicesList from "@/components/createagent/Voices";
import Image from "next/image";

export const getAgentImage = (item) => {
  // console.log("Item passed is", item);

  // Extract subagents
  const subagents = item.agents || [];
  // console.log("Sub agents are", subagents);

  // Iterate through subagents to find the first valid profile image or voice ID
  for (const subAgent of subagents) {
    // Check for thumb_profile_image
    if (subAgent.thumb_profile_image) {
      return (
        <div className="bg-gray-100 rounded-full flex flex-row items-center justify-center">
          <Image
            src={subAgent.thumb_profile_image}
            height={42}
            width={42}
            alt="*"
            className="rounded-full"
            style={{
              margin: "18px",
            }}
          />
        </div>
      );
    }

    // Check for voiceId and map it to an image
    if (subAgent.voiceId) {
      const selectedVoice = voicesList.find(
        (voice) => voice.voice_id === subAgent.voiceId
      );
      if (selectedVoice && selectedVoice.img) {
        return (
          <div className="bg-gray-100 rounded-full flex flex-row items-center justify-center">
            <Image
              src={selectedVoice.img}
              height={42}
              width={42}
              alt="*"
              className="rounded-full"
              style={{
                margin: "5px",
              }}
            />
          </div>
        );
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
          margin: "18px",
        }}
      />
    </div>
  );
};

export const getAgentsListImage = (subAgent, imgHeight, imgWidth, showExtraheight = true) => {
  // console.log("Item passed is", subAgent);

  // Extract subagents
  // const subagents = item.agents || [];
  // console.log("Sub agents are", subagents);

  // console.log("Height is", imgHeight);
  // console.log("Width is", imgWidth);

  console.log("Extra height is")

  let height = imgHeight || 62;
  let width = imgWidth || 62;

  if (subAgent?.thumb_profile_image) {
    return (
      <div className={`bg-gray-100 rounded-full flex flex-row items-center justify-center`}
      // h-[43px]
      >
        <Image
          src={subAgent?.thumb_profile_image}
          height={height}
          width={width}
          alt="*"
          className="rounded-full"
          style={{
            height: "",
            width: "",
            objectFit: "cover",
            // margin: "8px"
          }}
        />
      </div>
    );
  }

  // Check for voiceId and map it to an image
  if (subAgent?.voiceId) {
    const selectedVoice = voicesList.find(
      (voice) => voice.voice_id === subAgent.voiceId
    );
    if (selectedVoice && selectedVoice.img) {
      return (
        <div className="bg-gray-100 rounded-full h-[43px] flex flex-row items-center justify-center">
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
      );
    }
  }

  // Fallback image
  return (
    <div className={`h-[${height}] w-[${width}] rounded-full flex flex-row items-center justify-center`}>
      <Image src="/agentXOrb.gif" height={height} width={width} alt="*" />
    </div>
  );
};
