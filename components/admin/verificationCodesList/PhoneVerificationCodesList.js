import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@mui/material';
import parsePhoneNumberFromString from 'libphonenumber-js';

function PhoneVerificationCodesList() {

    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false)
    const [verificationCodes, setVerificationCodes] = useState([])

    useEffect(() => {
        getCodes()
    }, [])

    const getCodes = async (offset = 0) => {
        try {
            setLoading(true);
            // //console.log;
            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                AuthToken = Data.token;
            }

            let ApiPath = Apis.getVerificationCodes + "?offset=" + offset


            //console.log;

            //// //console.log;
            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });
            setLoading(false);

            if (response.data) {
                //console.log;
                setVerificationCodes(response.data.data)
            }

        } catch (error) {
            console.error("Error occured in gtting calls log api is:", error);
        } finally {
            setLoading(false);
        }
    }

    const formatPhoneNumber = (rawNumber) => {
        const phoneNumber = parsePhoneNumberFromString(
            rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
        );
        //// //console.log;
        return phoneNumber
            ? phoneNumber.formatInternational()
            : "Invalid phone number";
    };

    return (
        <div className="w-full items-start">

            <div className='py-4 px-10' style={{ fontSize: 24, fontWeight: '600' }}>
                Phone Verification Codes
            </div>


            <div className="w-full flex flex-row mt-3 px-10 mt-12">
                <div className="w-3/12">
                    <div style={styles.text}>Name</div>
                </div>

                <div className="w-3/12">
                    <div style={styles.text}>Phone Number</div>
                </div>
                <div className="w-3/12">
                    <div style={styles.text}>New Code</div>
                </div>
                <div className="w-3/12">
                    <div style={styles.text}>Status</div>
                </div>

            </div>

            {loading ? (
                <div
                    className={`flex flex-row items-center justify-center mt-12 h-[50vh] overflow-auto`}
                >
                    <CircularProgress size={35} thickness={2} />
                </div>
            ) : (
                <div
                    className={`h-[77vh] overflow-auto`}
                    id="scrollableDiv1"
                    style={{ scrollbarWidth: "none" }}
                >
                    <InfiniteScroll
                        className="lg:flex hidden flex-col w-full"
                        endMessage={
                            <p
                                style={{
                                    textAlign: "center",
                                    paddingTop: "10px",
                                    fontWeight: "400",
                                    fontFamily: "inter",
                                    fontSize: 16,
                                    color: "#00000060",
                                }}
                            >
                                {`You're all caught up`}
                            </p>
                        }
                        scrollableTarget="scrollableDiv1"
                        dataLength={verificationCodes.length}
                        next={() => {
                            if (!loading) {
                                getCodes(verificationCodes.length);
                            }
                        }} // Fetch more when scrolled
                        loader={
                            <div className="w-full flex flex-row justify-center mt-8">
                                <CircularProgress size={35} />
                            </div>
                        }
                        style={{ overflow: "unset" }}
                    >
                        {verificationCodes?.length > 0 ? (
                            <div>
                                {verificationCodes.map((item) => (
                                    <div
                                        key={item.id}
                                        style={{ cursor: "pointer" }}
                                        className="w-full flex flex-row items-center mt-5 px-10 hover:bg-[#402FFF05] py-2"
                                    >
                                        <div className="w-3/12 flex flex-row gap-2 items-center">
                                            {
                                                item.User?.thumb_profile_image ? (
                                                    <Image src={item.User?.thumb_profile_image}
                                                        height={40} width={40} style={{ borderRadius: 100 }}
                                                        alt='*'
                                                    />
                                                ) : (
                                                    <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                                                        {item.User?.name.slice(0, 1).toUpperCase()}
                                                    </div>
                                                )
                                            }
                                            <div style={styles.text2}>
                                                {item.User?.name}
                                            </div>
                                        </div>

                                        <div className="w-3/12">
                                            {/* (item.LeadModel?.phone) */}
                                            <div style={styles.text2}>
                                                {item.phone ? (
                                                    <div>{formatPhoneNumber(item?.phone)}</div>
                                                ) : (
                                                    "-"
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-3/12">
                                            <div style={styles.text2}>
                                                {item.code}
                                            </div>
                                        </div>

                                        <div className="w-3/12">
                                            <div style={styles.text2}>
                                                {item.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="text-center mt-4"
                                style={{ fontWeight: "bold", fontSize: 20 }}
                            >
                                No Phone number found
                            </div>
                        )}
                    </InfiniteScroll>
                </div>
            )}


        </div>

    )
}

export default PhoneVerificationCodesList


//styles
const styles = {
    text: {
        fontSize: 15,
        color: "#00000090",
        fontWeight: "600",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: "500",
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    modalsStyle: {
        // height: "auto",
        bgcolor: "transparent",
        p: 2,
        mx: "auto",
        // my: "50vh",
        // transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
};
