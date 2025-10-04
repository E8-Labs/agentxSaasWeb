import CloseBtn from '@/components/globalExtras/CloseBtn'
import Image from 'next/image'
import React from 'react'
import { formatFractional2 } from './AgencyUtilities';

const ConfigureSideUI = ({
    tag,
    discountedPrice,
    title,
    planDescription,
    trialValidForDays,
    allowTrial,
    allowedFeatures,
    basicsData,
    features,
    from,
    handleClose,
    handleResetValues,
}) => {

    // console.log("Passed allwoed features are", allowedFeatures);

    return (
        <div
            className={`w-full h-full ${from === "dashboard" ? "rounded-xl" : "rounded-tr-xl rounded-br-xl"}`}
            style={{
                backgroundImage: "url('/otherAssets/monthlyplansbg.png')", //"url('/agencyIcons/addPlanBg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="p-4 flex flex-col items-center h-[100%]">
                <div className="flex justify-end w-full items-center h-[5%]">
                    <CloseBtn
                        // disabled={createPlanLoader}
                        onClick={() => {
                            handleClose();
                            handleResetValues();
                        }}
                        showWhiteCross={true}
                    />
                </div>
                <div
                    className={`${from === "dashboard" ? "w-[90%]" : "w-9/12"} h-[95%] flex flex-col items-center justify-start mt-[5vh] overflow-auto scrollbar-hide`}
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    <div
                        className="w-full bg-gradient-to-b from-[#C73BFF] to-[#7902DF] rounded-lg flex flex-col items-center "
                    >
                        <div
                            className='flex flex-row items-center gap-2 pt-4'
                        >
                            <Image
                                src="/svgIcons/powerWhite.svg"
                                // "/svgIcons/power.svg"
                                height={24} width={24} alt='*'
                            />

                            <div
                                style={{
                                    fontSize: 16, fontWeight: '700', color: "white" //: '#7902df'
                                }}>
                                {basicsData?.tag || "Tag"}
                            </div>
                            <Image
                                src="/svgIcons/enterArrowWhite.svg"
                                // "/svgIcons/enterArrow.svg"
                                height={20} width={20} alt='*'
                            />

                        </div>
                        <div className='bg-white rounded-lg mt-2 mb-2 p-4 flex flex-col items-center w-[95%]'>
                            <div className="text-center" style={{ fontWeight: "700", fontSize: "29px" }}>{basicsData?.title || "Title"}</div>
                            <div
                                style={{ fontWeight: "700", fontSize: "35px" }}
                                className="text-center mt-4 font-bold text-[35px]"
                            >
                                {
                                    basicsData?.originalPrice && (
                                        <span className='text-[#00000020] line-through' style={{ fontWeight: "700", fontSize: "30px" }}>
                                            ${from === "dashboard" ? basicsData?.originalPrice : formatFractional2(basicsData?.originalPrice) || ""}
                                        </span>
                                    )
                                }
                                <span className="bg-gradient-to-l from-[#7902DF] to-[#C73BFF] bg-clip-text text-transparent ms-2" style={{ fontWeight: "700", fontSize: "35px" }}>
                                    ${from === "dashboard" ? basicsData?.discountedPrice : formatFractional2(basicsData?.discountedPrice * basicsData?.minutes) || "0"}
                                </span>
                            </div>
                            <div className="text-center" style={{ fontWeight: "500", fontSize: "15px" }}>{basicsData?.planDescription || "Desc text goes here"}</div>
                            <button className="bg-purple h-[41px] mt-4 rounded-lg text-center text-white w-full">Get Started {allowTrial && trialValidForDays ? <span>| {trialValidForDays} Day Free Trial</span> : ""}</button>
                            {
                                allowedFeatures?.length > 0 && (
                                    <div className='w-full'>
                                        {
                                            allowedFeatures.map((item) => {
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="w-full flex flex-row items-center gap-2 mt-6"
                                                    >
                                                        <Image src="/otherAssets/selectedTickBtn.png" height={16} width={16} alt="✓" />
                                                        <div
                                                            className='flex flex-row items-center gap-2'
                                                            style={{
                                                                whiteSpace: 'nowrap',
                                                                width: '100%',
                                                                borderWidth: 0,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            <div style={{
                                                                fontSize: 13,
                                                                fontWeight: '500',
                                                                textAlign: 'left',
                                                                borderWidth: 0,
                                                            }}>
                                                                {item.text}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfigureSideUI
