import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import { Alert, CircularProgress, Fade, Modal, Snackbar } from '@mui/material';
import { Box, style } from '@mui/system';
import Apis from '../apis/Apis';
import axios from 'axios';
import AgentSelectSnackMessage from '../dashboard/leads/AgentSelectSnackMessage';

const AddSellerKyc = ({
    handleCloseSellerKyc,
    handleAddSellerKycData,
    OpenSelerMotivation, OpenSellerNeeds,
    OpenSellerUrgency, SellerNeedData,
    hideTitle,
    SellerMotivationData,
    SellerUrgencyData, mainAgentId, allKYCs
}) => {

    // console.log("Satus of passed is", allKYCs)

    const router = useRouter();

    const [shouldSave, setShouldSave] = useState(false)

    const [toggleClick, setToggleClick] = useState(1);
    const [addKYCQuestion, setAddKYCQuestion] = useState(false);
    const [inputs, setInputs] = useState([{ id: 1, value: '' }, { id: 2, value: '' }, { id: 3, value: '' }]);
    const [newQuestion, setNewQuestion] = useState('');
    //code for need kyc
    const [selectedNeedKYC, setSelectedNeedKYC] = useState([]);
    const [oldSelectedNeedKYC, setOldSelectedNeedKYC] = useState([]);
    console.log("Old kycs length", SellerNeedData)
    console.log("new kycs length", selectedNeedKYC)
    //code for motivation KYC
    const [selectedMotivationKyc, setSelectedMotivationKYC] = useState([]);
    const [oldSelectedMotivationKyc, setOldSelectedMotivationKYC] = useState([]);
    //code for need kyc
    const [selectedUrgencyKyc, setSelectedUrgencyKyc] = useState([]);
    const [oldSelectedUrgencyKyc, setOldSelectedUrgencyKyc] = useState([]);
    const [sellerKycLoader, setSellerKycLoader] = useState(false);

    //alert
    const [showErrorSnack, setShowErrorSnack] = useState(false);


    //needKYCQuestions
    const [needKYCQuestions, setNeedKYCQuestions] = useState([
        {
            id: 1,
            question: "Why have you decided to sell your home?",
            category: "need",
            type: "seller",
            sampleAnswers: []
        },
        // {
        //     id: 2,
        //     question: "Have you outgrown your current home, or is it too large now?",
        //     sampleAnswers: []
        // },
        {
            id: 2,
            question: "Are there any significant life changes prompting this decision, such as job relocation or changes in the family?",
            category: "need",
            type: "seller",
            sampleAnswers: []
        },
    ]);

    const [motivationKycQuestions, setMotivationKycQuestions] = useState([
        {
            id: 1,
            question: "What's your primary motivation for selling now rather than waiting?", //Why is now the right time?
            category: "motivation",
            type: "seller",
            sampleAnswers: []
        },
        {
            id: 2,
            question: "How important is the selling price to you versus the speed of the sale?", //Are you looking to downsize or upsize?
            category: "motivation",
            type: "seller",
            sampleAnswers: []
        },
        {
            id: 3,
            question: "Are there any specific factors that would influence your decision to accept an offer or reject it?", //Are you relocating for work?
            category: "motivation",
            type: "seller",
            sampleAnswers: []
        },
    ]);

    const [urgencyKycQuestions, setUrgencyKycQuestions] = useState([
        {
            id: 1,
            question: "When do you hope to have your home sold?", //When do you expect to move into your new place?
            category: "urgency",
            type: "seller",
            sampleAnswers: []
        },
        {
            id: 2,
            question: "Are there any specific events or dates driving this timeline (e.g., starting a new job, school for kids, purchasing another property)?", //When do you plan on buying a home?
            category: "urgency",
            type: "seller",
            sampleAnswers: []
        },
        {
            id: 3,
            question: "How would it impact you if the sale took longer than anticipated?", //When do you plan to move into your new home?
            category: "urgency",
            type: "seller",
            sampleAnswers: []
        },
    ]);


    //check for the save and continue btn
    useEffect(() => {
        console.log("Should check btn status")
        if (oldSelectedNeedKYC.length !== selectedNeedKYC.length || selectedMotivationKyc.length !== oldSelectedMotivationKyc.length || selectedUrgencyKyc.length !== oldSelectedUrgencyKyc.length) {
            console.log("Should show save btn")
            setShouldSave(true);
        } else if (oldSelectedNeedKYC.length === selectedNeedKYC.length || selectedMotivationKyc.length !== oldSelectedMotivationKyc.length || selectedUrgencyKyc.length !== oldSelectedUrgencyKyc.length) {
            console.log("Should not show save btn")
            setShouldSave(false);
        }
    }, [oldSelectedNeedKYC, selectedNeedKYC, selectedMotivationKyc, oldSelectedMotivationKyc, selectedUrgencyKyc, oldSelectedUrgencyKyc])


    //directly open the desired tab
    useEffect(() => {
        // if (OpenSellerNeeds === true) {


        // setNeedKYCQuestions((prevNeedKycs) => [
        //     ...prevNeedKycs.filter(
        //         (existing) => !SellerNeedData.some((newData) => existing.question === newData.question)
        //     ),
        //     ...SellerNeedData
        // ]);


        // setSelectedMotivationKYC(prevSelected => [
        //     ...prevSelected.filter(
        //         (existing) => !SellerMotivationData.some((newData) => existing.question === newData.question)
        //     ),
        //     ...SellerMotivationData
        // ]);

        if (OpenSellerNeeds) {
            setToggleClick(1);
        } else if (OpenSelerMotivation) {
            setToggleClick(2)
        } else if (OpenSellerUrgency) {
            setToggleClick(3)
        }

        if (SellerNeedData.length > 0) {
            console.log("Data passed is", SellerNeedData)
            setNeedKYCQuestions((prevNeedKycs) => [
                ...prevNeedKycs.filter(
                    (existing) => !SellerNeedData.some((newData) => existing.question === newData.question)
                ),
                ...SellerNeedData
            ]);

            // Remove matching items from SelectedNeedKYC and add the new items
            setSelectedNeedKYC((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !SellerNeedData.some((newData) => selectedItem.id === newData.id)
                ),
                ...SellerNeedData.map((item) => ({ id: item.id, question: item.question }))
            ]);

            setOldSelectedNeedKYC((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !SellerNeedData.some((newData) => selectedItem.id === newData.id)
                ),
                ...SellerNeedData.map((item) => ({ id: item.id, question: item.question }))
            ]);
        }
        if (SellerMotivationData.length > 0) {
            console.log("Data passed is", SellerNeedData)
            setMotivationKycQuestions((prevNeedKycs) => [
                ...prevNeedKycs.filter(
                    (existing) => !SellerMotivationData.some((newData) => existing.question === newData.question)
                ),
                ...SellerMotivationData
            ]);

            // Remove matching items from SelectedNeedKYC and add the new items
            setSelectedMotivationKYC((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !SellerMotivationData.some((newData) => selectedItem.id === newData.id)
                ),
                ...SellerMotivationData.map((item) => ({ id: item.id, question: item.question }))
            ]);

            setOldSelectedMotivationKYC((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !SellerMotivationData.some((newData) => selectedItem.id === newData.id)
                ),
                ...SellerMotivationData.map((item) => ({ id: item.id, question: item.question }))
            ]);
        }
        if (SellerUrgencyData.length > 0) {
            console.log("Data passed is", SellerNeedData)
            setUrgencyKycQuestions((prevNeedKycs) => [
                ...prevNeedKycs.filter(
                    (existing) => !SellerUrgencyData.some((newData) => existing.question === newData.question)
                ),
                ...SellerUrgencyData
            ]);

            // Remove matching items from SelectedNeedKYC and add the new items
            setSelectedUrgencyKyc((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !SellerUrgencyData.some((newData) => selectedItem.id === newData.id)
                ),
                ...SellerUrgencyData.map((item) => ({ id: item.id, question: item.question }))
            ]);

            setOldSelectedUrgencyKyc((prevSelected) => [
                ...prevSelected.filter(
                    (selectedItem) => !SellerUrgencyData.some((newData) => selectedItem.id === newData.id)
                ),
                ...SellerUrgencyData.map((item) => ({ id: item.id, question: item.question }))
            ]);
        }
        // } 

    }, [])



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

    //function to add kyc
    const handleAddKycQuestion = () => {
        const sampleAnswers = inputs.map(input => input.value);
        const newKYCQuestion = {
            id: needKYCQuestions.length + 1,
            question: newQuestion,
            sampleAnswers: sampleAnswers
        };

        if (toggleClick === 1) {
            // Add to the "Needs" questions and auto-select the new question
            // setNeedKYCQuestions(prevQuestions => {
            //     const updatedQuestions = [...prevQuestions, newKYCQuestion];
            //     setSelectedNeedKYC(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
            //     return updatedQuestions;
            // });
            if (needKYCQuestions.some((item) => item.question.toLowerCase() === newKYCQuestion.question.toLowerCase())) {
                setShowErrorSnack("Question already exists!!!");
                console.log("Question Already exists");
                return
            } else {
                // console.log("New question");
                setNeedKYCQuestions(prevQuestions => {
                    const updatedQuestions = [...prevQuestions, { ...newKYCQuestion, type: "seller", category: "need" }];
                    setSelectedNeedKYC(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
                    return updatedQuestions;
                });
            }
        } else if (toggleClick === 2) {
            // setMotivationKycQuestions(prevQuestions => {
            //     const updatedQuestions = [...prevQuestions, newKYCQuestion];
            //     setSelectedMotivationKYC(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
            //     return updatedQuestions;
            // });

            if (motivationKycQuestions.some((item) => item.question.toLowerCase() === newKYCQuestion.question.toLowerCase())) {
                setShowErrorSnack("Question already exists!!!");
                console.log("Question Already exists");
                return
            } else {
                setMotivationKycQuestions(prevQuestions => {
                    const updatedQuestions = [...prevQuestions, { ...newKYCQuestion, type: "seller", category: "motivation" }];
                    setSelectedMotivationKYC(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
                    return updatedQuestions;
                });
            }

        } else if (toggleClick === 3) {
            // setUrgencyKycQuestions(prevQuestions => {
            //     const updatedQuestions = [...prevQuestions, newKYCQuestion];
            //     setSelectedUrgencyKyc(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
            //     return updatedQuestions;
            // });
            if (urgencyKycQuestions.some((item) => item.question.toLowerCase() === newKYCQuestion.question.toLowerCase())) {
                setShowErrorSnack("Question already exists!!!");
                console.log("Question Already exists");
                return
            } else {
                setUrgencyKycQuestions(prevQuestions => {
                    const updatedQuestions = [...prevQuestions, { ...newKYCQuestion, type: "seller", category: "urgency" }];
                    setSelectedUrgencyKyc(prevSelected => [...prevSelected, { id: newKYCQuestion.id, question: newKYCQuestion.question }]);
                    return updatedQuestions;
                });
            }
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
        console.log("Id passed is", id)
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
        setNewQuestion("");
        setAddKYCQuestion(false);
    }

    //api call to add kyc
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

        // console.log("Selected Questions are: ", selectedNeedQuestions);
        // console.log("Selected motivation questions are: ----", selectedMotivationQuestions);
        // console.log("Selected urgency questions are: ----", selectedUrgencyQuestions);
        // router.push("/buyerskycquestions")
        // handleContinue();

        //code for api call
        console.log("Check 1 claer")
        setSellerKycLoader(true);

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



            if (agentDetails) {
                console.log("trying")
                const agentData = JSON.parse(agentDetails);
                console.log("ActualAgent details are :--", agentData);
                MyAgentData = agentData;
            }

            const ApiPath = Apis.updateKYC;
            let ApiData = [];

            if (mainAgentId) {
                AgentId = mainAgentId
            } else {
                AgentId = MyAgentData.id
            }

            // if (selectedNeedQuestions.length > 0) {
            // let newArray = selectedNeedQuestions.map((item) => item);

            // const updatedArray = selectedNeedQuestions.filter(
            //     (item) => newArray.includes(item)
            // );

            // //array to send in api
            // const mergedArray = [
            //     ...newArray,
            //     ...updatedArray.filter(
            //         (item2) => !newArray.some((item1) => item1 === item2)
            //     )
            // ];

            let newArray = [];

            console.log("Alll kycs are", allKYCs);


            for (let i = 0; i < allKYCs.length; i++) {
                const itemA = allKYCs[i];
                let existsInArrayB = false;
                for (let j = 0; j < selectedNeedQuestions.length; j++) {
                    if (itemA.question === selectedNeedQuestions[j].question) {
                        existsInArrayB = true;
                        break;
                    }
                }
                if (existsInArrayB) {
                    newArray.push(itemA);
                }
            }

            for (let i = 0; i < selectedNeedQuestions.length; i++) {
                const itemB = selectedNeedQuestions[i];
                let existsInArrayA = false;
                for (let j = 0; j < allKYCs.length; j++) {
                    if (itemB.question === allKYCs[j].question) {
                        existsInArrayA = true;
                        break;
                    }
                }
                if (!existsInArrayA) {
                    newArray.push(itemB);
                }
            }

            console.log("Final array is", newArray);


            // let kycs = allKYCs.filter((item) => item.category != "motivation")
            // kycs = [...kycs, ...selectedMotivationQuestions]

            // let categoryType = ""
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
                type: "seller",
                mainAgentId: AgentId
            };
            console.log("Data to send in api is", data);
            // return
            ApiData = data;
            // } else if (selectedMotivationQuestions.length > 0) {
            // console.log("Contains only Previous sent kycs", SellerMotivationData);
            // console.log("Contains only selected kycs :", selectedMotivationQuestions);

            //array contains new selected kycs
            // let newArray = selectedMotivationQuestions.map((item) => item);

            // const updatedArray = SellerMotivationData.filter((item) => newArray.includes(item.question));
            // const updatedArray = SellerMotivationData.filter(
            //     (item) => newArray.includes(item)
            // );

            //array to send in api
            // const mergedArray = [
            //     ...newArray,
            //     ...updatedArray.filter(
            //         (item2) => !newArray.some((item1) => item1 === item2)
            //     )
            // ];

            // const newArray1 = selectedMotivationQuestions.filter(itemB => {
            //     // Check if `itemB.question` exists in arrayA
            //     const isInArrayA = allKYCs.some(itemA => itemA.question === itemB.question);

            //     // Keep the item if it's in arrayA or not in arrayA
            //     return isInArrayA || !allKYCs.some(itemA => itemA.question === itemB.question);
            // });

            // allKYCs.forEach(itemA => {
            //     const isInArrayB = selectedMotivationQuestions.some(itemB => itemB.question === itemA.question);
            //     console.log(`ItemA: ${itemA.question}, IsInArrayB: ${isInArrayB}`);
            // });

            // const newArray = allKYCs.filter(itemA => {
            //     // Check if `itemA.question` exists in arrayB
            //     const isInArrayB = selectedMotivationQuestions.some(itemB => itemB.question === itemA.question);
            //     console.log("Is in all kycs array", isInArrayB);
            //     // Keep the item if it's in arrayB
            //     return isInArrayB;
            // }).concat(
            //     selectedMotivationQuestions.filter(itemB => {
            //         // Check if `itemB.question` exists in arrayA
            //         const isInArrayA = allKYCs.some(itemA => itemA.question === itemB.question);

            //         // Keep the item if it's not in arrayA
            //         return !isInArrayA;
            //     })
            // );

            // let newArray = [];

            // console.log("Alll kycs are", allKYCs);

            // Same logic as above
            // let kycs = allKYCs.filter((item) => item.category != "motivation")
            // kycs = [...kycs, ...selectedMotivationQuestions]

            // console.log("New kycs ")
            // console.log(kycs)
            // return
            // for (let i = 0; i < allKYCs.length; i++) {
            //     const itemA = allKYCs[i];
            //     let existsInArrayB = false;
            //     for (let j = 0; j < selectedMotivationQuestions.length; j++) {
            //         if (itemA.question === selectedMotivationQuestions[j].question) {
            //             existsInArrayB = true;
            //             break;
            //         }
            //     }
            //     if (existsInArrayB) {
            //         newArray.push(itemA);
            //     }
            // }

            // for (let i = 0; i < selectedMotivationQuestions.length; i++) {
            //     const itemB = selectedMotivationQuestions[i];
            //     let existsInArrayA = false;
            //     for (let j = 0; j < allKYCs.length; j++) {
            //         if (itemB.question === allKYCs[j].question) {
            //             existsInArrayA = true;
            //             break;
            //         }
            //     }
            //     if (!existsInArrayA) {
            //         newArray.push(itemB);
            //     }
            // }

            console.log("Final array is", newArray);

            // console.log(newArray);

            // console.log("Final array is", newArray);

            // return
            // allKYCs.push(...selectedMotivationQuestions)
            // console.log("Array to send in api is", allKYCs);
            // const data = {
            //     kycQuestions: newArray.map(item => ({
            //         question: item.question,
            //         category: "motivation",
            //         type: "seller",
            //         examples: item?.sampleAnswers?.filter(answer => answer)
            //     })),
            //     mainAgentId: AgentId
            // };
            // console.log("Data to send in api is", data);
            // ApiData = data;
            // } else if (selectedUrgencyQuestions.length > 0) {

            // let newArray = selectedUrgencyQuestions.map((item) => item);

            // const updatedArray = selectedUrgencyQuestions.filter(
            //     (item) => newArray.includes(item)
            // );

            //array to send in api
            // const mergedArray = [
            //     ...newArray,
            //     ...updatedArray.filter(
            //         (item2) => !newArray.some((item1) => item1 === item2)
            //     )
            // ];

            // const data = {
            //     kycQuestions: mergedArray.map(item => ({
            //         question: item.question,
            //         category: "urgency",
            //         type: "seller",
            //         examples: item?.sampleAnswers?.filter(answer => answer)
            //     })),
            //     mainAgentId: AgentId
            // };
            // console.log("Data to send in api is", data);
            // ApiData = data;
            // }

            console.log("APi data is :--", ApiData);
            // return

            console.log("Apipath is", ApiPath);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of add KYC api is :--", response.data);
                if (response.data.status === true) {
                    handleCloseSellerKyc();
                    handleAddSellerKycData(response.data.data);
                    // router.push("/buyerskycquestions")
                }
            }

        } catch (error) {
            console.error("Error occured in api is :--", error);
        } finally {
            setSellerKycLoader(false);
        }


    }


    //function to check if all the input fields have the value
    // useEffect(() => {
    //     const areThreeFieldsFilled = inputs.filter(input => input.value.trim() !== "").length === 3;

    //     if (areThreeFieldsFilled) {
    //         console.log("Three fields have been filled!");
    //     } else {
    //         console.log("Less than three fields are filled.");
    //     }
    // }, [inputs])


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
            <AgentSelectSnackMessage isVisible={showErrorSnack} hide={()=>setShowErrorSnack(false)} message={showErrorSnack} />
            <div className='w-full py-4 overflow-auto h-[90%] flex flex-col justify-between'>
                <div className='h-[62vh]' style={{ scrollbarWidth: "none" }}>
                    {/* header */}
                    {/* <Header /> */}
                    {/* <Image src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' /> */}
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-3xl text-lg font-[600]' style={{ textAlign: "center" }}>
                            What would you like to ask sellers?
                        </div>
                        {
                            !hideTitle && (
                                <button className='mt-10 underline text-purple' style={styles.inputStyle} onClick={handleCloseSellerKyc}>
                                    {`I don't need questions for sellers`}
                                </button>
                            )
                        }
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
                                    <div className='mt-8 w-[90%] max-h-[37vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
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
                                        <div className='mt-8 w-[90%] max-h-[37vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
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
                                            <div className='mt-8 w-[90%] max-h-[37vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
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


                        <button className='mt-2 w-[90%] outline-none border-none justify-start flex max-h-[37vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple text-purple' style={{ fontWeight: "700", fontSize: 15 }} onClick={handleAddKyc}>
                            Add Question
                        </button>
                        {/* Modal to add KYC */}
                        <Modal
                            open={addKYCQuestion}
                            // onClose={() => setAddKYCQuestion(false)}
                            closeAfterTransition
                            BackdropProps={{
                                timeout: 1000,
                                sx: {
                                    backgroundColor: "#00000030",
                                    //backdropFilter: "blur(20px)",
                                },
                            }}
                        >
                            <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.AddNewKYCQuestionModal}>
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
                                                style={{ fontWeight: "500", fontSize: 15, borderColor: "#00000020" }}
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

                                        {/* <div className=' mx-2' style={{ height: "50px" }}>
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
                                                inputs.filter(input => input.value.trim() !== "").length === 3 && newQuestion ? (
                                                    <button className='bg-purple outline-none border-none rounded-lg text-white w-full mt-4 mx-2' style={{ ...styles.headingStyle, height: "50px" }} onClick={handleAddKycQuestion}>
                                                        Add Question
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled={true}
                                                        className='bg-[#00000020] text-black outline-none border-none rounded-lg w-full mt-4 mx-2'
                                                        style={{ ...styles.headingStyle, height: "50px" }}
                                                        onClick={handleAddKycQuestion}>
                                                        Add Question
                                                    </button>
                                                )
                                            }
                                        </div>

                                        {/* Error snack bar message */}
                                        <div>
                                        
                                        </div>

                                        {/* Can be use full to add shadow */}
                                        {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                    </div>
                                </div>
                            </Box>
                        </Modal>
                    </div>
                </div>
                <div className='mt-8 flex flex-row justify-center'>
                    {
                        sellerKycLoader ?
                            <div className='flex flex-row justify-center'>
                                <CircularProgress />
                            </div> :
                            <div className='w-full flex flex-row item-center justify-center'>
                                {
                                    shouldSave ?
                                        <button className='bg-purple text-white rounded-lg w-10/12 md:w-8/12  lg:w-6/12 h-[50px]'
                                            style={styles.headingStyle}
                                            onClick={handleAddNewKyc}
                                        >
                                            Save
                                        </button> :
                                        <div>
                                        </div>
                                }
                            </div>
                    }
                </div>

            </div>
        </div>
    )
}

export default AddSellerKyc;
