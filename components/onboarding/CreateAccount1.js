import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import ProgressBar from './ProgressBar';
import Footer from './Footer';
import { CircularProgress } from '@mui/material';

const CreateAccount1 = ({ handleContinue, DefaultData }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const [servicesData, setServicesData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [value, setValue] = useState(0);


    useEffect(() => {
        setLoader(true);
        if (DefaultData) {
            setLoader(false);
            console.log("Response for service is ::", DefaultData.agentServices);
            setServicesData(DefaultData.agentServices);
        } else {
            setLoader(true);
        }
        console.log("");
    }, [DefaultData]);

    useEffect(() => {
        if (toggleClick) {
            console.log("service id is ::", toggleClick);
        }
    }, [toggleClick]);

    const handleToggleClick = (id) => {
        setToggleClick(prevId => (prevId === id ? null : id));
        setValue(30);
    }

    const handleNext = () => {
        const userData = {
            serviceID: toggleClick,
            focusAreaId: ""
        }
        localStorage.setItem("registerDetails", JSON.stringify(userData));
        handleContinue()
    }

    //code for linear progress moving
    // useEffect(() => {
    //   const timer = setInterval(() => {
    //     setProgress((oldProgress) => {
    //       if (oldProgress === 100) {
    //         return 0;
    //       }
    //       const diff = Math.random() * 10;
    //       return Math.min(oldProgress + diff, 100);
    //     });
    //   }, 500);

    //   return () => {
    //     clearInterval(timer);
    //   };
    // }, []);



    return (
        <div style={{ width: "100%" }} className="overflow-y-none flex flex-row justify-center items-center">
            <div className='bg-gray-100 rounded-lg w-10/12 max-h-[90vh] py-4 overflow-auto'>
                {/* header */}
                <Header />
                {/* Body */}
                <div className='flex flex-col items-center px-4 w-full'>
                    <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                        What would you like AgentX to help you with?
                    </div>

                    {
                        loader ?
                            <div className='mt-8'>
                                <CircularProgress size={35} />
                            </div> :
                            <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

                                {servicesData.map((item, index) => (
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

                            </div>
                    }

                </div>
                <div>
                    <ProgressBar value={value} />
                </div>

                <div style={{ height: "55px" }}>
                    {
                        toggleClick && (
                            <Footer handleContinue={handleNext} donotShowBack={true} />
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default CreateAccount1
