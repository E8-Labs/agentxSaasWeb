import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js'
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
// import { CardPostalCodeElement } from '@stripe/react-stripe-js';
import { Alert, Button, CircularProgress, Fade, Slide, Snackbar } from '@mui/material'
import { toast } from 'react-toastify'
import axios from 'axios'
import Image from 'next/image';
import Apis from '@/components/apis/Apis';
// import Apis from '../Apis/Apis';

const AddCardDetails = ({
    subscribePlan, subscribeLoader, fromMYPlansScreen, closeAddCardPopup,
    handleClose, togglePlan, setAddPaymentSuccessPopUp
}) => {


    const stripeReact = useStripe();
    const elements = useElements();
    //console.log("From Build AI Screen ", fromBuildAiScreen)
    //console.log("From Build AI Screen Selected Plan", selectedPlan)


    const [addCardLoader, setAddCardLoader] = useState(false);
    const [addNumberErr, setAddNumberErr] = useState(false);
    const [addDateErr, setAddDateErr] = useState(false);
    const [cvcErr, setCvcErr] = useState(false);
    const [credentialsErr, setCredentialsErr] = useState(false);
    const [addCardSuccess, setAddCardSuccess] = useState(false);
    const [addCardFailure, setAddCardFailure] = useState(false);
    const [addCardDetails, setAddCardDetails] = useState(null);
    const [addCardErrtxt, setAddCardErrtxt] = useState(null);
    const [isWideScreen, setIsWideScreen] = useState(false);
    const cardNumberRef = useRef(null);
    const cardExpiryRef = useRef(null);
    const cardCvcRef = useRef(null);

    // Autofocus the first field when the component mounts
    useEffect(() => {
        console.log("Trying to focus check 2")
        if (cardNumberRef.current) {
            console.log("Trying to focus check 1")
            cardNumberRef.current.focus();
        }
    }, []);

    // Handle field change to focus on the next input
    const handleFieldChange = (event, ref) => {
        if (event.complete && ref.current) {
            ref.current.focus();
        }
    };
    // const [selectedUserPlan, setSelectedUserPlan] = useState(null);


    if (!stripeReact || !elements) {
        //console.log("Stripe error here");
        //console.log("Stripe error ", stripeReact)
        //console.log("Stripe error 2 ", elements)
        return (
            <div>Loading stripe</div>
        )
    }
    else {
        //console.log("No stripe err");
    }
    const handleBackClick = (e) => {
        e.preventDefault();
        handleBack();
    }


    // //code for wide screen
    // useEffect(() => {
    //     const handleResize = () => {
    //         // Check if width is greater than or equal to 1024px
    //         setIsWideScreen(window.innerWidth >= 500);

    //         // setIsWideScreen2(window.innerWidth >= 500);
    //         // Check if height is greater than or equal to 1024px
    //         // setIsHighScreen(window.innerHeight >= 640);

    //         // Log the updated state values for debugging (Optional)
    //         console.log("isWideScreen: ", window.innerWidth >= 500);
    //     };

    //     handleResize(); // Set initial state
    //     window.addEventListener("resize", handleResize);

    //     return () => {
    //         window.removeEventListener("resize", handleResize);
    //     };
    // }, []);

    const elementOptions = {
        style: {
            base: {
                backgroundColor: 'transparent',
                color: '#000000',
                fontSize: '18px',
                lineHeight: '40px',
                borderRadius: 10,
                padding: 10,
                '::placeholder': {
                    color: '#00000050',
                },
            },
            invalid: {
                color: 'red',
            },
        },
    };

    //code for adding card api

    // useEffect(()=>{
    //     console.log("Selected Plan changed", selectedPlan)
    // }, [selectedPlan])


    // useEffect(() => {})
    //console.log("Sending back plan ", selectedPlan)
    // let selPlan = null;

    //function to add card
    const handleAddCard = async (e) => {

        // if (!fromBuildAiScreen) {
        // }
        setAddCardLoader(true);

        if (stop) {
            stop(false);
        }

        // return
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        // Close the modal
        // handleClose4(e);
        // return
        if (!stripeReact || !elements) {
            //console.log("Stripe error here");
            //console.log("Stripe error ", stripeReact)
            //console.log("Stripe error 2 ", elements)
            return
        }
        else {
            //console.log("No stripe err");
        }

        const cardNumberElement = elements.getElement(CardNumberElement);

        stripeReact.createToken(cardNumberElement).then(async function (tok) {
            if (tok.error) {
                setCredentialsErr(true);
                // if (fromBuildAiScreen) {
                //     console.log("reached end");
                //     subscribeLoader(false);
                // }
                toast.error(tok.error.code, {
                    position: "bottom-right",
                    pauseOnHover: true,
                    autoClose: 8000,
                    theme: "dark"
                });
            } else if (tok.token.id) {

                // if (handleSubLoader) {
                //     handleSubLoader(true);
                // }
                // return
                console.log("Token generating for card number :", tok.token.id)
                const tokenId = tok.token.id;
                console.log("card number :");
                // let modelId = null;
                // if (localAssistanData) {
                //     const asistantLocalData = JSON.parse(localAssistanData);
                //     console.log("Assistant data retrived", asistantLocalData);
                //     if (fromMYPlansScreen) {
                //         console.log("Adding new card");
                //         modelId = null;
                //     } else {
                //         modelId = (asistantLocalData.id);
                //     }
                // } else {
                //     modelId = null;
                // }
                const ApiPath = Apis.addCard;
                console.log("Api path is", ApiPath);
                const AddCardData = {
                    source: tokenId,
                    // modelId: modelId
                }
                console.log("Data for card number :", AddCardData);

                try {
                    const LocalData = localStorage.getItem('User');
                    const D = JSON.parse(LocalData);
                    console.log("Local data is", D);
                    const AuthToken = D.token;
                    // const AuthToken = "bgabgakjhaslidfhgkerhiuhkmxvnidfuhgiehlmklhn";
                    console.log("Token for add card ", D.token);

                    console.log('Data sending in api is :', AddCardData);
                    // return

                    //can be useful when user want to add card from dashboard

                    // const fromBuyStatus = localStorage.getItem("fromBuyScreen");
                    // console.log("Data of fromBuyscreen", JSON.parse(fromBuyStatus));
                    // let newTab = null;
                    // if (fromBuyStatus) {
                    //     newTab = window.open('about:blank'); // Open a new blank tab
                    // }

                    const response = await axios.post(ApiPath, AddCardData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + AuthToken
                        }
                    });
                    if (response) {
                        console.log("Response of add card api is", response.data);
                    }
                    if (response.status === 200) {
                        // setAddCardDetails(response.data.message);
                        if (response.data.status === false) {
                            setAddCardFailure(true);
                            setAddCardErrtxt(response.data.message);
                            return
                        } else if (response.data.status === true) {
                            //console.log("Here in subscribe plan else", fromBuildAiScreen)
                            setAddCardSuccess(true);
                            handleSubscribePlan();
                            //console.log("Testing build screen data",);
                        }
                    } else {
                        setAddCardFailure(true);
                        setAddCardErrtxt("Some error occured !!!");
                    }
                } catch (error) {
                    console.error("Error occured in adding user card api is :", error);
                } finally {
                    setAddCardLoader(false);
                    // if (fromBuildAiScreen) {
                    //     console.log("reached end");
                    //     subscribeLoader(false);
                    // }
                }
            }
        })

    }

    //function to subscribe plan
    const handleSubscribePlan = async () => {
        try {

            let planType = null;

            // console.log("Selected plan is:", togglePlan);

            if (togglePlan === 1) {
                planType = "Plan30"
            } else if (togglePlan === 2) {
                planType = "Plan120"
            } else if (togglePlan === 3) {
                planType = "Plan360"
            } else if (togglePlan === 4) {
                planType = "Plan720"
            }

            console.log("Current plan is", planType)

            setAddCardLoader(true);
            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                AuthToken = LocalDetails.token;
            }

            console.log("Authtoken is", AuthToken);

            const ApiData = {
                plan: planType
            }

            console.log("Api data is", ApiData);

            const ApiPath = Apis.subscribePlan;
            console.log("Apipath is", ApiPath);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of subscribe plan api is", response);
                if (response.data.status === true) {
                    handleClose();
                    setAddPaymentSuccessPopUp(true);
                }
            }

        } catch (error) {
            console.error("Error occured in api is:", error);
        } finally {
            setAddCardLoader(false);
        }
    }

    const PayAsYouGoPlanTypes = {
        Plan30Min: "Plan30",
        Plan120Min: "Plan120",
        Plan360Min: "Plan360",
        Plan720Min: "Plan720",
    };



    return (
        <div style={{ width: '100%' }}>
            <div className='mt-8'>
                <div style={{ fontWeight: "400", fontFamily: "inter", fontSize: 13, color: "#4F5B76" }} onClick={() => { handleSubscribePlan() }}
                >
                    Card Number
                </div>
                <div className='mt-2 px-3 py-1' style={{ backgroundColor: "#EDEDEDC7", borderRadius: "8px" }}>
                    <CardNumberElement
                        options={elementOptions}
                        autoFocus={true}
                        onChange={(event) => handleFieldChange(event, cardExpiryRef)}
                        ref={cardNumberRef}
                        onReady={(element) => {
                            cardNumberRef.current = element
                            cardNumberRef.current.focus()
                        }}
                    />
                </div>
            </div>
            <div className='flex flex-row gap-2 w-full mt-8'>
                <div className='w-6/12'>
                    <div style={{ fontWeight: "400", fontFamily: "inter", fontSize: 13, color: "#4F5B76" }}>
                        Exp
                    </div>
                    <div className='mt-2 px-3 py-1' style={{ backgroundColor: "#EDEDEDC7", borderRadius: "8px" }}>
                        <CardExpiryElement
                            options={elementOptions}
                            style={{
                                width: '100%', padding: '8px',
                                color: 'white', fontSize: '22px', border: '1px solid blue', borderRadius: '4px'
                            }}
                            onChange={(event) => handleFieldChange(event, cardCvcRef)}
                            ref={cardExpiryRef}
                            onReady={(element) => {
                                cardExpiryRef.current = element
                            }}
                        />
                    </div>
                </div>
                <div className='w-6/12'>
                    <div style={{ fontWeight: "400", fontFamily: "inter", fontSize: 13, color: "#4F5B76" }}>
                        CVC
                    </div>
                    <div className='mt-2 px-3 py-1' style={{ backgroundColor: "#EDEDEDC7", borderRadius: "8px" }}>
                        <CardCvcElement
                            options={elementOptions}
                            style={{
                                width: '100%', padding: '8px',
                                color: 'white', fontSize: '22px', border: '1px solid blue', borderRadius: '4px'
                            }}
                            ref={cardCvcRef}
                            onReady={(element) => {
                                cardCvcRef.current = element
                            }}
                        />
                    </div>
                </div>
            </div>
            {/* <CardPostalCodeElement id="postal-code" options={elementOptions} /> */}
            <div className='w-full mt-6 flex justify-center'>
                {
                    addCardLoader ?
                        <div className='flex flex-row justify-center items-center mt-8 w-full'>
                            <CircularProgress size={30} />
                        </div> :
                        <div className='flex flex-row justify-end items-center mt-8 w-full'>
                            <button onClick={handleAddCard} className='bg-purple w-full h-[50px] rounded-xl px-8 text-white py-3' style={{ fontWeight: "600", fontSize: 17 }}>
                                Continue
                            </button>
                        </div>
                }
            </div>
            <div>
                <Snackbar
                    open={credentialsErr}
                    autoHideDuration={3000}
                    onClose={() => {
                        setCredentialsErr(false);
                        setAddCardLoader(false);
                    }}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    TransitionComponent={Fade}
                    TransitionProps={{
                        direction: 'center'
                    }}
                >
                    <Alert
                        onClose={() => {
                            setCredentialsErr(false);
                            setAddCardLoader(false);
                        }} severity="error"
                        sx={{ width: 'auto', fontWeight: '700', fontFamily: 'inter', fontSize: '22' }}>
                        Add a payment source to continue
                    </Alert>
                </Snackbar>
            </div>
            <div>
                <Snackbar
                    open={addCardFailure}
                    // autoHideDuration={3000}
                    onClose={() => {
                        setAddCardFailure(false)
                    }}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    TransitionComponent={Fade}
                    TransitionProps={{
                        direction: 'center'
                    }}
                >
                    <Alert
                        onClose={() => {
                            setAddCardFailure(false)
                        }} severity="error"
                        sx={{ width: 'auto', fontWeight: '700', fontFamily: 'inter', fontSize: '22' }}>
                        {/* {addCardDetails} */}
                        {/* Card not added */}
                        {addCardErrtxt}
                    </Alert>
                </Snackbar>
            </div>
            <div>
                <Snackbar
                    open={addCardSuccess}
                    autoHideDuration={3000}
                    onClose={() => {
                        setAddCardSuccess(false)
                    }}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    TransitionComponent={Fade}
                    TransitionProps={{
                        direction: 'center'
                    }}
                >
                    <Alert
                        onClose={() => {
                            setAddCardSuccess(false)
                        }} severity="success"
                        sx={{ width: 'auto', fontWeight: '700', fontFamily: 'inter', fontSize: '22' }}>
                        {/* {addCardDetails} */}
                        Card added successfully
                    </Alert>
                </Snackbar>
            </div>
        </div>
    )
}

export default AddCardDetails