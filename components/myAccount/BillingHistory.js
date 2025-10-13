import { GetFormattedDateString } from '@/utilities/utility'
import React, { useEffect, useState } from 'react'
import Apis from '../apis/Apis';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import moment from 'moment';
import { formatFractional2 } from '../agency/plan/AgencyUtilities';

function BillingHistory() {

    //stoores payment history
    const [PaymentHistoryData, setPaymentHistoryData] = useState([]);
    const [historyLoader, setHistoryLoader] = useState(false);

    useEffect(()=>{
        getPaymentHistory()
    },[])

    //function to get payment history
    const getPaymentHistory = async () => {
        try {
            setHistoryLoader(true);

            let AuthToken = null;
            let localDetails = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                localDetails = LocalDetails;
                AuthToken = LocalDetails.token;
            }

            const ApiPath = Apis.getPaymentHistory;

            const response = await axios.get(ApiPath, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                // //console.log;
                if (response.data.status === true) {
                    setPaymentHistoryData(response.data.data);
                }
            }
        } catch (error) {
            // console.error("Error occured in get history api is", error);
        } finally {
            setHistoryLoader(false);
        }
    };


    return (
        <div
            className="w-full flex flex-col items-start pl-8 py-2 h-screen overflow-y-auto overflow-x-hidden"
            style={{
                paddingBottom: "50px",
                scrollbarWidth: "none", // For Firefox
                WebkitOverflowScrolling: "touch",
            }}
        >

            <div className="flex flex-col">
                <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
                    Billing
                </div>

                <div
                    style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#00000090",
                    }}
                >
                    {"Account > Billing"}
                </div>
            </div>

            <div style={{ fontSize: 16, fontWeight: "700", marginTop: 40 }}>
                My Billing History
            </div>

            <div className="w-full flex flex-row justify-between mt-10 px-6 gap-3">
                <div className="w-4/12">
                    <div style={styles.text}>Name</div>
                </div>
                <div className="w-2/12">
                    <div style={styles.text}>Amount</div>
                </div>
                <div className="w-2/12">
                    <div style={styles.text}>Status</div>
                </div>
                <div className="w-4/12">
                    <div style={styles.text}>Date</div>
                </div>
            </div>

            <div className="w-full">
                {historyLoader ? (
                    <div className="w-full flex flex-row items-center justify-center mt-8 pb-12">
                        <CircularProgress size={35} thickness={2} />
                    </div>
                ) : (
                    <div className="w-full">
                        {PaymentHistoryData.map((item) => (
                            <div
                                key={item.id}
                                className="w-full flex flex-row items-center gap-3 mt-10 px-6"
                            >
                                <div className="w-4/12 flex flex-row gap-2">
                                    <div className="truncate" style={styles.text2}>
                                        {item.title}
                                    </div>
                                </div>
                                <div className="w-2/12">
                                    <div style={styles.text2}>${formatFractional2(item.price)}</div>
                                </div>
                                <div className="w-2/12 items-start">
                                    <div
                                        className="p-2 flex flex-row gap-2 items-center justify-center"
                                        style={{
                                            backgroundColor: item.processingStatus === 'failed' ? "#FF000010" : "#01CB7610",
                                            borderRadius: 20,
                                            // padding: '2px',
                                            width: "4vw",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 15,
                                                color: item.processingStatus === 'failed' ? "#FF0000" : "#01CB76",
                                                fontWeight: 500,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {item.processingStatus === 'failed' ? 'Failed' : 'Paid'}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-4/12">
                                    <div style={styles.text2}>
                                        {moment(item?.createdAt).format("MMM DD YYYY  h:mm A")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BillingHistory

const styles = {
    text: {
        fontSize: 12,
        color: "#00000090",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: 500,
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    paymentModal: {
        height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-50%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    headingStyle: {
        fontSize: 16,
        fontWeight: "700",
    },
    gitTextStyle: {
        fontSize: 15,
        fontWeight: "700",
    },

    //style for plans
    cardStyles: {
        fontSize: "14",
        fontWeight: "500",
        border: "1px solid #00000020",
    },
    pricingBox: {
        position: "relative",
        // padding: '10px',
        borderRadius: "10px",
        // backgroundColor: '#f9f9ff',
        display: "inline-block",
        width: "100%",
    },
    triangleLabel: {
        position: "absolute",
        top: "0",
        right: "0",
        width: "0",
        height: "0",
        borderTop: "50px solid #7902DF", // Increased height again for more padding
        borderLeft: "50px solid transparent",
    },
    labelText: {
        position: "absolute",
        top: "10px", // Adjusted to keep the text centered within the larger triangle
        right: "5px",
        color: "white",
        fontSize: "10px",
        fontWeight: "bold",
        transform: "rotate(45deg)",
    },
    content: {
        textAlign: "left",
        paddingTop: "10px",
    },
    originalPrice: {
        textDecoration: "line-through",
        color: "#7902DF65",
        fontSize: 18,
        fontWeight: "600",
    },
    discountedPrice: {
        color: "#000000",
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: "10px",
    },
};