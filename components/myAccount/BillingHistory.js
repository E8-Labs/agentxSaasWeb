import { GetFormattedDateString } from '@/utilities/utility'
import React, { useEffect, useState } from 'react'
import Apis from '../apis/Apis';
import axios from 'axios';
import { CircularProgress, Modal, Box } from '@mui/material';
import moment from 'moment';
import { formatFractional2 } from '../agency/plan/AgencyUtilities';
import Image from 'next/image';

function BillingHistory() {

    //stoores payment history
    const [PaymentHistoryData, setPaymentHistoryData] = useState([]);
    const [historyLoader, setHistoryLoader] = useState(false);

    //transaction details modal variables
    const [transactionDetailsModal, setTransactionDetailsModal] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [transactionDetailsLoader, setTransactionDetailsLoader] = useState(false);
    const [clickedTransactionId, setClickedTransactionId] = useState(null);

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

    //function to get transaction details
    const getTransactionDetails = async (transactionId) => {
        try {
            setTransactionDetailsLoader(true);
            
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const Data = JSON.parse(localData);
                AuthToken = Data.token;
            }
            
            const ApiPath = `${Apis.getTransactionDetails}?transactionId=${transactionId}`;
            console.log("Api path for transaction details is", ApiPath);

            const response = await axios.get(ApiPath, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                console.log("Transaction details response:", response.data);
                if (response.data.status === true) {
                    setTransactionDetails(response.data.data);
                    setTransactionDetailsModal(true);
                } else {
                    console.error("Failed to fetch transaction details:", response.data.message);
                }
            }
        } catch (error) {
            console.error("Error occurred in get transaction details api:", error);
        } finally {
            setTransactionDetailsLoader(false);
            setClickedTransactionId(null);
        }
    };

    //function to handle transaction click
    const handleTransactionClick = (item) => {
        if (item.transactionId) {
            setClickedTransactionId(item.transactionId);
            getTransactionDetails(item.transactionId);
        } else {
            console.error("Transaction ID not available");
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
                                className={`w-full flex flex-row items-center gap-3 mt-10 px-6 rounded-lg py-2 transition-colors ${
                                    transactionDetailsLoader ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                                }`}
                                onClick={() => !transactionDetailsLoader && handleTransactionClick(item)}
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
                                    {clickedTransactionId === item.transactionId && transactionDetailsLoader ? (
                                        <div className="flex items-center justify-center">
                                            <CircularProgress size={20} thickness={2} />
                                        </div>
                                    ) : (
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
                                    )}
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

            {/* Transaction Details Modal */}
            <Modal
                open={transactionDetailsModal}
                closeAfterTransition
                BackdropProps={{
                    timeout: 100,
                    sx: {
                        backgroundColor: "#00000020",
                    },
                }}
            >
                <Box
                    className="md:9/12 lg:w-8/12 sm:w-11/12 w-full"
                    sx={styles.paymentModal}
                >
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="sm:w-9/12 w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                                maxHeight: "80vh",
                                overflowY: "auto",
                            }}
                        >
                            <div className="flex flex-row justify-between items-center mb-6">
                                <div
                                    style={{
                                        fontSize: 22,
                                        fontWeight: "600",
                                    }}
                                >
                                    Transaction Details
                                </div>
                                <button onClick={() => setTransactionDetailsModal(false)}>
                                    <Image
                                        src={"/assets/crossIcon.png"}
                                        height={40}
                                        width={40}
                                        alt="*"
                                    />
                                </button>
                            </div>

                            {transactionDetailsLoader ? (
                                <div className="w-full flex flex-row items-center justify-center py-12">
                                    <CircularProgress size={35} thickness={2} />
                                </div>
                            ) : transactionDetails ? (
                                <div className="space-y-6">
                                    {/* Transaction Overview */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Transaction Overview</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm text-gray-600">Transaction ID:</span>
                                                <p className="font-medium text-sm">{transactionDetails.database?.transactionId}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Amount:</span>
                                                <p className="font-medium text-sm">${transactionDetails.database?.price}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Status:</span>
                                                <p className="font-medium text-sm capitalize">{transactionDetails.database?.processingStatus}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Date:</span>
                                                <p className="font-medium text-sm">{GetFormattedDateString(transactionDetails.database?.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Description */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Description</h3>
                                        <div>
                                            <span className="text-sm text-gray-600">Title:</span>
                                            <p className="font-medium text-sm">{transactionDetails.database?.title}</p>
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-sm text-gray-600">Description:</span>
                                            <p className="font-medium text-sm">{transactionDetails.database?.description}</p>
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-sm text-gray-600">Type:</span>
                                            <p className="font-medium text-sm">{transactionDetails.database?.type}</p>
                                        </div>
                                    </div>

                                    {/* Agent Information */}
                                    {transactionDetails.database?.agent && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Agent Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-sm text-gray-600">Agent Name:</span>
                                                    <p className="font-medium text-sm">{transactionDetails.database.agent.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Agent Type:</span>
                                                    <p className="font-medium text-sm capitalize">{transactionDetails.database.agent.agentType}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-sm text-gray-600">Agent Role:</span>
                                                    <p className="font-medium text-sm">{transactionDetails.database.agent.agentRole}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Method Details */}
                                    {transactionDetails.stripe?.paymentMethod && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Method</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-sm text-gray-600">Card Brand:</span>
                                                    <p className="font-medium text-sm capitalize">{transactionDetails.stripe.paymentMethod.card.brand}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Last 4 Digits:</span>
                                                    <p className="font-medium text-sm">**** {transactionDetails.stripe.paymentMethod.card.last4}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Expiry:</span>
                                                    <p className="font-medium text-sm">{transactionDetails.stripe.paymentMethod.card.expMonth}/{transactionDetails.stripe.paymentMethod.card.expYear}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Country:</span>
                                                    <p className="font-medium text-sm">{transactionDetails.stripe.paymentMethod.card.country}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Customer Information */}
                                    {transactionDetails.stripe?.customer && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Customer Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-sm text-gray-600">Customer Name:</span>
                                                    <p className="font-medium text-sm">{transactionDetails.stripe.customer.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Email:</span>
                                                    <p className="font-medium text-sm">{transactionDetails.stripe.customer.email}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Customer ID:</span>
                                                    <p className="font-medium text-sm">{transactionDetails.stripe.customer.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Receipt Information */}
                                    {transactionDetails.stripe?.charge?.receiptUrl && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Receipt</h3>
                                            <div>
                                                <a 
                                                    href={transactionDetails.stripe.charge.receiptUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                                                >
                                                    View Receipt
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full flex flex-row items-center justify-center py-12">
                                    <p className="text-gray-500">No transaction details available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Box>
            </Modal>
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