import React from 'react'
import Image from 'next/image'

function Perplexity({
    enrichData,
    selectedLeadsDetails,
    
}) {
    return (
        <div
            className="w-full flex flex-col items-center mt-3 gap-3 h-[50vh]"
            style={{
                overflow: "auto",
                scrollbarWidth: "none",
                // overflowX: "hidden",
            }}
        >
            <div className="w-full flex flex-row justify-between items-center">
                <div className="w-full flex flex-row items-center gap-2">
                    <Image
                        src={"/svgIcons/image.svg"}
                        height={24}
                        width={24}
                        alt="*"
                        style={{ borderRadius: "50%" }}
                    />

                    <div style={{ fontsize: 22, fontWeight: "700" }}>
                        More About {selectedLeadsDetails?.firstName}
                    </div>
                </div>

                <div className="flex flex-row items-center gap-2 ">
                    <Image
                        src={"/svgIcons/confidanceIcon.svg"}
                        height={24}
                        width={24}
                        alt="*"
                    />

                    <div style={{ fontsize: 22, fontWeight: "700" }}>
                        Confidence Score:{" "}
                        <span
                            style={{
                                fontsize: 22,
                                fontWeight: "700",
                                color: "#7902DF",
                            }}
                        >
                            70%
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-row items-center gap-3 w-full h-[150px] overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none' }}>
                {enrichData?.profiles?.length > 0 ? (
                    enrichData.profiles.map((item, index) => (
                        <div key={index} className="flex-none w-[185px] h-[80px] px-2 py-2 items-center bg-[#FAFAFA] rounded">
                            <div className="flex flex-row items-center gap-2">
                                <Image
                                    src={"/svgIcons/image.svg"}
                                    height={24}
                                    width={24}
                                    alt="*"
                                    style={{ borderRadius: "50%" }}
                                />
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        color: "#00000060",
                                    }}
                                >
                                    {item.name}
                                </div>
                            </div>

                            <div style={{
                                fontSize: 13, fontWeight: "500",
                                height: "50px",
                                overflow: 'auto'
                            }}>
                                {item.details}
                            </div>
                        </div>
                    ))
                ) : (""
                    // <div>No Profiles Found</div>
                )}
            </div>



            <div className="w-full flex flex-row items-cneter gap-2 mt-5">
                <Image
                    src={"/svgIcons/sparkles.svg"}
                    height={24}
                    width={24}
                    alt="*"
                />

                <div style={{ fontsize: 16, fontWeight: "700" }}>
                    More detail
                </div>
            </div>

            <div style={{
                fontsize: 15, fontWeight: "500",
                height: "130px", overflow: 'auto', textOverflow: "ellipsis"

            }}>
                {enrichData?.summary}
            </div>
            {/* Media Section */}
            <div className="w-full flex flex-row items-center gap-2 mt-5 overflow-x-auto overflow-y-hidden whitespace-nowrap" style={{ scrollbarWidth: 'none' }}>
                {enrichData?.images || enrichData?.videos ? (
                    [...(enrichData.images || []), ...(enrichData.videos || [])].map((item, index) => (
                        <div key={index} className="h-[150px] w-[160px] rounded-lg flex-shrink-0">
                            {item.includes('.mp4') || item.includes('.webm') || item.includes('.ogg') ? (
                                <video
                                    src={item}
                                    height={150}
                                    width={160}
                                    controls
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <img
                                    src={item}
                                    // height={150}
                                    // width={160}
                                    alt={`Item ${index + 1}`}
                                    className="w-full h-[100%] object-fit rounded-lg border-2 border-red"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <div>No Media Available</div>
                )}
            </div>

        </div>
    )
}

export default Perplexity