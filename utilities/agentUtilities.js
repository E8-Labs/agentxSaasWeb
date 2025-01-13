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
        <div
          className="flex flex-row items-center justify-center"
          style={{
            height: "62px",
            width: "62px",
            borderRadius: "50%",
            backgroundColor: "#d3d3d380",
            overflow: "hidden", // Ensures no part of the image spills outside the container
          }}
        >
          <img
            src={subAgent?.thumb_profile_image}
            alt="*"
            className="rounded-full"
            style={{
              height: "100%",        // Makes the image fill the height of the container
              width: "100%",         // Makes the image fill the width of the container
              objectFit: "cover",    // Ensures the image fully covers the container without empty space
              // backgroundColor: 'red' // Optional fallback background color
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
          <div
          className="flex flex-row items-center justify-center"
          style={{
            height: "62px",
            width: "62px",
            borderRadius: "50%",
            backgroundColor: "#d3d3d380",
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


  let height = imgHeight || 62;
  let width = imgWidth || 62;

  console.log("Heght is", height);
  console.log("Heght Width is", width);

  if (subAgent?.thumb_profile_image) {
    return (
      // <div className={`bg-gray-100 rounded-full flex flex-row items-center justify-center`}>
      // <div
      //   className="flex flex-row items-center justify-center"
      //   style={{
      //     height: "62px",
      //     width: "62px",
      //     borderRadius: "50%",
      //     backgroundColor: "#d3d3d380",
      //   }}
      // >
      //   <Image
      //     src={subAgent?.thumb_profile_image}
      //     height={height}
      //     width={width}
      //     alt="*"
      //     className="rounded-full"
      //     style={{
      //       height: "100%",
      //       width: "100%",
      //       objectFit: "contain",
      //       // resize: "cover",
      //       backgroundColor: 'red'
      //       // margin: "8px"
      //     }}
      //   />
      // </div>
      <div
        className="flex flex-row items-center justify-center"
        style={{
          height: "62px",
          width: "62px",
          borderRadius: "50%",
          backgroundColor: "#d3d3d380",
          overflow: "hidden", // Ensures no part of the image spills outside the container
        }}
      >
        <img
          src={subAgent?.thumb_profile_image}
          alt="*"
          className="rounded-full"
          style={{
            height: "100%",        // Makes the image fill the height of the container
            width: "100%",         // Makes the image fill the width of the container
            objectFit: "cover",    // Ensures the image fully covers the container without empty space
            // backgroundColor: 'red' // Optional fallback background color
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
        // <div className="bg-white rounded-full h-[43px] flex flex-row items-center justify-center">
        <div
          className="flex flex-row items-center justify-center"
          style={{
            height: "62px",
            width: "62px",
            borderRadius: "50%",
            backgroundColor: "#d3d3d380",
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
