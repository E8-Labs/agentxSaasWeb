import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import { CircularProgress, Modal } from '@mui/material';
import { Box, style } from '@mui/system';
import Apis from '@/components/apis/Apis';
import axios from 'axios';

const AddBuyerKyc = ({
    handleAddBuyerKycData,
    handleCloseSellerKyc,
    OpenBuyerMotivation, OpenBuyerUrgency,
    BuyerNeedData,
    BuyerMotivationData,
    BuyerUrgencyData, mainAgentId
}) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(1);
    const [addKYCQuestion, setAddKYCQuestion] = useState(false);
    const [inputs, setInputs] = useState([{ id: 1, value: '' }, { id: 2, value: '' }, { id: 3, value: '' }]);
    const [newQuestion, setNewQuestion] = useState('');
    const [buyerKycLoader, setBuyerKycLoader] = useState(false);
    //code for need kyc
    const [selectedNeedKYC, setSelectedNeedKYC] = useState([]);
    //code for motivation KYC
    const [selectedMotivationKyc, setSelectedMotivationKYC] = useState([]);
    //code for need kyc
    const [selectedUrgencyKyc, setSelectedUrgencyKyc] = useState([])

    //needKYCQuestions
    const [needKYCQuestions, setNeedKYCQuestions] = useState([
        {
            id: 1,
            question: "What area are you looking in?",
            category: "need",
            type: "buyer",
            sampleAnswers: []
        },
        {
            id: 2,
            question: "What type of home are you looking for? Single family, townhouse, condo, apartment, etc",
            category: "need",
            type: "buyer",
            sampleAnswers: []
        },
        {
            id: 3,
            question: "Are you a first time home buyer?",
            category: "need",
            type: "buyer",
            sampleAnswers: []
        },
    ]);

    const [motivationKycQuestions, setMotivationKycQuestions] = useState([
        {
            id: 1,
            question: "Why is now the right time?",
            category: "motivation",
            type: "buyer",
            sampleAnswers: []
        },
        {
            id: 2,
            question: "Are you looking to downsize or upsize?",
            category: "motivation",
            type: "buyer",
            sampleAnswers: []
        },
        {
            id: 3,
            question: "Are you relocating for work?",
            category: "motivation",
            type: "buyer",
            sampleAnswers: []
        },
    ]);

    const [urgencyKycQuestions, setUrgencyKycQuestions] = useState([
        {
            id: 1,
            question: "When do you expect to move into your new place?",
            category: "urgency",
            type: "buyer",
            sampleAnswers: []
        },
        {
            id: 2,
            question: "When do you plan on buying a home?",
            category: "urgency",
            type: "buyer",
            sampleAnswers: []
        },
        {
            id: 3,
            question: "When do you plan to move into your new home?",
            category: "urgency",
            type: "buyer",
            sampleAnswers: []
        },
    ]);


    useEffect(() => {

        // if (OpenSellerNeeds) {
        //     setToggleClick(1);
        // } else 
        if (OpenBuyerMotivation) {
            setToggleClick(2)
        } else if (OpenBuyerUrgency) {
            setToggleClick(3)
        } else {
            setToggleClick(1)
        }

        if (BuyerNeedData.length > 0) {
            console.log("Data passed is", BuyerNeedData)
            setNeedKYCQuestions((prevNeedKycs) => [
                ...prevNeedKycs.filter(
                    (existing) => !BuyerNeedData.some((newData) => existing.question === newData.question)
                ),
                ...BuyerNeedData
            ]);

            // Remove matching items from SelectedNeedKYC and add the new items
            setSelectedNeedKYC((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !BuyerNeedData.some((newData) => selectedItem.id === newData.id)
                ),
                ...BuyerNeedData.map((item) => ({ id: item.id, question: item.question }))
            ]);
        }
        if (BuyerMotivationData.length > 0) {
            console.log("Data passed is", BuyerNeedData)
            setMotivationKycQuestions((prevNeedKycs) => [
                ...prevNeedKycs.filter(
                    (existing) => !BuyerMotivationData.some((newData) => existing.question === newData.question)
                ),
                ...BuyerMotivationData
            ]);

            // Remove matching items from SelectedNeedKYC and add the new items
            setSelectedMotivationKYC((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !BuyerMotivationData.some((newData) => selectedItem.id === newData.id)
                ),
                ...BuyerMotivationData.map((item) => ({ id: item.id, question: item.question }))
            ]);
        }
        if (BuyerUrgencyData.length > 0) {
            console.log("Data passed is", BuyerNeedData)
            setUrgencyKycQuestions((prevNeedKycs) => [
                ...prevNeedKycs.filter(
                    (existing) => !BuyerUrgencyData.some((newData) => existing.question === newData.question)
                ),
                ...BuyerUrgencyData
            ]);

            // Remove matching items from SelectedNeedKYC and add the new items
            setSelectedUrgencyKyc((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !BuyerUrgencyData.some((newData) => selectedItem.id === newData.id)
                ),
                ...BuyerUrgencyData.map((item) => ({ id: item.id, question: item.question }))
            ]);
        }
    }, []);

    //code to add kycQuestion in array
    // const handleAddKycQuestion = () => {
    //     const sampleAnswers = inputs.map(input => input.value);
    //     const newKYCQuestion = {
    //         id: needKYCQuestions.length + 1,
    //         question: newQuestion,
    //         sampleAnswers: sampleAnswers
    //     };
    //     if (toggleClick === 1) {
    //         setNeedKYCQuestions([...needKYCQuestions, newKYCQuestion]);
    //     } else if (toggleClick === 2) {
    //         setMotivationKycQuestions([...needKYCQuestions, newKYCQuestion]);
    //     } else if (toggleClick === 3) {
    //         setUrgencyKycQuestions([...needKYCQuestions, newKYCQuestion]);
    //     }
    //     setAddKYCQuestion(false);
    //     setNewQuestion(''); // Reset the new question field
    //     setInputs([{ id: 1, value: '' }]); // Reset the inputs
    // };
    const handleAddKycQuestion = () => {
        const sampleAnswers = inputs.map(input => input.value);
        const newKYCQuestion = {
            id: needKYCQuestions.length + 1,
            question: newQuestion,
            sampleAnswers: sampleAnswers
        };

        if (toggleClick === 1) {
            // Add to the "Needs" questions and auto-select the new question
            setNeedKYCQuestions(prevQuestions => {
                const updatedQuestions = [...prevQuestions, { ...newKYCQuestion, type: "buyer", category: "need" }];
                setSelectedNeedKYC(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
                return updatedQuestions;
            });
        } else if (toggleClick === 2) {
            setMotivationKycQuestions(prevQuestions => {
                const updatedQuestions = [...prevQuestions, { ...newKYCQuestion, type: "buyer", category: "motivation" }];
                setSelectedMotivationKYC(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
                return updatedQuestions;
            });
        } else if (toggleClick === 3) {
            setUrgencyKycQuestions(prevQuestions => {
                const updatedQuestions = [...prevQuestions, { ...newKYCQuestion, type: "buyer", category: "urgency" }];
                setSelectedUrgencyKyc(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
                return updatedQuestions;
            });
        }

        setAddKYCQuestion(false);
        setNewQuestion(''); // Reset the new question field
        setInputs([{ id: 1, value: '' }, { id: 2, value: '' }, { id: 3, value: '' }]); // Reset the inputs
    };

    // Handle change in input field
    const handleInputChange = (id, value) => {
        setInputs(inputs.map(input => (input.id === id ? { ...input, value } : input)));
    };

    // Handle deletion of input field
    const handleDelete = (id) => {
        setInputs(inputs.filter(input => input.id !== id));
    };

    // Handle adding a new input field
    const handleAddInput = () => {
        const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1;
        setInputs([...inputs, { id: newId, value: '' }]);
    };

    const handleToggleClick = (id) => {
        setToggleClick(prevId => (prevId === id ? null : id))
    }

    //code to select question
    const handleSelectNeedKYC = (item) => {
        setSelectedNeedKYC((prevSelected) =>
            prevSelected.some((selectedItem) => selectedItem.id === item.id)
                ? prevSelected.filter((selectedItem) => selectedItem.id !== item.id) // Deselect
                : [...prevSelected, { id: item.id, question: item.question }] // Select
        );
    };

    const handleSelectMotivationKYC = (item) => {
        setSelectedMotivationKYC((prevSelected) =>
            prevSelected.some((selectedItem) => selectedItem.id === item.id)
                ? prevSelected.filter((selectedItem) => selectedItem.id !== item.id) // Deselect
                : [...prevSelected, { id: item.id, question: item.question }] // Select
        );
    };

    const handleUrgencyKYC = (item) => {
        setSelectedUrgencyKyc((prevSelected) =>
            prevSelected.some((selectedItem) => selectedItem.id === item.id)
                ? prevSelected.filter((selectedItem) => selectedItem.id !== item.id) // Deselect
                : [...prevSelected, { id: item.id, question: item.question }] // Select
        );
    }

    const handleAddKyc = () => {
        setAddKYCQuestion(true);
    }

    //close add kyc question modal
    const handleClose = () => {
        setInputs([{ id: 1, value: '' }, { id: 2, value: '' }, { id: 3, value: '' }]);
        setAddKYCQuestion(false);
        setNewQuestion("");
    }

    const handleAddNewKyc = async () => {
        // Get only the selected questions
        const selectedNeedQuestions = needKYCQuestions.filter((question) =>
            selectedNeedKYC.some((selectedItem) => selectedItem.id === question.id)
        );

        const selectedMotivationQuestions = motivationKycQuestions.filter((question) =>
            selectedMotivationKyc.some((selectedItem) => selectedItem.id === question.id)
        );

        const selectedUrgencyQuestions = urgencyKycQuestions.filter((question) =>
            selectedUrgencyKyc.some((selectedItem) => selectedItem.id === question.id)
        );

        console.log("Working");
        // console.log("Selected Questions are: ", selectedNeedQuestions);
        // console.log("Selected motivation questions are: ----", selectedMotivationQuestions);
        // console.log("Selected urgency questions are: ----", selectedUrgencyQuestions);
        // router.push("/pipeline");
        // handleContinue();

        //code for buyer kyc api
        setBuyerKycLoader(true);

        try {
            let AuthToken = null;
            const LocalData = localStorage.getItem("User");
            const agentDetails = localStorage.getItem("agentDetails");
            let MyAgentData = null;
            if (LocalData) {
                const UserDetails = JSON.parse(LocalData);
                AuthToken = UserDetails.token;
            }

            let AgentId = null

            if (mainAgentId) {
                AgentId = mainAgentId
            } else {
                AgentId = MyAgentData.id
            }

            if (agentDetails) {
                console.log("trying")
                const agentData = JSON.parse(agentDetails);
                console.log("ActualAgent details are :--", agentData);
                MyAgentData = agentData;

            }

            const ApiPath = Apis.updateKYC;
            let ApiData = [];

            // if (selectedNeedQuestions.length > 0) {
            //     // console.log("#need Question details are :", selectedNeedQuestions);
            //     const data = {
            //         kycQuestions: selectedNeedQuestions.map(item => ({
            //             question: item.question,
            //             category: "need",
            //             type: "buyer",
            //             examples: item.sampleAnswers.filter(answer => answer)
            //         })),
            //         mainAgentId: MyAgentData.id
            //     };
            //     // console.log("Data to send in api is", data);
            //     ApiData = data;
            // } else if (selectedMotivationQuestions.length > 0) {
            //     console.log("#motivation Question details are :", selectedMotivationQuestions);
            //     const data = {
            //         kycQuestions: selectedMotivationQuestions.map(item => ({
            //             question: item.question,
            //             category: "motivation",
            //             type: "buyer",
            //             examples: item.sampleAnswers.filter(answer => answer)
            //         })),
            //         mainAgentId: MyAgentData.id
            //     };
            //     // console.log("Data to send in api is", data);
            //     ApiData = data;
            // } else if (selectedUrgencyQuestions.length > 0) {
            //     console.log("#urgency Question details are :", selectedUrgencyQuestions);
            //     const data = {
            //         kycQuestions: selectedUrgencyQuestions.map(item => ({
            //             question: item.question,
            //             category: "urgency",
            //             type: "buyer",
            //             examples: item.sampleAnswers.filter(answer => answer)
            //         })),
            //         mainAgentId: MyAgentData.id
            //     };
            //     // console.log("Data to send in api is", data);
            //     ApiData = data;
            // }

            let updatedKycs = [...selectedMotivationQuestions, ...selectedNeedQuestions, ...selectedUrgencyQuestions]

            // let kycs = allKYCs.filter((item) => item.category != "motivation")
            // kycs = [...kycs, ...updatedKycs]

            const data = {
                kycQuestions: updatedKycs.map(item => ({
                    question: item.question,
                    category: item.category,
                    type: item.type,
                    examples: item?.sampleAnswers?.filter(answer => answer)
                })),
                type: "buyer",
                mainAgentId: AgentId
            };
            console.log("Data to send in api is", data);

            ApiData = data;

            console.log("APi data is :--", ApiData);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of add KYC api is :--", response.data);
                if (response.data.status === true) {
                    // router.push("/pipeline")
                    handleCloseSellerKyc();
                    handleAddBuyerKycData(response.data.data);
                }
            }

        } catch (error) {
            console.error("Error occured in api is :--", error);
        } finally {
            setBuyerKycLoader(false);
        }

    }


    const KYCQuestionType = [
        {
            id: 1,
            title: "Needs"
        },
        {
            id: 2,
            title: "Motivation"
        },
        {
            id: 3,
            title: "Urgency"
        },
    ]

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "700"
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "600"
        },
        AddNewKYCQuestionModal: {
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
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='rounded-lg w-10/12 h-[90%] flex flex-col justify-between'>
                <div className='h-[60vh] py-4 overflow-auto' style={{ scrollbarWidth: "none" }}>
                    {/* header */}
                    {/* <Header /> */}
                    <Image src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            What would you like to ask buyers?
                        </div>
                        <button
                            className='mt-10 underline text-purple'
                            style={styles.inputStyle}
                            onClick={handleCloseSellerKyc}
                        >
                            {`I don't need questions for buyers`}
                        </button>
                        <div className='flex flex-row items-center gap-10 mt-10'>
                            {
                                KYCQuestionType.map((item, index) => (
                                    <button key={item.id} style={{ ...styles.inputStyle, color: item.id === toggleClick ? "#7902DF" : "" }} onClick={(e) => { handleToggleClick(item.id) }}>
                                        {item.title}
                                    </button>
                                ))
                            }
                        </div>
                        <div>
                            {
                                toggleClick === 1 ?
                                    (
                                        <Image src={"/assets/needKYC.png"} height={5} width={303} alt='*' />
                                    ) :
                                    toggleClick === 2 ?
                                        (
                                            <Image src={"/assets/motivationKyc.png"} height={5} width={303} alt='*' />
                                        ) :
                                        toggleClick === 3 ?
                                            (
                                                <Image src={"/assets/urgencyKyc.png"} height={8} width={310} alt='*' />
                                            ) : ""
                            }
                        </div>


                        {
                            toggleClick === 1 ?
                                (
                                    <div className='mt-8 w-10/12 md:w-8/12  lg:w-6/12 max-h-[37vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                                        {
                                            needKYCQuestions.map((item, index) => (
                                                <button
                                                    className='mb-4 border rounded-xl flex flex-row items-center justify-between px-4 sm:h-[10vh] w-full'
                                                    style={{
                                                        border: selectedNeedKYC.some(selectedItem => selectedItem.id === item.id) ? "2px solid #7902DF" : "",
                                                        backgroundColor: selectedNeedKYC.some(selectedItem => selectedItem.id === item.id) ? "#402FFF15" : ""
                                                    }}
                                                    key={index}
                                                    onClick={() => handleSelectNeedKYC(item)}
                                                >
                                                    <div style={{ width: "90%" }} className='text-start'>
                                                        {item.question}
                                                    </div>
                                                    <div className='outline-none border-none' style={{ width: "10%" }}>
                                                        {
                                                            selectedNeedKYC.some(selectedItem => selectedItem.id === item.id)
                                                                ? <Image src={"/assets/charmTick.png"} height={35} width={35} alt='*' />
                                                                : <Image src={"/assets/charmUnMark.png"} height={35} width={35} alt='*' />
                                                        }
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                ) :
                                toggleClick === 2 ?
                                    (
                                        <div className='mt-8 w-10/12 md:w-8/12  lg:w-6/12 max-h-[37vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                                            {
                                                motivationKycQuestions.map((item, index) => (
                                                    <button
                                                        className='mb-4 border rounded-xl flex flex-row items-center justify-between px-4 sm:h-[10vh] w-full'
                                                        key={index}
                                                        onClick={() => handleSelectMotivationKYC(item)}
                                                        style={{
                                                            border: selectedMotivationKyc.some(selectedItem => selectedItem.id === item.id) ? "2px solid #7902DF" : "",
                                                            backgroundColor: selectedMotivationKyc.some(selectedItem => selectedItem.id === item.id) ? "#402FFF15" : "",
                                                        }}>
                                                        <div style={{ width: "90%" }} className='text-start'>
                                                            {item.question}
                                                        </div>
                                                        <div className='outline-none border-none' style={{ width: "10%" }}>
                                                            {
                                                                selectedMotivationKyc.some(selectedItem => selectedItem.id === item.id)
                                                                    ? <Image src={"/assets/charmTick.png"} height={35} width={35} alt='*' />
                                                                    : <Image src={"/assets/charmUnMark.png"} height={35} width={35} alt='*' />
                                                            }
                                                        </div>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    ) :
                                    toggleClick === 3 ?
                                        (
                                            <div className='mt-8 w-10/12 md:w-8/12  lg:w-6/12 max-h-[37vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                                                {
                                                    urgencyKycQuestions.map((item, index) => (
                                                        <button
                                                            className='mb-4 border rounded-xl flex flex-row items-center justify-between px-4 sm:h-[10vh] w-full' key={index}
                                                            onClick={() => handleUrgencyKYC(item)}
                                                            style={{
                                                                border: selectedUrgencyKyc.some(selectedItem => selectedItem.id === item.id) ? "2px solid #7902DF" : "",
                                                                backgroundColor: selectedUrgencyKyc.some(selectedItem => selectedItem.id === item.id) ? "#402FFF15" : "",
                                                            }}>
                                                            <div style={{ width: "90%" }} className='text-start'>
                                                                {item.question}
                                                            </div>
                                                            <div className='outline-none border-none' style={{ width: "10%" }}>
                                                                {
                                                                    selectedUrgencyKyc.some(selectedItem => selectedItem.id === item.id)
                                                                        ? <Image src={"/assets/charmTick.png"} height={35} width={35} alt='*' />
                                                                        : <Image src={"/assets/charmUnMark.png"} height={35} width={35} alt='*' />
                                                                }
                                                            </div>
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        ) : ""
                        }


                        {/* <div className='mt-8 w-10/12 md:w-6/12 max-h-[37vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
                            {needKYCQuestions.map((item, index) => (
                                <div className='mb-4 border rounded-xl flex flex-row items-center justify-between px-4 sm:h-[10vh]' key={index}>
                                    <div style={{ width: "90%" }}>{item.question}</div>
                                    <button className='outline-none border-none' onClick={() => handleSelectNeedKYC(item)} style={{ width: "10%" }}>
                                        {
                                            selectedNeedKYC.some(selectedItem => selectedItem.id === item.id)
                                                ? <Image src={"/assets/charmTick.png"} height={35} width={35} alt='*' />
                                                : <Image src={"/assets/charmUnMark.png"} height={35} width={35} alt='*' />
                                        }
                                    </button>
                                </div>
                            ))}
                        </div> */}

                        <button className='mt-2 w-10/12 md:w-8/12  lg:w-6/12 outline-none border-none justify-start flex max-h-[37vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple text-purple' style={{ fontWeight: "700", fontSize: 15 }} onClick={handleAddKyc}>
                            Add Question
                        </button>
                        {/* Modal */}
                        <Modal
                            open={addKYCQuestion}
                            // onClose={() => setAddKYCQuestion(false)}
                            closeAfterTransition
                            BackdropProps={{
                                timeout: 1000,
                                sx: {
                                    backgroundColor: "#00000020",
                                    // //backdropFilter: "blur(20px)",
                                },
                            }}
                        >
                            <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.AddNewKYCQuestionModal}>
                                <div className="flex flex-row justify-center w-full">
                                    <div
                                        className="sm:w-9/12 w-full"
                                        style={{
                                            backgroundColor: "#ffffff",
                                            padding: 20,
                                            borderRadius: "13px",
                                        }}
                                    >
                                        <div className='flex flex-row justify-end'>
                                            <button onClick={handleClose}>
                                                <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                            </button>
                                        </div>
                                        <div className='text-center mt-2' style={{ fontWeight: "700", fontSize: 24 }}>
                                            New Question
                                        </div>
                                        <div className='text-[#00000060] mx-2' style={{ fontWeight: "600", fontSize: 13 }}>
                                            {`What’s the question? `}
                                        </div>
                                        <div className='mt-2'>
                                            <input
                                                className='border outline-none w-full p-2 rounded-lg px-3 mx-2 focus:outline-none focus:ring-0'
                                                style={{ borderColor: "#00000020", fontWeight: "500", fontSize: 15 }}
                                                placeholder="Ex: What's your name?"
                                                value={newQuestion}
                                                onChange={(e) => setNewQuestion(e.target.value)}
                                            />
                                        </div>
                                        <div className='mt-4 mx-2' style={styles.headingStyle}>
                                            Sample Answers
                                        </div>

                                        <div className='max-h-[30vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
                                            {inputs.map((input, index) => (
                                                <div key={input.id} className='w-full flex flex-row items-center gap-4 mt-4'>
                                                    <input
                                                        className='border p-2 rounded-lg px-3 outline-none mx-2 focus:outline-none focus:ring-0'
                                                        style={{ width: "95%", borderColor: "#00000020", fontWeight: "500", fontSize: 15 }}
                                                        placeholder={`Sample Answer`}
                                                        value={input.value}
                                                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                                                    />
                                                    {/* <button className='outline-none border-none' style={{ width: "5%" }} onClick={() => handleDelete(input.id)}>
                                                        <Image src={"/assets/blackBgCross.png"} height={15} width={15} alt='*' />
                                                    </button> */}
                                                </div>
                                            ))}
                                        </div>

                                        {/* <div style={{ height: "50px" }}>
                                            {
                                                inputs.length < 3 && (
                                                    <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-purple rounded-lg underline' style={{
                                                        fontSize: 15,
                                                        fontWeight: "700"
                                                    }}>
                                                        Add New
                                                    </button>
                                                )
                                            }
                                        </div> */}

                                        <div className='w-full h-[80px]'>
                                            {
                                                inputs.filter(input => input.value.trim()).length === 3 && newQuestion ? (
                                                    <button className='bg-purple outline-none border-none rounded-lg text-white w-full mt-4 mx-2' style={{ ...styles.headingStyle, height: "50px" }} onClick={handleAddKycQuestion}>
                                                        Add Question
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled={true}
                                                        className='bg-[#00000060] outline-none border-none rounded-lg text-white w-full mt-4 mx-2'
                                                        style={{ ...styles.headingStyle, height: "50px" }}
                                                        onClick={handleAddKycQuestion}>
                                                        Add Question
                                                    </button>
                                                )
                                            }
                                        </div>

                                        {/* Can be use full to add shadow */}
                                        {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                    </div>
                                </div>
                            </Box>
                        </Modal>
                    </div>
                </div>
                <div className='mt-8 w-full flex flex-row justify-center'>
                    {
                        buyerKycLoader ?
                            <div className='flex flex-row justify-center w-full'>
                                <CircularProgress size={30} />
                            </div>
                            :
                            <button
                                className='w-10/12 md:w-8/12  lg:w-6/12 h-[50px] rounded-lg bg-purple text-white'
                                style={styles.headingStyle}
                                onClick={handleAddNewKyc}>
                                Save & Close
                            </button>
                    }
                </div>
                {/* <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleNextclick} donotShowBack={true} registerLoader={buyerKycLoader} />
                </div> */}
            </div>
        </div>
    )
}

export default AddBuyerKyc;
