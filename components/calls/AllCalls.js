import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import moment from 'moment';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { CircularProgress, duration } from '@mui/material';


function AllCalls() {

    const [searchValue, setSearchValue] = useState("");

    // const callDetails = [
    //   {
    //     id: 1, name: "Rayna Passaquindici Arcand", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
    //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    //   },
    //   {
    //     id: 2, name: "Gretchen Workman", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
    //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    //   },
    //   {
    //     id: 3, name: "Zain Baptista", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
    //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    //   },
    //   {
    //     id: 4, name: "Jordyn Korsgaard", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
    //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    //   },
    //   {
    //     id: 5, name: "Lincoln Stanton", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
    //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    //   },
    // ];

    const [callDetails, setCallDetails] = useState([]);
    const [filteredCallDetails, setFilteredCallDetails] = useState([]);
    const [initialLoader, setInitialLoader] = useState(false);

    useEffect(() => {
        getCallLogs();
    }, []);

    //code for getting call log details
    const getCallLogs = async () => {
        try {
            setInitialLoader(true);
            const ApiPath = Apis.getCallLogs;

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
                    console.log("response of get call logs api is :", response.data);
                    setCallDetails(response.data.data);
                    setFilteredCallDetails(response.data.data);
                }
            }

        } catch (error) {
            console.error("Error occured in gtting calls log api is:", error);
        } finally {
            setInitialLoader(false);
        }
    }

    //code to filter search
    const handleSearchChange = (value) => {
        if (value.trim() === "") {
            // console.log("Should reset to original");
            // Reset to original list when input is empty
            setFilteredCallDetails(callDetails);
            return;
        }

        const filtered = callDetails.filter(item => {
            const term = value.toLowerCase();
            return (
                item.LeadModel?.firstName.toLowerCase().includes(term) ||
                // item.LeadModel?.lastName.toLowerCase().includes(term) ||
                // item.LeadModel?.address.toLowerCase().includes(term) ||
                item.LeadModel?.email.toLowerCase().includes(term) ||
                (item.LeadModel?.phone && callDetails.LeadModel?.phone.includes(term))
            );
        });

        setFilteredCallDetails(filtered);

    }

    return (
        <div className='w-full items-start'>

            <div className='flex w-full pl-10 flex-row items-start gap-3'>
                <div className="flex w-3/12 items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone"
                        className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none"
                        value={searchValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleSearchChange(value);
                            setSearchValue(e.target.value);
                        }}
                    />
                    <img
                        src={'/otherAssets/searchIcon.png'}
                        alt="Search"
                        width={20}
                        height={20}
                    />
                </div>

                <button>
                    <Image src={'/otherAssets/filterBtn.png'}
                        height={36}
                        width={36}
                        alt='Search'
                    />
                </button>
            </div>

            <div className='w-full flex flex-row justify-between mt-10 px-10 mt-12'>
                <div className='w-2/12'>
                    <div style={styles.text}>Name</div>
                </div>
                <div className='w-2/12 '>
                    <div style={styles.text}>Email Address</div>
                </div>
                <div className='w-2/12'>
                    <div style={styles.text}>Contact Number</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Stage</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Status</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Date</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Time stamp</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>More</div>
                </div>
            </div>

            {
                initialLoader ?
                    <div className='w-full flex flex-row items-center justify-center mt-12'>
                        <CircularProgress size={35} thickness={2} />
                    </div> :
                    <div className='h-[67vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                        {
                            filteredCallDetails.map((item) => (
                                <div key={item.id} className='w-full flex flex-row justify-between items-center mt-10 px-10'>
                                    <div className='w-2/12 flex flex-row gap-2 items-center'>
                                        <div className='h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white'>
                                            {item.LeadModel?.firstName.slice(0, 1).toUpperCase()}
                                        </div>
                                        <div style={styles.text2}>{item.LeadModel?.firstName}</div>
                                    </div>
                                    <div className='w-2/12 '>
                                        <div style={styles.text2}>{item.LeadModel?.email}</div>
                                    </div>
                                    <div className='w-2/12'>
                                        <div style={styles.text2}>{item.LeadModel?.phone}</div>
                                    </div>
                                    <div className='w-1/12'>
                                        <div style={styles.text2}>{item.LeadModel?.stage ? (item.LeadModel?.stage) : "N/A"}</div>
                                    </div>
                                    <div className='w-1/12'>
                                        <div style={styles.text2}>{item.LeadModel?.status ? (item.LeadModel?.status) : "N/A"}</div>
                                    </div>
                                    <div className='w-1/12'>
                                        <div style={styles.text2}>{moment(item.LeadModel?.createdAt).format('MM/DD/YYYY')}</div>
                                    </div>
                                    <div className='w-1/12'>
                                        <div style={styles.text2}>{moment(item.LeadModel?.createdAt).format('HH:mm:ss A')}</div>
                                    </div>
                                    <div className='w-1/12'>
                                        <button>
                                            <div style={{ fontSize: 12, color: '#7902DF', textDecorationLine: 'underline' }}>
                                                Details
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
            }
        </div>
    )
}

export default AllCalls


//styles
const styles = {
    text: {
        fontSize: 15,
        color: '#00000090',
        fontWeight: "600"
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