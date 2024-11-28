import React, { useState, useEffect } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';

const FocusArea = ({ handleContinue, handleBack, DefaultData }) => {

    const router = useRouter();
    const [focusArea, setFocusArea] = useState([]);
    const [loader, setLoader] = useState(false);
    const [focusData, setFocusData] = useState([]);
    const [shouldContinue, setShouldContinue] = useState(true);

    useEffect(() => {
        const focusData = localStorage.getItem("registerDetails");
        if (focusData) {
            const FocusAreaDetails = JSON.parse(focusData);
            console.log("Local details are :", FocusAreaDetails);
            setFocusArea(FocusAreaDetails.focusAreaId);
        }
    }, [])

    useEffect(() => {
        if (DefaultData) {
            setLoader(false);
            console.log("Area of focus is ::", DefaultData.areaOfFocus);
            setFocusData(DefaultData.areaOfFocus);
        } else {
            setLoader(true);
        }
        console.log("");
    }, [DefaultData]);

    useEffect(() => {
        console.log("Focus area is :", focusArea);
        if (focusArea.length > 0) {
            setShouldContinue(false);
        } else if (focusArea.length === 0) {
            setShouldContinue(true);
        }
    }, [focusArea]);

    const handleNext = () => {
        const data = localStorage.getItem("registerDetails");
        if (data) {
            const details = JSON.parse(data);
            details.focusAreaId = focusArea;
            localStorage.setItem("registerDetails", JSON.stringify(details));
            if (focusArea.length > 0) {
                handleContinue();
            }
        }
    }

    const handlefocusArea = (id) => {
        // setFocusArea(prevId => (prevId === id ? null : id))
        setFocusArea((prevIds) => {
            if (prevIds.includes(id)) {
                // Unselect the item if it's already selected
                return prevIds.filter((prevId) => prevId !== id);
            } else {
                // Select the item if it's not already selected
                return [...prevIds, id];
            }
        })
    }

    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-white rounded-2xl flex flex-col justify-between w-10/12 h-[90vh] py-4 ' style={{ scrollbarWidth: "none" }}//overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
            >

                <div className='h-[80vh]'>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            What area of real estate do you focus on?
                        </div>
                        <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[55vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple' style={{ scrollbarWidth: "none" }}>

                            {focusData.map((item, index) => (
                                <button key={item.id} onClick={() => { handlefocusArea(item.id) }} className='border-none outline-none'>
                                    <div className='border bg-white flex flex-row items-start pt-3 w-full h-[126px] rounded-2xl'
                                        style={{
                                            border: focusArea.includes(item.id) ? "2px solid #7902DF" : "",
                                            scrollbarWidth: "none", backgroundColor: focusArea.includes(item.id) ? "#402FFF05" : ""
                                        }}>
                                        <div className='w-full flex flex-row items-start justify-between px-4 py-2'>
                                            <div className='text-start w-[60%]'>
                                                <div style={{ fontFamily: "", fontWeight: "700", fontSize: 20 }}>
                                                    {item.title}
                                                </div>
                                                <div className='mt-2'>
                                                    {item.description}
                                                </div>
                                            </div>
                                            {
                                                focusArea.includes(item.id) ?
                                                    <Image src={"/assets/charmTick.png"} alt='*' height={36} width={36} /> :
                                                    <Image src={"/assets/charmUnMark.png"} alt='*' height={36} width={36} />
                                            }
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {/* <Body /> */}
                        </div>
                    </div>
                </div>

                <div className='mb-4 h-[8vh]'>
                    <div>
                        <ProgressBar value={60} />
                    </div>

                    <Footer handleContinue={handleNext} handleBack={handleBack} shouldContinue={shouldContinue} />
                </div>

            </div>
        </div>
    )
}

export default FocusArea
