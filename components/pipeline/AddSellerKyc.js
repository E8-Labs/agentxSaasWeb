import { Alert, CircularProgress, Fade, Snackbar } from '@mui/material'
import { Box, style } from '@mui/system'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { GetKycQuestionsForUser, SellerKycsQuestions } from '@/constants/Kycs'
import { UserTypes } from '@/constants/UserTypes'
import { Checkbox } from '@/components/ui/checkbox'

import Apis from '../apis/Apis'
import AgentSelectSnackMessage from '../dashboard/leads/AgentSelectSnackMessage'

const AddSellerKyc = ({
  handleCloseSellerKyc,
  handleAddSellerKycData,
  OpenSelerMotivation,
  OpenSellerNeeds,
  OpenSellerUrgency,
  SellerNeedData,
  hideTitle,
  SellerMotivationData,
  SellerUrgencyData,
  mainAgentId,
  allKYCs,
  selectedUser = null,
  onTitleReady,
  titleRenderedInHeader = false,
}) => {
  //console.log;
  //console.log

  const router = useRouter()

  const [user, setUser] = useState(null)
  const [shouldSave, setShouldSave] = useState(false)

  const [toggleClick, setToggleClick] = useState(1)
  const [addKYCQuestion, setAddKYCQuestion] = useState(false)
  const [inputs, setInputs] = useState([
    { id: 1, value: '' },
    { id: 2, value: '' },
    { id: 3, value: '' },
  ])
  const [newQuestion, setNewQuestion] = useState('')
  const newQuestionInputRef = useRef(null)
  //code for need kyc
  const [selectedNeedKYC, setSelectedNeedKYC] = useState([])
  const [oldSelectedNeedKYC, setOldSelectedNeedKYC] = useState([])
  // //console.log;
  // //console.log;
  //code for motivation KYC
  const [selectedMotivationKyc, setSelectedMotivationKYC] = useState([])
  const [oldSelectedMotivationKyc, setOldSelectedMotivationKYC] = useState([])
  //code for need kyc
  const [selectedUrgencyKyc, setSelectedUrgencyKyc] = useState([])
  const [oldSelectedUrgencyKyc, setOldSelectedUrgencyKyc] = useState([])
  const [sellerKycLoader, setSellerKycLoader] = useState(false)

  //alert
  const [showErrorSnack, setShowErrorSnack] = useState(false)

  // //needKYCQuestions
  // const [needKYCQuestions, setNeedKYCQuestions] = useState([
  //   {
  //     id: 1,
  //     question: "Why have you decided to sell your home?",
  //     category: "need",
  //     type: "seller",
  //     sampleAnswers: [],
  //   },
  //   // {
  //   //     id: 2,
  //   //     question: "Have you outgrown your current home, or is it too large now?",
  //   //     sampleAnswers: []
  //   // },
  //   {
  //     id: 2,
  //     question:
  //       "Are there any significant life changes prompting this decision, such as job relocation or changes in the family?",
  //     category: "need",
  //     type: "seller",
  //     sampleAnswers: [],
  //   },
  // ]);

  // const [motivationKycQuestions, setMotivationKycQuestions] = useState([
  //   {
  //     id: 1,
  //     question:
  //       "What's your primary motivation for selling now rather than waiting?", //Why is now the right time?
  //     category: "motivation",
  //     type: "seller",
  //     sampleAnswers: [],
  //   },
  //   {
  //     id: 2,
  //     question:
  //       "How important is the selling price to you versus the speed of the sale?", //Are you looking to downsize or upsize?
  //     category: "motivation",
  //     type: "seller",
  //     sampleAnswers: [],
  //   },
  //   {
  //     id: 3,
  //     question:
  //       "Are there any specific factors that would influence your decision to accept an offer or reject it?", //Are you relocating for work?
  //     category: "motivation",
  //     type: "seller",
  //     sampleAnswers: [],
  //   },
  // ]);

  // const [urgencyKycQuestions, setUrgencyKycQuestions] = useState([
  //   {
  //     id: 1,
  //     question: "When do you hope to have your home sold?", //When do you expect to move into your new place?
  //     category: "urgency",
  //     type: "seller",
  //     sampleAnswers: [],
  //   },
  //   {
  //     id: 2,
  //     question:
  //       "Are there any specific events or dates driving this timeline (e.g., starting a new job, school for kids, purchasing another property)?", //When do you plan on buying a home?
  //     category: "urgency",
  //     type: "seller",
  //     sampleAnswers: [],
  //   },
  //   {
  //     id: 3,
  //     question:
  //       "How would it impact you if the sale took longer than anticipated?", //When do you plan to move into your new home?
  //     category: "urgency",
  //     type: "seller",
  //     sampleAnswers: [],
  //   },
  // ]);

  const [needKYCQuestions, setNeedKYCQuestions] = useState(
    SellerKycsQuestions.DefaultSellerKycsNeed,
  )

  const [motivationKycQuestions, setMotivationKycQuestions] = useState(
    SellerKycsQuestions.DefaultSellerKycsUrgency,
  )

  const [urgencyKycQuestions, setUrgencyKycQuestions] = useState(
    SellerKycsQuestions.DefaultSellerKycsMotivation,
  )

  useEffect(() => {
    // //console.log;
    let AuthToken = null,
      user = null
    const localData = localStorage.getItem('User')
    if (localData) {
      user = JSON.parse(localData)
      setUser(user)
      // //console.log;
      AuthToken = user.token
    }
    if (user) {
      const title = GetTitleBasedOnUserType()
      if (titleRenderedInHeader && onTitleReady) onTitleReady(title)
      let profile = user.user
      let kycsneed = GetKycQuestionsForUser(profile.userType, 'seller', 'need')
      setNeedKYCQuestions(kycsneed)
      let kycsmotivation = GetKycQuestionsForUser(
        profile.userType,
        'seller',
        'motivation',
      )
      setMotivationKycQuestions(kycsmotivation)
      let kycsurgency = GetKycQuestionsForUser(
        profile.userType,
        'seller',
        'urgency',
      )
      setUrgencyKycQuestions(kycsurgency)
    }
  }, [])

  //check for the save and continue btn
  useEffect(() => {
    // //console.log;
    if (
      oldSelectedNeedKYC.length !== selectedNeedKYC.length ||
      selectedMotivationKyc.length !== oldSelectedMotivationKyc.length ||
      selectedUrgencyKyc.length !== oldSelectedUrgencyKyc.length
    ) {
      // //console.log;
      setShouldSave(true)
    } else if (
      oldSelectedNeedKYC.length === selectedNeedKYC.length ||
      selectedMotivationKyc.length !== oldSelectedMotivationKyc.length ||
      selectedUrgencyKyc.length !== oldSelectedUrgencyKyc.length
    ) {
      // //console.log;
      setShouldSave(false)
    }
  }, [
    oldSelectedNeedKYC,
    selectedNeedKYC,
    selectedMotivationKyc,
    oldSelectedMotivationKyc,
    selectedUrgencyKyc,
    oldSelectedUrgencyKyc,
  ])

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
      setToggleClick(1)
    } else if (OpenSelerMotivation) {
      setToggleClick(2)
    } else if (OpenSellerUrgency) {
      setToggleClick(3)
    }

    if (SellerNeedData.length > 0) {
      //console.log;
      setNeedKYCQuestions((prevNeedKycs) => [
        ...prevNeedKycs.filter(
          (existing) =>
            !SellerNeedData.some(
              (newData) => existing.question === newData.question,
            ),
        ),
        ...SellerNeedData,
      ])

      // Remove matching items from SelectedNeedKYC and add the new items
      setSelectedNeedKYC((prevSelected) => [
        ...prevSelected.filter(
          (selectedItem) =>
            !SellerNeedData.some((newData) => selectedItem.id === newData.id),
        ),
        ...SellerNeedData.map((item) => ({
          id: item.id,
          question: item.question,
        })),
      ])

      setOldSelectedNeedKYC((prevSelected) => [
        ...prevSelected.filter(
          (selectedItem) =>
            !SellerNeedData.some((newData) => selectedItem.id === newData.id),
        ),
        ...SellerNeedData.map((item) => ({
          id: item.id,
          question: item.question,
        })),
      ])
    }
    if (SellerMotivationData.length > 0) {
      // //console.log;
      setMotivationKycQuestions((prevNeedKycs) => [
        ...prevNeedKycs.filter(
          (existing) =>
            !SellerMotivationData.some(
              (newData) => existing.question === newData.question,
            ),
        ),
        ...SellerMotivationData,
      ])

      // Remove matching items from SelectedNeedKYC and add the new items
      setSelectedMotivationKYC((prevSelected) => [
        ...prevSelected.filter(
          (selectedItem) =>
            !SellerMotivationData.some(
              (newData) => selectedItem.id === newData.id,
            ),
        ),
        ...SellerMotivationData.map((item) => ({
          id: item.id,
          question: item.question,
        })),
      ])

      setOldSelectedMotivationKYC((prevSelected) => [
        ...prevSelected.filter(
          (selectedItem) =>
            !SellerMotivationData.some(
              (newData) => selectedItem.id === newData.id,
            ),
        ),
        ...SellerMotivationData.map((item) => ({
          id: item.id,
          question: item.question,
        })),
      ])
    }
    if (SellerUrgencyData.length > 0) {
      // //console.log;
      setUrgencyKycQuestions((prevNeedKycs) => [
        ...prevNeedKycs.filter(
          (existing) =>
            !SellerUrgencyData.some(
              (newData) => existing.question === newData.question,
            ),
        ),
        ...SellerUrgencyData,
      ])

      // Remove matching items from SelectedNeedKYC and add the new items
      setSelectedUrgencyKyc((prevSelected) => [
        ...prevSelected.filter(
          (selectedItem) =>
            !SellerUrgencyData.some(
              (newData) => selectedItem.id === newData.id,
            ),
        ),
        ...SellerUrgencyData.map((item) => ({
          id: item.id,
          question: item.question,
        })),
      ])

      setOldSelectedUrgencyKyc((prevSelected) => [
        ...prevSelected.filter(
          (selectedItem) =>
            !SellerUrgencyData.some(
              (newData) => selectedItem.id === newData.id,
            ),
        ),
        ...SellerUrgencyData.map((item) => ({
          id: item.id,
          question: item.question,
        })),
      ])
    }
    // }
  }, [])

  //function to add kyc
  const handleAddKycQuestion = () => {
    //console.log
    const sampleAnswers = inputs.map((input) => input.value)
    let newKYCQuestion = {
      id: needKYCQuestions.length + 1,
      question: newQuestion,
      sampleAnswers: sampleAnswers,
    }

    if (toggleClick === 1) {
      newKYCQuestion.id = needKYCQuestions.length + 1
      if (
        needKYCQuestions.some(
          (item) =>
            item.question.toLowerCase() ===
            newKYCQuestion.question.toLowerCase(),
        )
      ) {
        setShowErrorSnack('Question already exists!!!')
        // //console.log;
        return
      } else {
        //// //console.log;
        setNeedKYCQuestions((prevQuestions) => {
          const updatedQuestions = [
            ...prevQuestions,
            { ...newKYCQuestion, type: 'seller', category: 'need' },
          ]
          setSelectedNeedKYC((prevSelected) => [
            ...prevSelected,
            { id: newKYCQuestion.id, question: newKYCQuestion.question },
          ])
          return updatedQuestions
        })
      }
    } else if (toggleClick === 2) {
      newKYCQuestion.id = motivationKycQuestions.length + 1

      if (
        motivationKycQuestions.some(
          (item) =>
            item.question.toLowerCase() ===
            newKYCQuestion.question.toLowerCase(),
        )
      ) {
        setShowErrorSnack('Question already exists!!!')
        // //console.log;
        return
      } else {
        setMotivationKycQuestions((prevQuestions) => {
          const updatedQuestions = [
            ...prevQuestions,
            { ...newKYCQuestion, type: 'seller', category: 'motivation' },
          ]
          setSelectedMotivationKYC((prevSelected) => [
            ...prevSelected,
            { id: newKYCQuestion.id, question: newKYCQuestion.question },
          ])
          return updatedQuestions
        })
      }
    } else if (toggleClick === 3) {
      newKYCQuestion.id = urgencyKycQuestions.length + 1
      if (
        urgencyKycQuestions.some(
          (item) =>
            item.question.toLowerCase() ===
            newKYCQuestion.question.toLowerCase(),
        )
      ) {
        setShowErrorSnack('Question already exists!!!')
        // //console.log;
        return
      } else {
        setUrgencyKycQuestions((prevQuestions) => {
          const updatedQuestions = [
            ...prevQuestions,
            { ...newKYCQuestion, type: 'seller', category: 'urgency' },
          ]
          setSelectedUrgencyKyc((prevSelected) => [
            ...prevSelected,
            { id: newKYCQuestion.id, question: newKYCQuestion.question },
          ])
          return updatedQuestions
        })
      }
    }

    setAddKYCQuestion(false)
    setNewQuestion('') // Reset the new question field
    setInputs([
      { id: 1, value: '' },
      { id: 2, value: '' },
      { id: 3, value: '' },
    ]) // Reset the inputs
  }

  // Handle change in input field
  // const handleInputChange = (id, value) => {
  //   setInputs(
  //     inputs.map((input) => (input.id === id ? { ...input, value } : input))
  //   );
  // };
  //let the user donot enter special  chars
  const handleInputChange = (id, value) => {
    // Allow only letters, numbers, and spaces
    // const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
    // const sanitizedValue = value.replace(/[{}\[\]<>]/g, '');
    const sanitizedValue = value.replace(/[{}\[\]<>]/g, '')

    setInputs(
      inputs.map((input) =>
        input.id === id ? { ...input, value: sanitizedValue } : input,
      ),
    )
  }

  // Handle deletion of input field
  const handleDelete = (id) => {
    setInputs(inputs.filter((input) => input.id !== id))
  }

  // Handle adding a new input field
  const handleAddInput = () => {
    const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1
    setInputs([...inputs, { id: newId, value: '' }])
  }

  const handleToggleClick = (id) => {
    setToggleClick((prevId) => (prevId === id ? id : id))
  }

  //code to select question
  const handleSelectNeedKYC = (item) => {
    setSelectedNeedKYC(
      (prevSelected) =>
        prevSelected.some((selectedItem) => selectedItem.id === item.id)
          ? prevSelected.filter((selectedItem) => selectedItem.id !== item.id) // Deselect
          : [...prevSelected, { id: item.id, question: item.question }], // Select
    )
  }

  const handleSelectMotivationKYC = (item) => {
    setSelectedMotivationKYC(
      (prevSelected) =>
        prevSelected.some((selectedItem) => selectedItem.id === item.id)
          ? prevSelected.filter((selectedItem) => selectedItem.id !== item.id) // Deselect
          : [...prevSelected, { id: item.id, question: item.question }], // Select
    )
  }

  const handleUrgencyKYC = (item) => {
    setSelectedUrgencyKyc(
      (prevSelected) =>
        prevSelected.some((selectedItem) => selectedItem.id === item.id)
          ? prevSelected.filter((selectedItem) => selectedItem.id !== item.id) // Deselect
          : [...prevSelected, { id: item.id, question: item.question }], // Select
    )
  }

  const handleAddKyc = () => {
    setAddKYCQuestion(true)
  }

  //close inline add question form
  const handleClose = () => {
    setInputs([
      { id: 1, value: '' },
      { id: 2, value: '' },
      { id: 3, value: '' },
    ])
    setNewQuestion('')
    setAddKYCQuestion(false)
  }

  useEffect(() => {
    if (addKYCQuestion) {
      const t = setTimeout(() => {
        newQuestionInputRef.current?.focus?.()
      }, 0)
      return () => clearTimeout(t)
    }
  }, [addKYCQuestion])

  //api call to add kyc
  const handleAddNewKyc = async () => {
    //console.log
    // Get only the selected questions
    const selectedNeedQuestions = needKYCQuestions.filter((question) =>
      selectedNeedKYC.some((selectedItem) => selectedItem.id === question.id),
    )

    const selectedMotivationQuestions = motivationKycQuestions.filter(
      (question) =>
        selectedMotivationKyc.some(
          (selectedItem) => selectedItem.id === question.id,
        ),
    )

    const selectedUrgencyQuestions = urgencyKycQuestions.filter((question) =>
      selectedUrgencyKyc.some(
        (selectedItem) => selectedItem.id === question.id,
      ),
    )

    setSellerKycLoader(true)

    try {
      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      const agentDetails = localStorage.getItem('agentDetails')
      let MyAgentData = null
      let UserDetails = ''
      if (LocalData) {
        UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      let AgentId = null

      if (agentDetails) {
        // //console.log;
        const agentData = JSON.parse(agentDetails)
        // //console.log;
        MyAgentData = agentData
      }

      const ApiPath = Apis.updateKYC
      let ApiData = []

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

      let newArray = []

      // //console.log;

      for (let i = 0; i < allKYCs.length; i++) {
        const itemA = allKYCs[i]

        let existsInArrayB = false
        for (let j = 0; j < selectedNeedQuestions.length; j++) {
          if (itemA.question === selectedNeedQuestions[j].question) {
            existsInArrayB = true

            break
          }
        }
        if (existsInArrayB) {
          newArray.push(itemA)
        }
      }

      for (let i = 0; i < selectedNeedQuestions.length; i++) {
        let itemB = selectedNeedQuestions[i]
        itemB.category = 'need'
        itemB.type = 'seller'
        let existsInArrayA = false
        for (let j = 0; j < allKYCs.length; j++) {
          if (itemB.question === allKYCs[j].question) {
            existsInArrayA = true
            break
          }
        }
        if (!existsInArrayA) {
          newArray.push(itemB)
        }
      }

      // //console.log;

      // let kycs = allKYCs.filter((item) => item.category != "motivation")
      // kycs = [...kycs, ...selectedMotivationQuestions]

      // let categoryType = ""
      let updatedKycs = [
        ...selectedMotivationQuestions.map((item) => ({
          ...item,
          type: 'seller',
          category: 'motivation',
        })),
        ...selectedNeedQuestions.map((item) => ({
          ...item,
          type: 'seller',
          category: 'need',
        })),
        ...selectedUrgencyQuestions.map((item) => ({
          ...item,
          type: 'seller',
          category: 'urgency',
        })),
      ]

      //console.log;

      // let kycs = allKYCs.filter((item) => item.category != "motivation")
      // kycs = [...kycs, ...updatedKycs]

      let data = {
        kycQuestions: updatedKycs.map((item) => ({
          question: item.question,
          category: item.category,
          type: item.type,
          examples: item?.sampleAnswers?.filter((answer) => answer),
        })),
        type: 'seller',
        mainAgentId: AgentId,
      }
      if (selectedUser) {
        data.userId = selectedUser.id
      }
      //console.log;
      // return;
      ApiData = data

      // console.log("Auth thoken is",AuthToken)

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setOldSelectedNeedKYC([...selectedNeedKYC])
          setOldSelectedMotivationKYC([...selectedMotivationKyc])
          setOldSelectedUrgencyKyc([...selectedUrgencyKyc])
          setShouldSave(false)
          handleCloseSellerKyc()
          handleAddSellerKycData(response.data.data)
          // router.push("/buyerskycquestions")
        }
      }
    } catch (error) {
      // console.error("Error occured in api is :--", error);
    } finally {
      setSellerKycLoader(false)
    }
  }

  const KYCQuestionType = [
    {
      id: 1,
      title: 'Needs',
    },
    {
      id: 2,
      title: 'Motivation',
    },
    {
      id: 3,
      title: 'Urgency',
    },
  ]

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: '700',
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: '600',
    },
    AddNewKYCQuestionModal: {
      height: 'auto',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  function GetTitleBasedOnUserType() {
    let title = 'What would you like to ask sellers?'
    if (user) {
      let profile = user.user
      if (profile.userType != UserTypes.RealEstateAgent) {
        title = 'What would you like to ask customers?'
      }
    }
    return title
  }
  function GetUserType() {
    let type = UserTypes.RealEstateAgent
    if (user) {
      let profile = user.user
      type = profile.userType
    }
    return type
  }

  return (
    <div
      style={{ width: '100%' }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <AgentSelectSnackMessage
        isVisible={showErrorSnack}
        hide={() => setShowErrorSnack(false)}
        message={showErrorSnack}
      />
      <div className="w-full overflow-auto h-[90%] flex flex-col justify-between">
        <div style={{ scrollbarWidth: 'none' }}>
          {/* header */}
          {/* <Header /> */}
          {/* <Image src="/assets/assignX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' /> */}
          {/* Body */}
          <div className="flex flex-col items-center p-0 w-full gap-3 px-4">
            {!titleRenderedInHeader && (
              <div
                className="mt-6 w-11/12 md:text-3xl text-lg font-[600]"
                style={{ textAlign: 'center' }}
              >
                {GetTitleBasedOnUserType()}
              </div>
            )}
            {!hideTitle && (
              <button
                className="mt-10 underline text-brand-primary"
                style={styles.inputStyle}
                onClick={handleCloseSellerKyc}
              >
                {`I don't need questions for sellers`}
              </button>
            )}
            <div
              className="flex flex-row items-center mt-4 rounded-xl p-1 gap-0 w-full h-10"
              style={{
                backgroundColor: '#F2F2F2',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
              role="tablist"
              aria-label="Seller KYC question type"
            >
              {KYCQuestionType.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={item.id === toggleClick}
                  className="flex-1 min-w-0 h-full rounded-lg font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all"
                  style={{
                    backgroundColor: item.id === toggleClick ? '#FFFFFF' : 'transparent',
                    color: item.id === toggleClick ? '#333333' : '#828282',
                    boxShadow: item.id === toggleClick ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  }}
                  onClick={(e) => handleToggleClick(item.id)}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {toggleClick === 1 ? (
              <div className="mt-8 w-full max-h-[37vh] overflow-auto scrollbar-track-transparent scrollbar-thin scrollbar-thumb-brand-primary">
                {needKYCQuestions.map((item, index) => (
                  <button
                    className="mb-4 border rounded-xl flex flex-row items-center justify-between px-4 w-full"
                    style={{
                      paddingTop: 16,
                      paddingBottom: 16,
                      minHeight: 60,
                      border: selectedNeedKYC.some(
                        (selectedItem) => selectedItem.id === item.id,
                      )
                        ? '2px solid hsl(var(--brand-primary))'
                        : '',
                      backgroundColor: selectedNeedKYC.some(
                        (selectedItem) => selectedItem.id === item.id,
                      )
                        ? 'hsl(var(--brand-primary) / 0.05)'
                        : '',
                    }}
                    key={index}
                    onClick={() => handleSelectNeedKYC(item)}
                  >
                    <div style={{ width: '90%', fontSize: 14 }} className="text-start">
                      {item.question}
                    </div>
                    <div
                      className="outline-none border-none flex items-center justify-center"
                      style={{ width: '10%' }}
                    >
                      <Checkbox
                        checked={selectedNeedKYC.some(
                          (selectedItem) => selectedItem.id === item.id,
                        )}
                        className="h-5 w-5"
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : toggleClick === 2 ? (
              <div className="mt-8 w-full max-h-[37vh] overflow-auto scrollbar-track-transparent scrollbar-thin scrollbar-thumb-brand-primary">
                {motivationKycQuestions.map((item, index) => (
                  <button
                    className="mb-4 border rounded-xl flex flex-row items-center justify-between px-4 w-full"
                    key={index}
                    onClick={() => handleSelectMotivationKYC(item)}
                    style={{
                      paddingTop: 16,
                      paddingBottom: 16,
                      minHeight: 60,
                      border: selectedMotivationKyc.some(
                        (selectedItem) => selectedItem.id === item.id,
                      )
                        ? '2px solid hsl(var(--brand-primary))'
                        : '',
                      backgroundColor: selectedMotivationKyc.some(
                        (selectedItem) => selectedItem.id === item.id,
                      )
                        ? 'hsl(var(--brand-primary) / 0.05)'
                        : '',
                    }}
                  >
                    <div style={{ width: '90%', fontSize: 14 }} className="text-start">
                      {item.question}
                    </div>
                    <div
                      className="outline-none border-none flex items-center justify-center"
                      style={{ width: '10%' }}
                    >
                      <Checkbox
                        checked={selectedMotivationKyc.some(
                          (selectedItem) => selectedItem.id === item.id,
                        )}
                        className="h-5 w-5"
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : toggleClick === 3 ? (
              <div className="mt-8 w-full max-h-[37vh] overflow-auto scrollbar-track-transparent scrollbar-thin scrollbar-thumb-brand-primary">
                {urgencyKycQuestions.map((item, index) => (
                  <button
                    className="mb-4 border rounded-xl flex flex-row items-center justify-between px-4 sm:h-[10vh] w-full"
                    key={index}
                    onClick={() => handleUrgencyKYC(item)}
                    style={{
                      border: selectedUrgencyKyc.some(
                        (selectedItem) => selectedItem.id === item.id,
                      )
                        ? '2px solid hsl(var(--brand-primary))'
                        : '',
                      backgroundColor: selectedUrgencyKyc.some(
                        (selectedItem) => selectedItem.id === item.id,
                      )
                        ? 'hsl(var(--brand-primary) / 0.05)'
                        : '',
                    }}
                  >
                    <div style={{ width: '90%', fontSize: 14 }} className="text-start">
                      {item.question}
                    </div>
                    <div
                      className="outline-none border-none flex items-center justify-center"
                      style={{ width: '10%' }}
                    >
                      <Checkbox
                        checked={selectedUrgencyKyc.some(
                          (selectedItem) => selectedItem.id === item.id,
                        )}
                        className="h-5 w-5"
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              ''
            )}

            {!addKYCQuestion && (
              <button
                className="mt-2 w-full outline-none border-none justify-start flex max-h-[37vh] overflow-auto scrollbar-track-transparent scrollbar-thin scrollbar-thumb-brand-primary text-brand-primary h-8 text-sm font-normal"
                onClick={handleAddKyc}
              >
                Add Question
              </button>
            )}
            {addKYCQuestion && (
              <div
                className="mt-3 w-full overflow-hidden rounded-[12px] bg-white"
                style={{
                  border: '1px solid #eaeaea',
                  boxShadow: 'none',
                }}
              >
                <div className="px-4 py-4">
                  <div className="text-[13px] font-medium text-black/70">
                    What’s the question?
                  </div>
                  <input
                    ref={newQuestionInputRef}
                    className="mt-2 h-[42px] w-full rounded-lg border border-black/10 bg-white px-3 text-[14px] font-normal text-black/80 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary"
                    placeholder="Ex: What's your name?"
                    value={newQuestion}
                    onChange={(e) => {
                      const input = e.target.value
                      const filtered = input.replace(/[{}\[\]<>]/g, '')
                      setNewQuestion(filtered)
                    }}
                  />

                  <div className="mt-3 flex flex-row items-center justify-end gap-2">
                    <button
                      type="button"
                      className="h-[40px] rounded-lg px-4 text-[14px] font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98]"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!newQuestion}
                      className="h-[40px] rounded-lg px-4 text-[14px] font-semibold bg-brand-primary text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98] disabled:bg-black/10 disabled:text-black"
                      onClick={handleAddKycQuestion}
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 flex flex-row justify-center py-3">
          {sellerKycLoader ? (
            <div className="flex flex-row justify-center">
              <CircularProgress />
            </div>
          ) : (
            <div className="w-full flex flex-row items-center justify-center py-3">
              <button
                className="bg-brand-primary text-white rounded-lg w-10/12 md:w-8/12 lg:w-6/12 h-10 min-h-[40px] font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={styles.headingStyle}
                onClick={handleAddNewKyc}
                disabled={!shouldSave}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddSellerKyc
