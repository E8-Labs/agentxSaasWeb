import React, { useEffect, useState } from "react";
import { Drawer, Button, IconButton, Box, Typography, Modal, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import Apis from "@/components/apis/Apis";
import axios from "axios";

export default function AffiliateDetailsDrawer({ open, onClose, affiliate }) {

    const [showAddNewPayouPopup, setShowAddNewPayoutPopup] = useState(false)

    const [payouts, setPayouts] = useState([])
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        getPayout()
    }, [affiliate])

    const getPayout = async () => {
        try {
            setLoading2(true)
            const data = localStorage.getItem("User")

            if (data) {
                let u = JSON.parse(data)

                let apipath = Apis.getPayouts + "?affiliateId=" + affiliate.id
                console.log('apipath', apipath)

                let response = await axios.get(apipath, {
                    headers: {
                        "Authorization": "Bearer " + u.token
                    }
                })

                if (response.data) {
                    setLoading2(false)

                    if (response.data.status === true) {
                        setPayouts(response.data.data)
                        console.log('response.data.data', response.data.data)
                    } else {
                        console.log('response.data.message', response.data.message)
                    }
                }

            }
        } catch (e) {
            setLoading2(false)

            console.log('error in get payouts is ', e)
        }
    }


    const addPayout = async (amount) => {
        if (!amount) {
            setError("Enter amount")
            return
        }
        setLoading(true)
        try {
            const data = localStorage.getItem("User")

            if (data) {
                let u = JSON.parse(data)

                let apipath = Apis.addPayouts
                let apidata = {
                    affiliateId: affiliate.id,
                    amount: amount
                }
                console.log('apipath', apipath)

                let response = await axios.post(apipath, apidata, {
                    headers: {
                        "Authorization": "Bearer " + u.token
                    }
                })

                if (response.data) {
                    setLoading(false)
                    if (response.data.status === true) {
                        setPayouts((prev) => [...prev, response.data.data])
                        console.log('response.data.data', response.data.data)
                        setShowAddNewPayoutPopup(false)
                        setAmount("")
                    } else {
                        console.log('response.data.message', response.data.message)
                    }
                }

            }
        } catch (e) {
            setLoading(false)
            console.log('error in add payouts is ', e)
        } finally {
            setLoading(false)
        }
    }



    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: "45%",
                    // maxWidth: "600px",
                    borderRadius: "12px",
                    padding: "20px",
                    margin: "20px",
                    height: '94vh',
                    boxShadow: 3,
                    backgroundColor: "white",
                    overflow: "hidden",
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: "#00000040",
                },
            }}
        >
            {/* Header Section */}
            <div className="w-full flex flex-row items-center justify-between pb-4 border-b">
                <div style={{ fontSize: 18, fontWeight: '700', }}>
                    More Info
                </div>
                <button onClick={onClose}>
                    <CloseIcon />
                </button>
            </div>

            <div className="flex flex-col w-full h-[80vh]"
                style={{ overflow: 'auto', scrollbarWidth: 'none' }}
            >

                <div className="w-full flex flex-row items-start justify-between mt-4">
                    <div className="flex flex-col items-start gap-2">
                        <div style={{ fontSize: 22, fontWeight: '700', }}>
                            {affiliate.name}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: '500', color: '#15151580' }}>
                            {affiliate.email}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: '500', color: '#15151580' }}>
                            {affiliate.phone ? affiliate.phone : '-'}
                        </div>
                        <div className="text-purple" style={{ fontSize: 15, fontWeight: '500', textDecorationLine: 'underline' }}>
                            {affiliate.uniqueUrl ? affiliate.uniqueUrl : '-'}
                        </div>
                    </div>

                    <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
                        Created on {affiliate.createdAt ? moment(affiliate.createdAt).format("MMMM DD YYYY hh:mma") : "-"}
                    </div>
                </div>



                <div className="flex w-full flex-row justify-between items-center mt-4">

                    <div className="flex flex-col items-start gap-2 bg-[#15151506] rounded-lg h-[77px] w-[170px] p-2">
                        <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
                            Total Users
                        </div>
                        <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                            {affiliate.totalUsers}
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 bg-[#15151506] rounded-lg h-[77px] w-[170px] p-2">
                        <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
                            Revenue
                        </div>
                        <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                            {affiliate.Revenue ? `$${affiliate.Revenue.toFixed(2)}` : '-'}
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 bg-[#15151506] rounded-lg h-[77px] w-[170px] p-2">
                        <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
                            XBar Amount
                        </div>
                        <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                            {affiliate.xbarTotalRevenue?.totalSpent ? `$${affiliate.xbarTotalRevenue?.totalSpent.toFixed(2)}` : '-'}
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 bg-[#15151506] rounded-lg h-[77px] w-[170px] p-2">
                        <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
                            Top Spending Clients
                        </div>
                        <div style={{ fontSize: 14, fontWeight: '500', color: '#00000060' }}>
                            {affiliate.topSpender?.User?.name} <span style={{ fontSize: 14, fontWeight: '500', color: '#000000' }}>
                                (${affiliate.topSpender?.totalSpent.toFixed(2)})
                            </span>
                        </div>
                    </div>
                </div>


                <div className="flex w-full flex-row justify-between items-center mt-4">

                    <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                        Payouts
                    </div>

                    <button className="text-white bg-purple outline-none rounded-lg px-3 py-2 w-[117] mt-8"
                        onClick={() => { setShowAddNewPayoutPopup(true) }}
                    >
                        New Payout
                    </button>
                </div>

                {
                    loading2 ? (
                        <div className="w-full flex items-center flex-col">
                            <CircularProgress size={30} />
                        </div>
                    ) :
                        payouts.length > 0 ? (
                            <>
                                <div className="flex w-full flex-row h-[52px] border justify-between items-center mt-4">
                                    <div className="w-5/12 flex flex-col justify-center p-3 border-r-2 h-full border-[#15151510]">
                                        <div style={styles.text}>Date</div>
                                    </div>
                                    <div className="w-4/12 flex flex-col justify-center p-3 border-r-2 h-full border-[#15151510]">
                                        <div style={styles.text}>Revenue Amount</div>
                                    </div>
                                    <div className="w-5/12 flex flex-col justify-center p-3 border-r-2 h-full border-[#15151510]">
                                        <div style={styles.text}>Paid</div>
                                    </div>
                                </div>

                                {
                                    payouts.map((item, index) => (
                                        <div key={index} className="flex w-full flex-row h-[52px justify-between items-center">
                                            <div className="w-5/12 flex flex-col justify-center p-3 border-r-2 h-full border-[#15151510] ">
                                                <div style={styles.text}>{moment(item.createdAt).format("MMMM DD YYYY")}</div>
                                            </div>
                                            <div className="w-4/12 flex flex-col justify-center p-3 border-r-2 h-full border-[#15151510]">
                                                <div style={styles.text}>{"-"}</div>
                                            </div>
                                            <div className="w-5/12 flex flex-col justify-center p-3 h-full border-[#15151510]">
                                                <div style={styles.text}>{item.amount}</div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </>
                        ) : (
                            <div style={{ fontSize: 16, fontWeight: '500' }}>
                                No payouts
                            </div>
                        )
                }


            </div>


            {/* add new payout modal */}


            <Modal open={showAddNewPayouPopup} onClose={() => { setShowAddNewPayoutPopup(false) }}
                closeAfterTransition
                BackdropProps={{
                    timeout: 500,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 340,
                        bgcolor: "white",
                        boxShadow: 24,
                        borderRadius: "12px",
                        p: 3,
                        textAlign: "center",
                    }}
                >
                    {/* Header Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">
                            New Payout
                        </Typography>
                        <IconButton onClick={() => { setShowAddNewPayoutPopup(false) }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Amount Section */}
                    <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                        <Typography fontSize={14} fontWeight="500" color="gray">
                            Amount
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mt: 1,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 30,
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ fontSize: "20px", fontWeight: "400", marginRight: 5 }}>
                                    $
                                </span>
                                <input
                                    className="outline-none focus:ring-0 border-none"
                                    type='number'
                                    value={amount}
                                    onChange={(event) => {
                                        setAmount(event.target.value)
                                        setError(null)
                                    }}
                                    placeholder="amount"
                                />
                            </Typography>

                        </Box>

                        <Box sx={{ width: "60%", height: "1px", backgroundColor: "#ccc", my: 1 }}></Box>
                        {
                            error && (
                                <div style={{ fontSize: 14, fontWeight: '400', color: 'red' }}>
                                    {error}
                                </div>
                            )
                        }
                        <Typography fontSize={14} fontWeight="500" color="gray">
                            Revenue: <span style={{ fontWeight: "bold", color: "#000" }}>${"revenue"}</span>
                        </Typography>
                    </Box>

                    {/* Issue Payout Button */}
                    {
                        loading ? (
                            <CircularProgress size={25} />
                        ) : (

                            <button className="text-white bg-purple outline-none rounded-lg px-3 py-2 w-[175px] mt-8"
                                onClick={() => { addPayout(amount) }}
                            >
                                Issue Payout
                            </button>
                        )
                    }

                </Box>
            </Modal>



        </Drawer>

    );
}


const styles = {
    text: {
        fontSize: 16,
        color: "#151515",
        fontWeight: "500",
    },
}
