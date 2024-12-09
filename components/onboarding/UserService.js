import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import ProgressBar from './ProgressBar';
import Footer from './Footer';
import { CircularProgress } from '@mui/material';

const UserService = ({ handleContinue, DefaultData, handleBack }) => {

    const router = useRouter();
    const [serviceId, setServiceId] = useState([]);
    const [servicesData, setServicesData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [value, setValue] = useState(0);
    const [shouldContinue, setShouldContinue] = useState(true);

    useEffect(() => {
        const selectedServiceID = localStorage.getItem("registerDetails");
        if (selectedServiceID) {
            const serviceIds = JSON.parse(selectedServiceID);
            setServiceId(serviceIds.serviceID);
        }
    }, [])

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
        if (serviceId.length > 0) {
            console.log("service id is ::", serviceId);
            setShouldContinue(false);
        } else if (serviceId.length === 0) {
            setShouldContinue(true);
        }
    }, [serviceId]);

    const handleserviceId = (id) => {
        // setServiceId(prevId => (prevId === id ? null : id));
        setServiceId((prevIds) => {
            if (prevIds.includes(id)) {
                // Unselect the item if it's already selected
                return prevIds.filter((prevId) => prevId !== id);
            } else {
                // Select the item if it's not already selected
                return [...prevIds, id];
            }
        });
        setValue(30);
    }

    const handleNext = () => {
        const data = localStorage.getItem("registerDetails");
        if (data) {
            const details = JSON.parse(data);
            details.serviceID = serviceId;
            localStorage.setItem("registerDetails", JSON.stringify(details));
            if (serviceId) {
                if (serviceId.length > 0) {
                    handleContinue();
                }
            }
        }
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
            <div className='bg-white rounded-2xl flex flex-col justify-between w-10/12 h-[90%] py-4' style={{ scrollbarWidth: "none" }} // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
            >

                <div className='h-[82vh]'>
                    {/* header */}
                    <div className='h-[10%]'>
                        <Header />
                    </div>
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full h-[90%]'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            What would you like AgentX to help you with?
                        </div>

                        {
                            loader ?
                                <div className='mt-8'>
                                    <CircularProgress size={35} />
                                </div> :
                                <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[90%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple' style={{ scrollbarWidth: "none" }}>

                                    {servicesData.map((item, index) => (
                                        <button key={item.id} onClick={() => { handleserviceId(item.id) }} className='border-none outline-none'>
                                            <div className='border bg-white flex flex-row items-start w-full rounded-2xl pt-3'
                                                style={{
                                                    border: serviceId.includes(item.id) ? "2px solid #7902DF" : "", scrollbarWidth: "none",
                                                    backgroundColor: serviceId.includes(item.id) ? "#402FFF05" : ""
                                                }}>
                                                <div className='flex flex-row items-start justify-between px-4 w-full py-2'>
                                                    <div className='text-start w-[60%]'>
                                                        <div style={{ fontFamily: "", fontWeight: "700", fontSize: 20 }}>
                                                            {item.title}
                                                        </div>
                                                        <div className='mt-2'>
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                    {
                                                        serviceId.includes(item.id) ?
                                                            <Image src={"/assets/charmTick.png"} alt='*' height={36} width={36} /> :
                                                            <Image src={"/assets/charmUnMark.png"} alt='*' height={36} width={36} />
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                </div>
                        }

                    </div>
                </div>

                <div className='mb-6 h-[10%] flex flex-col justify-end'>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <div style={{ height: "35px" }}>
                        <Footer handleContinue={handleNext} handleBack={handleBack} shouldContinue={shouldContinue} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserService
