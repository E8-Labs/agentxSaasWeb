import Body from "@/components/onboarding/Body";
import Header from "@/components/onboarding/Header";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Footer from "@/components/onboarding/Footer";
import { Alert, Fade, Modal, Snackbar } from "@mui/material";
import { Box, style } from "@mui/system";
import Apis from "../apis/Apis";
import axios from "axios";
import { KycCategory } from "../constants/constants";
import AgentSelectSnackMessage from "../dashboard/leads/AgentSelectSnackMessage";
import IntroVideoModal from "../createagent/IntroVideoModal";
import VideoCard from "../createagent/VideoCard";
import { HowtoVideos, PersistanceKeys } from "@/constants/Constants";
import { GetKycQuestionsForUser, SellerKycsQuestions } from "@/constants/Kycs";
import { UserTypes } from "@/constants/UserTypes";

const SellerKycs = ({ handleContinue }) => {
  const [user, setUser] = useState(null);
  const [pageTitle, setPageTitle] = useState("What would you like to ask ");
  const router = useRouter();
  const [toggleClick, setToggleClick] = useState(1);
  const [addKYCQuestion, setAddKYCQuestion] = useState(false);
  const [inputs, setInputs] = useState([
    { id: 1, value: "" },
    { id: 2, value: "" },
    { id: 3, value: "" },
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  //code for need kyc
  const [selectedNeedKYC, setSelectedNeedKYC] = useState([]);
  //code for motivation KYC
  const [selectedMotivationKyc, setSelectedMotivationKYC] = useState([]);
  //code for need kyc
  const [selectedUrgencyKyc, setSelectedUrgencyKyc] = useState([]);
  const [sellerKycLoader, setSellerKycLoader] = useState(false);
  const [shouldContinue, setShouldContinue] = useState(true);
  const [introVideoModal, setIntroVideoModal] = useState(false);
  //alert
  const [showErrorSnack, setShowErrorSnack] = useState(false);

  //needKYCQuestions
  const [needKYCQuestions, setNeedKYCQuestions] = useState(
    SellerKycsQuestions.DefaultSellerKycsNeed
  );

  const [motivationKycQuestions, setMotivationKycQuestions] = useState(
    SellerKycsQuestions.DefaultSellerKycsUrgency
  );

  const [urgencyKycQuestions, setUrgencyKycQuestions] = useState(
    SellerKycsQuestions.DefaultSellerKycsMotivation
  );

  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser);
    if (userData) {
      let u = JSON.parse(userData);
      setUser(u);
    }
  }, []);

  useEffect(() => {
    // //console.log;
    if (user) {
      GetTitleBasedOnUserType();
      let profile = user.user;
      let kycsneed = GetKycQuestionsForUser(profile.userType, "seller", "need");
      setNeedKYCQuestions(kycsneed);
      let kycsmotivation = GetKycQuestionsForUser(
        profile.userType,
        "seller",
        "motivation"
      );
      setMotivationKycQuestions(kycsmotivation);
      let kycsurgency = GetKycQuestionsForUser(
        profile.userType,
        "seller",
        "urgency"
      );
      setUrgencyKycQuestions(kycsurgency);
    }
  }, [user]);

  useEffect(() => {
    if (
      selectedNeedKYC.length > 0 ||
      selectedMotivationKyc.length > 0 ||
      selectedUrgencyKyc.length > 0
    ) {
      setShouldContinue(false);
    } else if (
      selectedNeedKYC.length === 0 ||
      selectedMotivationKyc.length === 0 ||
      selectedUrgencyKyc.length === 0
    ) {
      setShouldContinue(true);
    }
  }, [selectedNeedKYC, selectedMotivationKyc, selectedUrgencyKyc]);

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

  // Function to handle adding a new KYC question
  const handleAddKycQuestion = () => {
    const sampleAnswers = inputs.map((input) => input.value);
    const newKYCQuestion = {
      id: needKYCQuestions.length + 1,
      question: newQuestion,
      sampleAnswers: sampleAnswers,
    };

    if (toggleClick === 1) {
      // Add to the "Needs" questions and auto-select the new question
      // //console.log;
      if (
        needKYCQuestions.some(
          (item) =>
            item.question.toLowerCase() ===
            newKYCQuestion.question.toLowerCase()
        )
      ) {
        setShowErrorSnack("Question already exists!!!");
        // //console.log;
        return;
      } else {
        //// //console.log;
        setNeedKYCQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions, newKYCQuestion];
          setSelectedNeedKYC((prevSelected) => [
            ...prevSelected,
            { id: newKYCQuestion.id, question: newKYCQuestion.question },
          ]);
          return updatedQuestions;
        });
      }
    } else if (toggleClick === 2) {
      if (
        motivationKycQuestions.some(
          (item) =>
            item.question.toLowerCase() ===
            newKYCQuestion.question.toLowerCase()
        )
      ) {
        setShowErrorSnack("Question already exists!!!");
        // //console.log;
        return;
      } else {
        setMotivationKycQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions, newKYCQuestion];
          setSelectedMotivationKYC((prevSelected) => [
            ...prevSelected,
            { id: newKYCQuestion.id, question: newKYCQuestion.question },
          ]);
          return updatedQuestions;
        });
      }
    } else if (toggleClick === 3) {
      if (
        urgencyKycQuestions.some(
          (item) =>
            item.question.toLowerCase() ===
            newKYCQuestion.question.toLowerCase()
        )
      ) {
        setShowErrorSnack("Question already exists!!!");
        // //console.log;
        return;
      } else {
        setUrgencyKycQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions, newKYCQuestion];
          setSelectedUrgencyKyc((prevSelected) => [
            ...prevSelected,
            { id: newKYCQuestion.id, question: newKYCQuestion.question },
          ]);
          return updatedQuestions;
        });
      }
    }
    setAddKYCQuestion(false);
    setNewQuestion(""); // Reset the new question field
    setInputs([
      { id: 1, value: "" },
      { id: 2, value: "" },
      { id: 3, value: "" },
    ]); // Reset the inputs
  };

  // Handle change in input field
  // const handleInputChange = (id, value) => {
  //   setInputs(
  //     inputs.map((input) => (input.id === id ? { ...input, value } : input))
  //   );
  // };
  //let the user donot enter special  chars
  const handleInputChange = (id, value) => {
    // Allow only letters, numbers, and spaces
    const sanitizedValue = value.replace(/[{}\[\]<>]/g, '');//(/[^a-zA-Z0-9 ]/g, '');

    setInputs(
      inputs.map((input) =>
        input.id === id ? { ...input, value: sanitizedValue } : input
      )
    );
  };


  // Handle deletion of input field
  const handleDelete = (id) => {
    setInputs(inputs.filter((input) => input.id !== id));
  };

  // Handle adding a new input field
  const handleAddInput = () => {
    const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1;
    setInputs([...inputs, { id: newId, value: "" }]);
  };

  const handleToggleClick = (id) => {
    setToggleClick((prevId) => (prevId === id ? id : id));
  };

  //code to select question
  const handleSelectNeedKYC = (item) => {
    // setSelectedNeedKYC((prevSelected) =>
    //     prevSelected.some((selectedItem) => selectedItem.question === item.question)
    //         ? prevSelected.filter((selectedItem) => selectedItem.id !== item.id) // Deselect
    //         : [...prevSelected, { id: item.id, question: item.question }] // Select
    // );

    let isSelected = isMotivationKycSelected(item, selectedNeedKYC);
    if (isSelected) {
      setSelectedNeedKYC(
        (prevSelected) =>
          prevSelected.filter(
            (selectedItem) => selectedItem.question !== item.question
          ) // Deselect
      );
    } else {
      setSelectedNeedKYC(
        (prevSelected) => [
          ...prevSelected,
          { id: item.id, question: item.question },
        ] // Select
      );
    }
  };

  const handleSelectMotivationKYC = (item) => {
    let isSelected = isMotivationKycSelected(item, selectedMotivationKyc);
    if (isSelected) {
      setSelectedMotivationKYC(
        (prevSelected) =>
          prevSelected.filter(
            (selectedItem) => selectedItem.question !== item.question
          ) // Deselect
      );
    } else {
      setSelectedMotivationKYC(
        (prevSelected) => [
          ...prevSelected,
          { id: item.id, question: item.question },
        ] // Select
      );
    }
  };

  const handleUrgencyKYC = (item) => {
    // setSelectedUrgencyKyc((prevSelected) =>
    //     prevSelected.filter((selectedItem) => selectedItem.question !== item.question)
    // )
    let isSelected = isMotivationKycSelected(item, selectedUrgencyKyc);
    if (isSelected) {
      setSelectedUrgencyKyc(
        (prevSelected) =>
          prevSelected.filter(
            (selectedItem) => selectedItem.question !== item.question
          ) // Deselect
      );
    } else {
      setSelectedUrgencyKyc(
        (prevSelected) => [
          ...prevSelected,
          { id: item.id, question: item.question },
        ] // Select
      );
    }
  };

  const handleAddKyc = () => {
    setAddKYCQuestion(true);
  };

  //close add kyc question modal
  const handleClose = () => {
    setInputs([
      { id: 1, value: "" },
      { id: 2, value: "" },
      { id: 3, value: "" },
    ]);
    setAddKYCQuestion(false);
    setNewQuestion("");
  };

  const handleNextclick = async () => {
    // Get only the selected questions
    const selectedNeedQuestions = needKYCQuestions.filter((question) =>
      selectedNeedKYC.some((selectedItem) => selectedItem.id === question.id)
    );

    const selectedMotivationQuestions = motivationKycQuestions.filter(
      (question) =>
        selectedMotivationKyc.some(
          (selectedItem) => selectedItem.id === question.id
        )
    );

    const selectedUrgencyQuestions = urgencyKycQuestions.filter((question) =>
      selectedUrgencyKyc.some((selectedItem) => selectedItem.id === question.id)
    );

    //// //console.log;
    //// //console.log;
    //// //console.log;
    // router.push("/buyerskycquestions")
    // handleContinue();

    //code for api call

    let kycQuestions = [];
    selectedNeedQuestions.map((item) => {
      kycQuestions.push({
        question: item.question,
        category: KycCategory.CategoryNeeds,
        type: "seller",
        examples: item.sampleAnswers.filter((answer) => answer),
      });
    });
    // //console.log;
    selectedMotivationQuestions.map((item) => {
      kycQuestions.push({
        question: item.question,
        category: KycCategory.CategoryMotivation,
        type: "seller",
        examples: item.sampleAnswers.filter((answer) => answer),
      });
    });
    // //console.log;
    selectedUrgencyQuestions.map((item) => {
      kycQuestions.push({
        question: item.question,
        category: KycCategory.CategoryUrgency,
        type: "seller",
        examples: item.sampleAnswers.filter((answer) => answer),
      });
    });
    // //console.log;

    setSellerKycLoader(true);

    try {
      let AuthToken = null;
      // const LocalData = localStorage.getItem("User");
      const agentDetails = localStorage.getItem("agentDetails");
      let MyAgentData = null;
      if (user) {
        // const UserDetails = JSON.parse(LocalData);
        AuthToken = user.token;
      }

      if (agentDetails) {
        // //console.log;
        const agentData = JSON.parse(agentDetails);
        // //console.log;
        MyAgentData = agentData;
      }

      const ApiPath = Apis.addKyc;
      let ApiData = [];

      const data = {
        kycQuestions: kycQuestions,
        mainAgentId: MyAgentData.id,
      };
      //// //console.log;
      ApiData = data;

      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          localStorage.setItem(
            "agentDetails",
            JSON.stringify(response.data.data)
          );
          if (GetUserType() == UserTypes.RealEstateAgent) {
            router.push("/buyerskycquestions");
          } else {
            router.push("/pipeline");
          }
        } else {
          setSellerKycLoader(false);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is :--", error);
      setSellerKycLoader(false);
    } finally {
    }
  };

  const KYCQuestionType = [
    {
      id: 1,
      title: "Needs",
    },
    {
      id: 2,
      title: "Motivation",
    },
    {
      id: 3,
      title: "Urgency",
    },
  ];

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "700",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "600",
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
  };

  function isMotivationKycSelected(kyc, selectedKycs) {
    let isSelected = false;
    for (const k of selectedKycs) {
      // //console.log;
      if (kyc.question == k.question) {
        isSelected = true;
      }
    }
    return isSelected;
  }

  function GetTitleBasedOnUserType() {
    let title = "What would you like to ask sellers?";
    if (user) {
      let profile = user.user;
      if (profile.userType != UserTypes.RealEstateAgent) {
        title = "What would you like to ask customers?";
      }
    }
    setPageTitle(title);
  }
  function GetUserType() {
    let type = UserTypes.RealEstateAgent;
    if (user) {
      let profile = user.user;
      type = profile.userType;
    }
    return type;
  }

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <AgentSelectSnackMessage
        isVisible={showErrorSnack}
        hide={() => setShowErrorSnack(false)}
        message={showErrorSnack}
      />
      <div className="bg-white rounded-2xl w-10/12 h-[90%] py-4 flex flex-col justify-between">
        <div className="h-[80vh]">
          {/* header */}
          <div className="h-[10%]">
            <Header
              skipSellerKYC={true}
              selectedSellerNeedKYC={selectedNeedKYC}
              selectedSellerMotivationKyc={selectedMotivationKyc}
              selectedSellerUrgencyKyc={selectedUrgencyKyc}
              shouldContinue={shouldContinue}
              hideIcon={true}
              user={user}
            />
          </div>
          {/* Body */}
          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle="Learn about asking questions (KYC)"
            videoUrl={HowtoVideos.KycQuestions}
          />
          <div className="flex flex-row w-full justify-center h-[98%]">
            <div className="hidden lg:inline xl:w-[350px] lg:w-[350px] -ml-4 mt-12">
              <VideoCard
                duration="1 min 38 sec"
                horizontal={false}
                playVideo={() => {
                  setIntroVideoModal(true);
                }}
                title="Learn about asking questions (KYC)"
              />
            </div>
            <div className="flex flex-col items-center px-4 w-full h-[90%]">
              <div
                className="mt-6 w-11/12 md:text-4xl text-lg font-[700]"
                style={{ textAlign: "center" }}
              >
                {pageTitle}
              </div>
              <div
                className="mt-6 w-11/12 md:text-xl text-lg font-[400]"
                style={{ textAlign: "center" }}
              >
                Answers to these questions will be saved in the customer profile
              </div>
              {/* <button className='mt-10 underline text-purple' style={styles.inputStyle} onClick={() => { router.push("/buyerskycquestions"); }}>
                            {`I don't need questions for sellers`}
                        </button> */}
              <div className="flex flex-row items-center gap-10 mt-10">
                {KYCQuestionType.map((item, index) => (
                  <button
                    key={item.id}
                    style={{
                      ...styles.inputStyle,
                      color: item.id === toggleClick ? "#7902DF" : "",
                    }}
                    onClick={(e) => {
                      handleToggleClick(item.id);
                    }}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              <div>
                {toggleClick === 1 ? (
                  <Image
                    src={"/assets/needKYC.png"}
                    height={5}
                    width={303}
                    alt="*"
                  />
                ) : toggleClick === 2 ? (
                  <Image
                    src={"/assets/motivationKyc.png"}
                    height={5}
                    width={303}
                    alt="*"
                  />
                ) : toggleClick === 3 ? (
                  <Image
                    src={"/assets/urgencyKyc.png"}
                    height={8}
                    width={310}
                    alt="*"
                  />
                ) : (
                  ""
                )}
              </div>

              {toggleClick === 1 ? (
                <div
                  className="mt-8 w-11/12 md:w-11/12 max-h-[85%] overflow-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {needKYCQuestions.map((item, index) => {
                    let selected = isMotivationKycSelected(
                      item,
                      selectedNeedKYC
                    );
                    return (
                      <button
                        className="mb-4 border rounded-3xl flex flex-row items-center justify-between px-4 sm:h-[10vh] w-full"
                        style={{
                          border: selected ? "2px solid #7902DF" : "",
                          backgroundColor: selected ? "#402FFF15" : "",
                        }}
                        key={index}
                        onClick={() => handleSelectNeedKYC(item)}
                      >
                        <div style={{ width: "94%" }} className="text-start">
                          {item.question}
                        </div>
                        <div
                          className="outline-none border-none"
                          style={{ width: "6%" }}
                        >
                          {selected ? (
                            <Image
                              src={"/assets/charmTick.png"}
                              height={35}
                              width={35}
                              alt="*"
                            />
                          ) : (
                            <Image
                              src={"/assets/charmUnMark.png"}
                              height={35}
                              width={35}
                              alt="*"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : toggleClick === 2 ? (
                <div
                  className="mt-8 w-11/12 md:w-9/12 max-h-[85%] overflow-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {motivationKycQuestions.map((item, index) => {
                    // console.log(
                    //   "########################### START ########################################"
                    // );
                    let selected = isMotivationKycSelected(
                      item,
                      selectedMotivationKyc
                    );
                    // //console.log;
                    // console.log(
                    //   "########################## END #########################################"
                    // );
                    return (
                      <button
                        className="mb-4 border rounded-3xl flex flex-row items-center justify-between px-4 sm:h-[10vh] w-full"
                        key={index}
                        onClick={() => handleSelectMotivationKYC(item)}
                        style={{
                          border: selected ? "2px solid #7902DF" : "", //selectedMotivationKyc.some(selectedItem => selectedItem.id === item.id) ? "2px solid #7902DF" : "",
                          backgroundColor: selected ? "#402FFF15" : "",
                        }}
                      >
                        <div style={{ width: "90%" }} className="text-start">
                          {item.question}
                        </div>
                        <div
                          className="outline-none border-none"
                          style={{ width: "10%" }}
                        >
                          {selected ? (
                            <Image
                              src={"/assets/charmTick.png"}
                              height={35}
                              width={35}
                              alt="*"
                            />
                          ) : (
                            <Image
                              src={"/assets/charmUnMark.png"}
                              height={35}
                              width={35}
                              alt="*"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : toggleClick === 3 ? (
                <div
                  className="mt-8 w-10/12 md:w-8/12 max-h-[85%] overflow-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {urgencyKycQuestions.map((item, index) => {
                    let selected = isMotivationKycSelected(
                      item,
                      selectedUrgencyKyc
                    );
                    return (
                      <button
                        className="mb-4 border rounded-3xl flex flex-row items-center justify-between px-4 sm:h-[10vh] w-full"
                        key={index}
                        onClick={() => handleUrgencyKYC(item)}
                        style={{
                          border: selected ? "2px solid #7902DF" : "",
                          backgroundColor: selected ? "#402FFF15" : "",
                        }}
                      >
                        <div style={{ width: "90%" }} className="text-start">
                          {item.question}
                        </div>
                        <div
                          className="outline-none border-none"
                          style={{ width: "10%" }}
                        >
                          {selected ? (
                            <Image
                              src={"/assets/charmTick.png"}
                              height={35}
                              width={35}
                              alt="*"
                            />
                          ) : (
                            <Image
                              src={"/assets/charmUnMark.png"}
                              height={35}
                              width={35}
                              alt="*"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                ""
              )}

              <button
                className="mt-2 w-10/12 md:w-8/12 justify-start flex justify-start flex text-purple"
                style={{
                  fontWeight: "700",
                  fontSize: 15,
                  scrollbarWidth: "none",
                }}
                onClick={handleAddKyc}
              >
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
                    backgroundColor: "#00000050",
                    // //backdropFilter: "blur(20px)",
                  },
                }}
              >
                <Box
                  className="lg:w-5/12 sm:w-full w-8/12"
                  sx={styles.AddNewKYCQuestionModal}
                >
                  <div className="flex flex-row justify-center w-full">
                    <div
                      className="sm:w-9/12 w-full"
                      style={{
                        backgroundColor: "#ffffff",
                        padding: 20,
                        borderRadius: "13px",
                      }}
                    >
                      <div className="flex flex-row justify-end">
                        <button onClick={handleClose}>
                          <Image
                            src={"/assets/crossIcon.png"}
                            height={40}
                            width={40}
                            alt="*"
                          />
                        </button>
                      </div>
                      <div
                        className="text-center mt-2"
                        style={{ fontWeight: "700", fontSize: 24 }}
                      >
                        New Question
                      </div>
                      <div
                        className="text-[#00000060] mx-2"
                        style={{ fontWeight: "600", fontSize: 13 }}
                      >
                        {`What’s the question? `}
                      </div>
                      <div className="mt-2">
                        <input
                          className="border outline-none w-full p-2 rounded-lg px-3 mx-2 focus:outline-none focus:ring-0"
                          style={{
                            fontSize: 15,
                            fontWeight: "500",
                            borderColor: "#00000020",
                          }}
                          placeholder="Ex: What's your name?"
                          value={newQuestion}
                          // onChange={(e) => setNewQuestion(e.target.value)}
                          onChange={(e) => {
                            const input = e.target.value;
                            const filtered = input.replace(/[{}\[\]<>]/g, '');
                            setNewQuestion(filtered);
                          }}
                        />
                      </div>
                      <div className="mt-4 mx-2" style={styles.headingStyle}>
                        Sample Answers
                      </div>

                      <div
                        className="mt-2 text-[#00000060] mx-2"
                        style={{ fontWeight: "500", fontSize: 12 }}
                      >
                        What are possible answers leads will give to this
                        question?
                      </div>

                      <div
                        className="max-h-[30vh] overflow-auto mt-4" //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                        style={{ scrollbarWidth: "none" }}
                      >
                        {inputs.map((input, index) => (
                          <div
                            key={input.id}
                            className="w-full flex flex-row items-center gap-4 mt-4"
                          >
                            <input
                              className="border p-2 rounded-lg px-3 outline-none mx-2 focus:outline-none focus:ring-0"
                              style={{ width: "95%", borderColor: "#00000020" }}
                              placeholder={`Sample Answer`}
                              value={input.value}
                              onChange={(e) =>
                                handleInputChange(input.id, e.target.value)
                              }
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

                      <div className="w-full h-[]80px">
                        {inputs.filter((input) => input.value.trim() !== "")
                          .length === 3 &&
                          newQuestion && (
                            <button
                              className="bg-purple outline-none border-none rounded-lg text-white w-full mt-4 mx-2"
                              style={{ ...styles.headingStyle, height: "50px" }}
                              onClick={handleAddKycQuestion}
                            >
                              Add Question
                            </button>
                          )}
                      </div>

                      {/* Error snack bar message */}

                      {/* Can be use full to add shadow */}
                      {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                    </div>
                  </div>
                </Box>
              </Modal>
            </div>
            <div className="hidden lg:inline w-3/12 "></div>
          </div>
        </div>
        <div className="h-[10%]">
          <div>
            <ProgressBar value={33} />
          </div>

          <Footer
            handleContinue={handleNextclick}
            donotShowBack={true}
            registerLoader={sellerKycLoader}
            shouldContinue={shouldContinue}
          />
        </div>
      </div>
    </div>
  );
};

export default SellerKycs;
