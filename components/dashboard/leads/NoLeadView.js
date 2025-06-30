import React from 'react';
import Image from 'next/image';
import VideoCard from '@/components/createagent/VideoCard';
import { styles } from '@/components/globalsstyles/Stles';

const NoLeadView = ({
    setShowAddLeadModal,
    setShowAddNewSheetModal
}) => {


    return (
        <div className="h-screen">
            <div className="flex flex-row items-start justify-center mt-48 w-full">
                <Image
                    src={"/assets/placeholder.png"}
                    height={145}
                    width={710}
                    alt="*"
                />
            </div>
            <div
                className="mt-12 ms-8 text-center"
                style={{ fontSize: 30, fontWeight: "700" }}
            >
                {`Looks like you don't have any leads yet`}
            </div>

            <div className="w-full flex flex-row gap-6 justify-center mt-10 gap-4">
                <div className="">
                    <button
                        className="flex flex-row gap-2 bg-purple text-white h-[50px] w-[177px] rounded-lg items-center justify-center"
                        onClick={() => {
                            setShowAddLeadModal(true);
                        }}
                    >
                        <Image
                            src={"/assets/addManIcon.png"}
                            height={20}
                            width={20}
                            alt="*"
                        />
                        <span style={styles.headingStyle}>Upload Leads</span>
                    </button>
                </div>
                <div className="">
                    <button
                        className="flex flex-row gap-2 bg-purple text-white h-[50px] w-[219px] rounded-lg items-center justify-center"
                        onClick={() => {
                            setShowAddNewSheetModal(true);
                        }}
                    >
                        <Image
                            src={"/assets/smartlistIcn.svg"}
                            height={24}
                            width={24}
                            alt="*"
                        />
                        <span style={styles.headingStyle}>Create Smartlist</span>
                    </button>
                </div>
            </div>

            <div
                className="w-full flex flex-row justify-center mt-4"
            // style={{
            //   position: "absolute",
            //   bottom: "70px",
            //   left: "50%",
            //   transform: "translateX(-50%)",
            // }}
            >
                <VideoCard
                    duration={"11 min 27 sec"}
                    horizontal={false}
                    playVideo={() => {
                        setIntroVideoModal(true);
                    }}
                    title=" Learn how to add leads to your CRM"
                />
            </div>
        </div>
    )
}

export default NoLeadView;
