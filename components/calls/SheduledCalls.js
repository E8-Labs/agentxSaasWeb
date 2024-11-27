import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Apis from '../apis/Apis';
import axios from 'axios';

function SheduledCalls() {

    const [callDetails, setCallDetails] = useState([]);
    const [initialLoader, setInitialLoader] = useState(false);

    useEffect(() => {
        getSheduledCallLogs()
    }, []);

    const getSheduledCallLogs = async () => {
        try {
            setInitialLoader(true);
            const ApiPath = `${Apis.getSheduledCallLogs}?name=john`;

            console.log("Apipath is", ApiPath);

            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            console.log("Auth token is:", AuthToken);

            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                if (response) {
                    console.log("response of get Sheduled call logs api is :", response.data);
                    setCallDetails(response.data.data);
                }
            }

        } catch (error) {
            console.error("Error occured in gtting Sheduled call logs api is:", error);
        } finally {
            setInitialLoader(false);
        }
    }

    return (
        <div className='w-full items-start'>
            <div className='w-full flex flex-row justify-between mt-10 px-10'>
                <div className='w-3/12'>
                    <div style={styles.text}>Agent</div>
                </div>
                <div className='w-2/12 '>
                    <div style={styles.text}>Objective</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Leads</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Date created</div>
                </div>
                <div className='w-2/12'>
                    <div style={styles.text}>Sheduled on</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Action</div>
                </div>
            </div>
            {
                callDetails.map((item, index) => (
                    <div className='w-full flex flex-row items-center justify-between mt-10 px-10' key={index}>
                        <div className='w-3/12 flex flex-row gap-2 items-center'>
                            <div className='h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white'>
                                {item.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div style={styles.text2}>{item.name}</div>
                        </div>
                        <div className='w-2/12 '>
                            <div style={styles.text2}>{item.objective}</div>
                        </div>
                        <div className='w-1/12'>
                            <div style={styles.text2}>{item.lead}</div>
                        </div>
                        <div className='w-1/12'>
                            <div style={styles.text2}>{item.date}</div>
                        </div>
                        <div className='w-2/12'>
                            <div style={styles.text2}>{item.duration}</div>
                        </div>
                        <div className='w-1/12'>
                            <button>
                                <Image src={'/otherAssets/threeDotsIcon.png'}
                                    height={24}
                                    width={24}
                                    alt='icon'
                                />
                            </button>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default SheduledCalls
const styles = {
    text: {
        fontSize: 15,
        color: '#00000090',
        fontWeight: "500"
    },
    text2: {
        textAlignLast: 'left',
        fontSize: 15,
        color: '#000000',
        fontWeight: "500",
        whiteSpace: 'nowrap',  // Prevent text from wrapping
        overflow: 'hidden',    // Hide overflow text
        textOverflow: 'ellipsis'  // Add ellipsis for overflow text
    }
}