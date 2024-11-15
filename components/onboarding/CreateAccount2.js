import React, { useState, useEffect } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';

const CreateAccount2 = ({ handleContinue, handleBack, DefaultData }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const [loader, setLoader] = useState(false);
    const [focusData, setFocusData] = useState([]);

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

    const handleNext = () => {
        const data = localStorage.getItem("registerDetails");
        if (data) {
            const details = JSON.parse(data);
            details.focusAreaId = toggleClick;
            localStorage.setItem("registerDetails", JSON.stringify(details));
            handleContinue();
        }
    }

    const handleToggleClick = (id) => {
        setToggleClick(prevId => (prevId === id ? null : id))
    }

    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-gray-100 rounded-lg w-10/12 max-h-[90vh] py-4 overflow-auto'>
                {/* header */}
                <Header />
                {/* Body */}
                <div className='flex flex-col items-center px-4 w-full'>
                    <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                        What area of real estate do you focus on?
                    </div>
                    <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

                        {focusData.map((item, index) => (
                            <button key={item.id} onClick={() => { handleToggleClick(item.id) }} className='border-none outline-none'>
                                <div className='border bg-white flex flex-row items-start justify-between px-4 rounded-2xl py-2' style={{ borderColor: item.id === toggleClick ? "#402FFF" : "" }}>
                                    <div className='text-start'>
                                        <div style={{ fontFamily: "", fontWeight: "700", fontSize: 20 }}>
                                            {item.title}
                                        </div>
                                        <div>
                                            {item.description}
                                        </div>
                                    </div>
                                    {
                                        item.id === toggleClick ?
                                            <Image src={"/assets/charmTick.png"} alt='*' height={36} width={36} /> :
                                            <Image src={"/assets/charmUnMark.png"} alt='*' height={36} width={36} />
                                    }
                                </div>
                            </button>
                        ))}

                        {/* <Body /> */}
                    </div>
                </div>
                <div>
                    <ProgressBar value={60} />
                </div>

                <Footer handleContinue={handleNext} handleBack={handleBack} />
            </div>
        </div>
    )
}

export default CreateAccount2
