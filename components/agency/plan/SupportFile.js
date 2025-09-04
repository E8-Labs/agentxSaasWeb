import { Box, Modal, Slider } from '@mui/material';
import React from 'react';
import { styled } from "@mui/material/styles";
import Image from 'next/image';
import CloseBtn from '@/components/globalExtras/CloseBtn';
import { GetFormattedDateString } from '@/utilities/utility';

const SupportFile = ({title = "You've Hit Your 20 Minute Limit", subTitle = "Upgrade to get more call time and keep your converstaions going", upgardeAction, cancelAction, metadata = {}}) => {

    console.log('metadata in support file', metadata)
    const benifits1 = [
        { id: 1, title: "More Mins of AI Credits", subTitle: "" },
        { id: 2, title: "Unlimited Agents", subTitle: "" },
        { id: 3, title: "Unlimited Team", subTitle: "" },
        { id: 4, title: "LLMs", subTitle: "(AgentX, OpenAI, Llama, Gemini)" },
        { id: 5, title: "AI Powered CRM", subTitle: "(Copilot)" },
        { id: 6, title: "Lead Enrichment", subTitle: "(Perplexity)" },
        { id: 7, title: "10,000+ Integrations", subTitle: "(Zapier + Make)" },
        { id: 8, title: "Custom Voicemails", subTitle: "" },
    ];

    const benifits2 = [
        { id: 1, title: "Geo-Based Phone Number Access", subTitle: "" },
        { id: 2, title: "DNC Check", subTitle: "" },
        { id: 3, title: "Lead Source", subTitle: "(Coming soon)" },
        { id: 4, title: "AI Powered Message", subTitle: "(Coming soon)" },
        { id: 5, title: "AI Powered Email", subTitle: "" },
        { id: 6, title: "Zoom Support", subTitle: "" },
        { id: 7, title: "Priority Support", subTitle: "(Email/SMS)" },
        { id: 8, title: "Tech Support", subTitle: "" },
    ];
    return (
        <div>
            <Modal
                open={true}
            // onClose={() => {
            //     handleResetValues();
            //     handleClose("");
            // }}
            >
                {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
                <Box className="bg-white m-h-[90svh] overflow-auto rounded-xl  border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-full">
                        <div className='w-full flex flex-col items-center justify-center px-12 pt-8'>
                            {/* <div className='w-full flex flex-row items-start justify-end'>
                                <CloseBtn
                                    onClick={() => { console.log("Trigered close button") }}
                                />
                            </div> */}
                            <div className="flex flex-row items-center">
                                <div
                                    className="text-purple"
                                    style={{ fontSize: "29px", fontWeight: "700" }}
                                >
                                    {title}
                                </div>
                                <Image
                                    alt="*"
                                    src={"/otherAssets/starsIcon2.png"}
                                    height={28}
                                    width={26}
                                />
                            </div>
                            <div
                                className="mt-1"
                                style={{ fontSize: "13px", fontWeight: "400", color: "#00000065" }}>
                                {subTitle}
                            </div>
                            <div className="mt-4 w-full text-start" style={{ fontSize: "18px", fontWeight: "700" }}>
                                {`What You’ll Get`}
                            </div>
                            <div className='w-full flex flex-row items-start mt-4'>
                                <div className="w-1/2 flex flex-col gap-4">
                                    {
                                        benifits1.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-row items-center gap-4"
                                            >
                                                <Image
                                                    alt='*'
                                                    src={"/otherAssets/simpleTick.png"}
                                                    height={16}
                                                    width={16}
                                                />
                                                <div style={{ fontSize: "15px", fontWeight: "500" }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: "13px", fontWeight: "400", color: "#8A8A8A" }}>
                                                    {item.subTitle}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="w-1/2 flex flex-col gap-4">
                                    {
                                        benifits2.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-row items-center gap-4"
                                            >
                                                <Image
                                                    alt='*'
                                                    src={"/otherAssets/simpleTick.png"}
                                                    height={16}
                                                    width={16}
                                                />
                                                <div style={{ fontSize: "15px", fontWeight: "500" }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: "13px", fontWeight: "400", color: "#8A8A8A" }}>
                                                    {item.subTitle}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-full h-[35%] flex flex-col items-center justify-end mt-6 pb-6 gradient-view"
                        style={{
                            backgroundImage: "url('/otherAssets/gradientBg.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            // borderRadius:'20px'
                        }}
                    >
                        <button
                            onClick={upgardeAction}
                            className="h-[54px] rounded-xl w-[339px] bg-purple text-white text-center flex flex-row items-center justify-center transition-all duration-300 hover:bg-purple-700 hover:scale-105 hover:shadow-lg"
                            style={{ fontSize: "15px", fontWeight: "500" }}>
                            Upgrade
                        </button>
                        <div 
                            className='text-purple mt-4 pb-8 cursor-pointer transition-all duration-300 hover:text-purple-700 hover:scale-105 hover:underline' 
                            style={{ fontSize: "14px", fontWeight: "400" }} 
                            onClick={cancelAction}
                        >
                            {`No Thanks. Wait until ${GetFormattedDateString(metadata.renewal)} for credits`}
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default SupportFile
