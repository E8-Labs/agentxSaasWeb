import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import ProgressBar from './ProgressBar';
import Footer from './Footer';

const CreateAccount1 = ({ handleContinue }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);

    const TestData = [
        {
            id: 1,
            title: 'Qualify Buyers & Sellers',
        },
        {
            id: 2,
            title: 'Follow up and Nurture',
        },
        {
            id: 3,
            title: 'Property Search & Selection',
        },
        {
            id: 4,
            title: 'Financing Assistance',
        },
        {
            id: 5,
            title: 'Market Analysis & Advice',
        },
        {
            id: 6,
            title: 'Property Valuation & Pricing Strategy',
        },
        {
            id: 7,
            title: 'Customer Service',
        },
        {
            id: 8,
            title: 'Closing Assistance',
        },
    ];

    const handleToggleClick = (id) => {
        setToggleClick(prevId => (prevId === id ? null : id))
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
                    <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

                        {TestData.map((item, index) => (
                            <button key={item.id} onClick={() => { handleToggleClick(item.id) }} className='border-none outline-none'>
                                <div className='border bg-white flex flex-row items-start justify-between px-4 rounded-2xl py-2' style={{ borderColor: item.id === toggleClick ? "#402FFF" : "" }}>
                                    <div className='text-start'>
                                        <div style={{ fontFamily: "", fontWeight: "700", fontSize: 20 }}>
                                            {item.title}
                                        </div>
                                        <div>
                                            Detail
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
                    <ProgressBar value={30} />
                </div>

                <Footer handleContinue={handleContinue} donotShowBack={true} />
            </div>
        </div>
    )
}

export default CreateAccount1
