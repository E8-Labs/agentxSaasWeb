import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import ProgressBar from './ProgressBar';
import Footer from './Footer';
import { Box, CircularProgress, Modal } from '@mui/material';
import { localeData } from 'moment';

const UserType = ({ handleContinue, DefaultData }) => {

    const router = useRouter();
    const [value, setValue] = useState(8);
    const [SelectUserType, setSelectUserType] = useState(null);
    const [ShowModal, setShowModal] = useState(false);

    useEffect(() => {
        const localData = localStorage.getItem("registerDetails");
        if (localData) {
            const localDetails = JSON.parse(localData);
            setSelectUserType(localDetails.userType);
        }
    }, [])

    const handleUserType = async (item) => {
        if (item.id === 1) {
            setSelectUserType(item.id);
        } else {
            setSelectUserType(null);
            setShowModal(true);
        }
    }

    const handleNext = () => {

        const data = localStorage.getItem("registerDetails");
        if (data) {
            const details = JSON.parse(data);
            details.userType = SelectUserType;
            localStorage.setItem("registerDetails", JSON.stringify(details));
            // handleContinue();
        } else {
            const userData = {
                serviceID: "",
                focusAreaId: "",
                userType: SelectUserType
            }
            localStorage.setItem("registerDetails", JSON.stringify(userData));
        }

        if (SelectUserType) {
            handleContinue();
        }
    }

    const userType = [
        {
            id: 1,
            title: "Real Estate Agent",
        },
        {
            id: 2,
            title: "Sales Dev Rep"
        },
        {
            id: 3,
            title: "Solar Rep"
        },
        {
            id: 4,
            title: "Insurance Agent"
        },
        {
            id: 5,
            title: "Marketer"
        },
        {
            id: 6,
            title: "Website Owners"
        },
    ];

    const styles = {
        modalsStyle: {
            height: "auto",
            bgcolor: "transparent",
            // p: 2,
            mx: "auto",
            my: "50vh",
            transform: "translateY(-55%)",
            borderRadius: 2,
            border: "none",
            outline: "none",
        },
    }



    return (
        <div style={{ width: "100%" }} className="overflow-y-none flex flex-row justify-center items-center">
            <div className='bg-white rounded-2xl w-10/12 max-h-[90vh] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple' style={{ scrollbarWidth: "none" }}>
                {/* header */}
                <Header />
                {/* Body */}
                <div className='flex flex-col items-center px-4 w-full'>
                    <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                        What type of user are you?
                    </div>

                    <div className='flex flex-wrap w-8/12 mt-8'>
                        {
                            userType.map((item, index) => (
                                <div key={item.id} className='flex w-4/12 p-2'>
                                    <button className='w-full border rounded-lg p-2' onClick={(e) => { handleUserType(item) }} style={{ border: item.id === SelectUserType ? "2px solid #402FFF" : "" }}>
                                        <div className='h-[198px] bg-gray-200 rounded w-full' style={{ backgroundColor: "" }}>
                                        </div>
                                        <div className='text-center mt-2' style={{ fontWeight: "700", fontSize: 17 }}>
                                            {item.title}
                                        </div>
                                    </button>
                                </div>
                            ))
                        }
                    </div>


                    {/* Modals code goes here */}
                    <Modal
                        open={ShowModal}
                        onClose={() => setShowModal(false)}
                        closeAfterTransition
                        BackdropProps={{
                            timeout: 1000,
                            sx: {
                                backgroundColor: "#00000040",
                                // backdropFilter: "blur(20px)",
                            },
                        }}
                    >
                        <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.modalsStyle}>
                            <div className="flex flex-row justify-center w-full">
                                <div
                                    className="w-full"
                                    style={{
                                        backgroundColor: "#ffffff",
                                        padding: 20,
                                        borderRadius: "13px",
                                    }}
                                >
                                    <div className='flex flex-row justify-end'>
                                        <button onClick={() => { setShowModal(false) }}>
                                            <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                        </button>
                                    </div>
                                    <div className='text-center mt-2 mb-4' style={{ fontWeight: "700", fontSize: 24 }}>
                                        Comming Soon ....
                                    </div>


                                    {/* Can be use full to add shadow */}
                                    {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                </div>
                            </div>
                        </Box>
                    </Modal>


                </div>
                <div>
                    <ProgressBar value={value} />
                </div>

                <div className='mb-8' style={{ height: "55px" }}>
                    <Footer handleContinue={handleNext} donotShowBack={true} />
                </div>
            </div>
        </div>
    )
}

export default UserType
