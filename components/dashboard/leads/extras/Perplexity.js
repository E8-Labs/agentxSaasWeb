import React, { useState } from 'react'
import Image from 'next/image'
import { get } from 'draft-js/lib/DefaultDraftBlockRenderMap'

function Perplexity({
    selectedLeadsDetails,

}) {


    let enrichData = selectedLeadsDetails?.enrichData ? JSON.parse(selectedLeadsDetails?.enrichData) : ""

    let profiles = enrichData?.profiles

    profiles = [...profiles, ...enrichData?.images, ...enrichData?.videos, ...enrichData.citations]

    const [isExpanded, setIsExpanded] = useState(false);
    // console.log('profiles', profiles)

    // enrichData.summary = "Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development.Noah Nega is a tech entrepreneur and developer managing E8 Labs, with expertise in AI, startups, and software development."

    const initialTextLength = Math.ceil(
        enrichData.summary?.length * 0.5
    ); // 40% of the text
    const initialText = enrichData.summary?.slice(
        0,
        initialTextLength
    );

    console.log('profiles', profiles)

    const getIcon = (item) => {
        if (item.icon) {
            if (item.icon === "instagram") {
                return "/svgIcons/instagram.svg"
            } else if (item.icon === "youtube") {
                return "/svgIcons/youtube.svg"
            } else if (item.icon === "linkedin") {
                return "/svgIcons/linkedin.svg"
            } else {
                return "/svgIcons/globe.svg"
            }
        } else {
            return "/svgIcons/globe.svg"
        }
    }

    const getProfileView = (item, index) => {
        if (item.name) {
            return (
                <div
                    className="w-full flex flex-col h-[100px] px-2 py-2 bg-[#FAFAFA] rounded"
                >
                    <div className="flex flex-row items-center gap-2 mb-1">
                        <Image
                            src={getIcon(item)}
                            height={24}
                            width={24}
                            alt="*"
                        // style={{ borderRadius: "50%" }}
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

                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: "500",
                            height: "50px",
                            overflow: "auto",
                            textAlign: 'left'
                        }}
                    >
                        {item.description}
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <div
                        className="w-full flex flex-col h-[100px] px-2 py-2 bg-[#FAFAFA] rounded"
                    >
                        <div className="flex flex-row items-center gap-2 mb-1">
                            <Image
                                src={getIcon(item)}
                                height={24}
                                width={24}
                                alt="*"
                            // style={{ borderRadius: "50%" }}
                            />
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: "500",
                                    color: "#00000060",

                                }}
                            >
                                {getSourceName(item.url)}
                            </div>
                        </div>

                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: "500",
                                height: "50px",
                                overflow: "auto",
                                textAlign: 'left'
                            }}
                        >
                            {item.url}
                        </div>
                    </div>
                </div>
            )
        }
    }

    function getSourceName(url) {
        try {
            const parsedUrl = new URL(url);
            const host = parsedUrl.hostname; // e.g., "andresgonzalez.webflow.io"
            const parts = host.split('.');

            // For Webflow subdomains like "andresgonzalez.webflow.io"
            if (parts.length > 2 && parts.includes("webflow")) {
                return parts[0]; // "andresgonzalez"
            }

            // For custom domains
            let name = parts[parts.length - 2]; // e.g., "webflow" from "andresgonzalez.webflow.io"
            return name; // fallback
        } catch (err) {
            // console.error("Invalid URL", err);
            return null;
        }
    }

    const calculateConfidanseScore = () => {
        let score = 0 
        let avgScore = 0

        profiles.map((item)=>{
            if(item.confidence_score){
                score += item.confidence_score
            }
        })

        avgScore = score / profiles.length

        return avgScore
        
    }



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
                <div className="flex flex-row items-center gap-2">
                    <Image
                        src={"/svgIcons/image.svg"}
                        height={24}
                        width={24}
                        alt="*"
                        style={{ borderRadius: "50%" }}
                    />

                    <div style={{ fontsize: 22, fontWeight: "700", whiteSpace: 'nowrap' }}>
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

                    <div style={{ fontsize: 22, fontWeight: "700", whiteSpace: 'nowrap' }}>
                        More on {selectedLeadsDetails?.firstName}:{" "}
                        <span
                            style={{
                                fontsize: 22,
                                fontWeight: "700",
                                color: "#7902DF",
                            }}
                        >
                            {calculateConfidanseScore().toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
            <div className='w-full flex flex-row items-start gap-2'>
                <div className="grid grid-cols-3 gap-3 w-[80%] h-auto overflow-y-auto">
                    {profiles?.length > 0 ? (
                        profiles.slice(0, 6).map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    window.open(item.url, "_blank")
                                }}
                            >
                                {
                                    getProfileView(item, index)
                                }
                            </button>
                        ))
                    ) : (
                        ""
                        // <div>No Profiles Found</div>
                    )}
                </div>
                {
                    profiles?.length > 6 && (

                        <div className="flex flex-col items-center gap-3 p-3">
                            <div className='flex flex-row items-center'>
                                <Image
                                    src={"/svgIcons/image1.svg"}
                                    height={24}
                                    width={24}
                                    alt="*"
                                    style={{ borderRadius: "50%" }}
                                />
                                <Image
                                    src={"/svgIcons/image2.svg"}
                                    height={24}
                                    width={24}
                                    alt="*"
                                    style={{ borderRadius: "50%" }}
                                />
                                <Image
                                    src={"/svgIcons/image3.svg"}
                                    height={24}
                                    width={24}
                                    alt="*"
                                    style={{ borderRadius: "50%" }}
                                />
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: "500",
                                    color: "#00000060",
                                }}
                            >
                                +{profiles.length - 6} sources
                            </div>
                        </div>
                    )
                }
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

            <div className='flex flex-col items-start w-full'>
                <div
                    className="mt-4"
                    style={{
                        fontWeight: "600",
                        fontSize: 15,
                    }}
                >
                    {isExpanded
                        ? `${enrichData.summary}`
                        : `${initialText}...`}
                </div>

                <button
                    style={{
                        fontWeight: "600",
                        fontSize: 15,
                    }}
                    onClick={() => {
                        setIsExpanded(!isExpanded)
                    }}
                    className="mt-2 text-purple underline"
                >
                    {isExpanded
                        ? "Read Less"
                        : "Read more"}
                </button>
            </div>

        </div>
    )
}

export default Perplexity