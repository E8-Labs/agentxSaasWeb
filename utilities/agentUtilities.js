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
                    < Image
                        src={subAgent.thumb_profile_image}
                        height={42}
                        width={42}
                        alt="*"
                        className="rounded-full"
                        style={{
                            margin: "18px"
                        }}
                    />
                </div>
            )
        }

        // Check for voiceId and map it to an image
        if (subAgent.voiceId) {
            const selectedVoice = voicesList.find(
                (voice) => voice.voice_id === subAgent.voiceId
            );
            if (selectedVoice && selectedVoice.img) {
                return (
                    <div className="bg-gray-100 rounded-full flex flex-row items-center justify-center">
                        < Image
                            src={selectedVoice.img}
                            height={42}
                            width={42}
                            alt="*"
                            className="rounded-full"
                            style={{
                                margin: "5px"
                            }}
                        />
                    </div>
                )
            }
        }
    }

    // Fallback image
    return (
        <div className="rounded-full flex flex-row items-center justify-center">
            < Image
                src="/agentXOrb.gif"
                height={42}
                width={42}
                className="rounded-full"
                alt="*"
                style={{
                    margin: "18px"
                }}
            />
        </div>
    )
};


export const getAgentsListImage = (subAgent) => {
    // console.log("Item passed is", subAgent);

    // Extract subagents
    // const subagents = item.agents || [];
    // console.log("Sub agents are", subagents);

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
                        height: "42px",
                        width: "42px",
                        objectFit: "cover",
                        margin: "8px"
                    }}
                />
            </div>
        )
    }

    // Check for voiceId and map it to an image
    if (subAgent.voiceId) {
        const selectedVoice = voicesList.find(
            (voice) => voice.voice_id === subAgent.voiceId
        );
        if (selectedVoice && selectedVoice.img) {
            return (
                <div className="bg-gray-100 rounded-full flex flex-row items-center justify-center">
                    < Image
                        src={selectedVoice.img}
                        height={42}
                        width={42}
                        alt="*"
                        className="rounded-full"
                        style={{
                            margin: "5px"
                        }}
                    />
                </div>
            )
        }
    }

    // Iterate through subagents to find the first valid profile image or voice ID
    // for (const subAgent of subagents) {
    //     // Check for thumb_profile_image
    //     if (subAgent.thumb_profile_image) {
    //         return (
    //             <div className="h-[60px] w-[60px] bg-gray-100 rounded-full flex flex-row items-center justify-center">
    //                 < Image
    //                     src={subAgent.thumb_profile_image}
    //                     height={42}
    //                     width={42}
    //                     alt="*"
    //                 />
    //             </div>
    //         )
    //     }

    //     // Check for voiceId and map it to an image
    //     if (subAgent.voiceId) {
    //         const selectedVoice = voicesList.find(
    //             (voice) => voice.voice_id === subAgent.voiceId
    //         );
    //         if (selectedVoice && selectedVoice.img) {
    //             return (
    //                 <div className="h-[60px] w-[60px] bg-gray-100 rounded-full flex flex-row items-center justify-center">
    //                     < Image
    //                         src={selectedVoice.img}
    //                         height={42}
    //                         width={42}
    //                         alt="*"
    //                     />
    //                 </div>
    //             )
    //         }
    //     }
    // }

    // Fallback image
    return (
        <div className="h-[60px] w-[60px] rounded-full flex flex-row items-center justify-center">
            < Image
                src="/agentXOrb.gif"
                height={42}
                width={42}
                alt="*"
            />
        </div>
    )
};

