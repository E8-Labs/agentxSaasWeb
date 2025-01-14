'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import getProfileDetails from '../apis/GetProfile';
import { UpdateProfile } from '../apis/UpdateProfile';
import Apis from '../apis/Apis';
import axios from 'axios';


function BasicInfo() {

  const router = useRouter();
  const [focusedName, setFocusedName] = useState(false);
  const [focusedFarm, setFocusedFarm] = useState(false);
  const [focusedBrokerage, setFocusedBrokerage] = useState(false);
  const [focusedTransaction, setFocusedTransaction] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);

  //my variable
  const [serviceId, setServiceId] = useState([]);
  const [servicesData, setServicesData] = useState([]);


  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [farm, setFarm] = useState("")
  const [transaction, setTransaction] = useState("")
  const [brokerAge, setBrokerAge] = useState("")
  const [phone, setPhone] = useState("")


  const [isNameChanged, setIsNameChanged] = useState(false)
  const [isTransactionChanged, setIsTransactionChange] = useState("")
  const [isFarmChanged, setIsFarmChanged] = useState(false)
  const [isBrokerageChanged, setIsBrokerageChanged] = useState(false)

  const [agentServices, setAgentServices] = useState([])
  const [agentAreasOfFocus, setAgentAreasOfFocus] = useState([])

  const [loading, setloading] = useState(false)
  const [loading2, setloading2] = useState(false)
  const [loading3, setloading3] = useState(false)
  const [loading4, setloading4] = useState(false)
  const [srviceLoader, setServiceLoader] = useState(false)
  const [areaLoading, setAreaLoading] = useState(false)

  const [selected, setSelected] = useState([])
  const [selectedArea, setSelectedArea] = useState([]);

  //code for image select and drag and drop
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragging, setDragging] = useState(false);



  const [originalSelectedArea, setOriginalSelectedArea] = useState([]); // To track initial state
  const [originalSelectedService, setOriginalSelectedService] = useState([]); // To track initial state



  //user details
  const [UserDetails, setUserDetails] = useState(null);

  //fetching the data
  useEffect(() => {
    const LocalData = localStorage.getItem("User");
    if (LocalData) {
      const userData = JSON.parse(LocalData);
      console.log("Should set data")
      setUserDetails(userData.user);
      setName(userData?.user?.name);
      setEmail(userData?.user?.email);
      setFarm(userData?.user?.farm);
      setTransaction(userData?.user?.averageTransactionPerYear);
      setBrokerAge(userData?.user?.brokerage);
      setPhone(userData?.user?.phone);

      // Initialize arrays to hold services and areas of focus
      const servicesArray = [];
      const focusAreasArray = [];

      // Pre-populate selected services and areas based on the user profile
      userData?.user?.services?.forEach(item => {
        servicesArray.push(item.agentService); // Add the full object or only IDs as needed
      });

      userData?.user?.focusAreas?.forEach(item => {
        focusAreasArray.push(item.areaOfFocus); // Add the full object or only IDs as needed
      });

      setServiceId(servicesArray);

      // Set default selected areas and services
      // setSelected(servicesArray); // Default select services
      setSelectedArea(focusAreasArray); // Default select areas of focus

      setOriginalSelectedArea(focusAreasArray); // Save the initial state
      setOriginalSelectedService(servicesArray)


    }

    getProfile();
  }, []);

  const hasAreaFocusChanged = () => {
    // if (selectedArea.length !== originalSelectedArea.length) return true;
    // return selectedArea.includes((id) => !originalSelectedArea.includes(id));
    return true
  };

  const hasServiceChanged = () => {
    // if (serviceId.length !== originalSelectedService.length)
    return true;
    // return serviceId.includes((id) => !originalSelectedService.includes(id));
  };


  //function to fetch the profile data
  const getProfile = async () => {
    try {

      await getProfileDetails();

    } catch (error) {
      console.error("Error occured in api is error", error);
    }
  }

  //function to handle image selection
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      let data = new FormData()

      data.append("profile_image", imageUrl)
    }
    setloading(true)
    await UpdateProfile(data)
    setSelectedImage(imageUrl);
    setloading(false)
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const areas = [
    {
      id: 1,
      heading: 'Commercial real estate',
      subHeading: 'Dealing with commercial real estate like offices, retail spaces, and industrial properties',

    }, {
      id: 2,
      heading: 'Residential real estate',
      subHeading: 'Buying and selling residential properties',

    }, {
      id: 3,
      heading: 'Investment property',
      subHeading: 'Helping clients invest in income-generating propertiesd) Selling high-end, luxury homes in exclusive areas',

    }, {
      id: 4,
      heading: 'Land broker',
      subHeading: 'Specializing in the sale of undeveloped land',

    }, {
      id: 5,
      heading: 'Sale associate',
      subHeading: 'Selling newly built homes for builders and developers',

    }, {
      id: 6,
      heading: 'Relocation consultant',
      subHeading: 'Assisting people with finding homes and moving when they relocate',

    }, {
      id: 7,
      heading: 'Real estate management',
      subHeading: 'Managing properties, including leasing and maintenance, for owners',

    },
  ]

  useEffect(() => {
    getAgentDefaultData()
  }, [])


  const getAgentDefaultData = async () => {
    try {
      setServiceLoader(true);
      let data = localStorage.getItem("User")
      if (data) {
        let d = JSON.parse(data)
        let AgentTypeTitle = d.user.userType
        console.log('AgentTypeTitle is', AgentTypeTitle)

        const ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`;
        console.log("Api link is:--", ApiPath);
        const response = await axios.get(ApiPath, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response) {
          console.log("Response of services api is : -----", response.data);
          setAgentServices(response.data.data.agentServices);
          setAgentAreasOfFocus(response.data.data.areaOfFocus)
        } else {
          alert(response.data.message)
        }
      }

    } catch (error) {
      setServiceLoader(false)
      console.error("ERror occured in default data api is :----", error);
    } finally {
      setServiceLoader(false);
    }
  }


  const handleNameSave = async () => {
    try {
      setloading(true)

      let data = {
        name: name
      }
      await UpdateProfile(data)
      setloading(false)
      setIsNameChanged(false)
    } catch (e) {
      console.log('error in updating', e)
    }
  }

  const handleFarmSave = async () => {
    try {
      setloading2(true)

      let data = {
        farm: farm
      }
      await UpdateProfile(data)
      setloading2(false)
      setIsFarmChanged(false)
    } catch (e) {
      console.log('error in updating', e)
    }
  }

  const handleBrokerAgeSave = async () => {
    try {
      setloading3(true)

      let data = {
        brokerage: brokerAge
      }
      await UpdateProfile(data)
      setloading3(false)
      setIsBrokerageChanged(false)
    } catch (e) {
      console.log('error in updating', e)
    }
  }

  const handleTransactionSave = async () => {
    try {
      setloading4(true)
      let data = {
        averageTransactionPerYear: transaction
      }
      await UpdateProfile(data)
      setloading4(false)

      setIsTransactionChange(false)
    } catch (e) {
      console.log('error in updating', e)
    }
  }


  // const handleServiceSelect = (item) => {
  // setSelected((prev) => {
  // const isSelected = prev.some((selectedItem) => selectedItem.id === item.id); // Check if the item is already selected

  // if (isSelected) {
  // // If already selected, remove the item from the array
  // return prev.filter((selectedItem) => selectedItem.id !== item.id);
  // } else {
  // // If not selected, add the full item to the array
  // return [...prev, item];
  // }
  // });
  // };

  const handleserviceId = (id) => {
    console.log("Id to ad is", id);
    console.log("Old is are", serviceId)
    let newIDs = [];
    if (serviceId.includes(id)) {
      // Unselect the item if it's already selected
      newIDs = serviceId.filter((prevId) => prevId !== id);
    } else {
      // Select the item if it's not already selected
      newIDs = [...serviceId, id];
    }

    setServiceId(newIDs);
    console.log("New array is", newIDs);
  }

  const handleAreaSelect = (id) => {
    console.log("Id to ad is", id);
    console.log("Old is are", selectedArea)
    let newIDs = []
    if (selectedArea.includes(id)) {
      // Unselect the item if it's already selected
      newIDs = selectedArea.filter((prevId) => prevId !== id);
    } else {
      // Select the item if it's not already selected
      newIDs = [...selectedArea, id];
    }
    setSelectedArea(newIDs);
    console.log("New array is", newIDs)
    return
    setSelectedArea((prevIds) => {
      if (prevIds.includes(id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, id];
      }
    })

  };

  useEffect(() => {
    console.log('selected', selected)
  }, [selected])


  const handleAreaChange = async () => {
    try {
      setAreaLoading(true)
      let data = {
        areaOfFocus: selectedArea //[selectedArea.join()]
      }
      console.log('data is', data)

      // return
      await UpdateProfile(data)
      setOriginalSelectedArea([...selectedArea]);
      setAreaLoading(false)
    } catch (e) {
      console.log('error in updating', e)
    }
  }

  const handleServiceChange = async () => {
    try {
      setServiceLoader(true)
      let data = {
        agentService: serviceId//[serviceId.join()]
      }
      console.log('Api data is', serviceId)

      // return
      await UpdateProfile(data)
      setOriginalSelectedService([...serviceId]);
      setServiceLoader(false)
    } catch (e) {
      console.log('error in updating', e)
    }
  }



  return (
    <div className='w-full flex flex-col items-start px-8 py-2' style={{ paddingBottom: '50px', height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}>

      <div className='w-full flex flex-row items-center justify-between'>
        <div>
          <div style={{ fontSize: 22, fontWeight: "700", color: '#000' }}>
            Basic Information
          </div>

          <div style={{ fontSize: 12, fontWeight: "500", color: '#00000090' }}>
            {"Account > Basic Information"}
          </div>
        </div>
        <div>
          <button className='text-red text-start mt-4 bg-[#FF4E4E40] px-3 py-1 rounded-3xl' style={{ fontWeight: "600", fontSize: 17 }} onClick={() => {
            localStorage.clear();
            // localStorage.removeItem("User");
            // localStorage.removeItem("localAgentDetails");
            if (typeof document !== "undefined") {
              document.cookie = "User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
            router.push("/");
          }}>
            Log Out
          </button>
        </div>
      </div>


      <button
        className='mt-8'
        onClick={() => {
          if (typeof document !== "undefined") {
            document.getElementById("fileInput").click()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className='flex flex-row items-end'
          style={{
            // border: dragging ? "2px dashed #0070f3" : "",
          }}
        >

          {selectedImage ? (
            <div style={{ marginTop: "20px" }}>
              <Image src={selectedImage}
                height={74}
                width={74}
                style={{ borderRadius: '50%' }}
                alt='profileImage'
              />
            </div>
          ) : (
            <Image src={'/agentXOrb.gif'}
              height={74}
              width={74}
              alt='profileImage'
            />
          )
          }

          <Image src={'/otherAssets/cameraBtn.png'}
            style={{ marginLeft: -25 }}
            height={36}
            width={36}
            alt='profileImage'
          />
        </div>
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh" }}>
        Full Name
      </div>


      <div
        className='flex items-center rounded-lg px-3 py-2 w-6/12 mt-5'
        style={{
          border: `1px solid ${focusedName ? "#8a2be2" : '#00000010'}`, transition: "border-color 0.3s ease",
        }}
      >
        <input
          className='w-11/12 outline-none focus:ring-0'
          onFocus={() => setFocusedName(true)}
          onBlur={() => setFocusedName(false)}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setIsNameChanged(true)
          }}
          type="text"
          placeholder="Name"
          style={{ border: '0px solid #7902DF', outline: "none" }}
        />
        {
          isNameChanged && (
            loading ? (
              <CircularProgress size={20} />
            ) : (
              <button onClick={async () => { handleNameSave() }}
                style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>
                Save
              </button>
            ))
        }
      </div>

      <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh" }}>
        Farm
      </div>


      <div
        className='flex items-center rounded-lg px-3 py-2 w-6/12 mt-5'
        style={{
          border: `1px solid ${focusedFarm ? "#8a2be2" : '#00000010'}`, transition: "border-color 0.3s ease",
        }}
      >
        <input
          className='w-11/12 outline-none focus:ring-0'
          onFocus={() => setFocusedFarm(true)}
          onBlur={() => setFocusedFarm(false)}
          value={farm}
          onChange={(event) => {
            setFarm(event.target.value)
            setIsFarmChanged(true)

          }}
          type="text"
          placeholder="Farm"
          style={{ border: '0px solid #000000', outline: "none" }}
        />
        {
          isFarmChanged && (
            loading2 ? (
              <CircularProgress size={20} />
            ) : (
              <button onClick={async () => { handleFarmSave() }}
                style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>
                Save
              </button>
            ))
        }
      </div>


      <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh" }}>
        Brokerage
      </div>


      <div
        className='flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 '
        style={{
          border: `1px solid ${focusedBrokerage ? "#8a2be2" : '#00000010'}`, transition: "border-color 0.3s ease",
        }}
      >
        <input
          className='w-11/12 outline-none focus:ring-0'
          onFocus={() => setFocusedBrokerage(true)}
          onBlur={() => setFocusedBrokerage(false)}
          value={brokerAge}
          onChange={(event) => {
            setBrokerAge(event.target.value)
            setIsBrokerageChanged(true)
          }}
          type="text"
          placeholder="Brokerage"
          style={{ border: '0px solid #000000', outline: "none" }}
        />
        {
          isBrokerageChanged && (
            loading3 ? (
              <CircularProgress size={20} />
            ) : (
              <button onClick={async () => { handleBrokerAgeSave() }}
                style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>
                Save
              </button>
            ))

        }
      </div>


      <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh" }}>
        Average transaction volume per year
      </div>


      <div
        className='flex items-center rounded-lg px-3 py-2 w-6/12 mt-5'
        style={{
          border: `1px solid ${focusedTransaction ? "#8a2be2" : '#00000010'}`, transition: "border-color 0.3s ease",
        }}
      >
        <input
          type='number'
          className='w-11/12 outline-none focus:ring-0'
          onFocus={() => setFocusedTransaction(true)}
          onBlur={() => setFocusedTransaction(false)}
          value={transaction}
          onChange={(event) => {
            setTransaction(event.target.value)
            setIsTransactionChange(true)
          }}
          placeholder="Value"
          style={{ border: '0px solid #000000', outline: "none" }}
        />
        {
          isTransactionChanged && (
            loading4 ? (
              <CircularProgress size={20} />
            ) : (
              <button onClick={async () => {

                handleTransactionSave()
              }}
                style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>
                Save
              </button>
            ))
        }
      </div>


      <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh" }}>
        Email address
      </div>
      <div
        className='flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0'
        style={{
          border: `1px solid ${focusedEmail ? "#8a2be2" : '#00000010'}`, transition: "border-color 0.3s ease",
        }}
      >
        <input
          readOnly
          className='w-11/12 outline-none focus:ring-0'
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
          }}
          type="text"
          placeholder="Email"
          style={{ border: '0px solid #000000', outline: "none" }}
        />
        {/* {
 email.length > 0 && (
 <button style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>Save</button>
 )
 } */}
      </div>

      <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh" }}>
        Phone number
      </div>
      <div
        className='flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0'
        style={{
          border: `1px solid ${focusedEmail ? "#8a2be2" : '#00000010'}`, transition: "border-color 0.3s ease",
        }}
      >
        <input
          readOnly
          className='w-11/12 outline-none focus:ring-0'
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={phone}
          onChange={(event) => {
            // setEmail(event.target.value)
          }}
          type="text"
          placeholder="Email"
          style={{ border: '0px solid #000000', outline: "none" }}
        />


      </div>


      <div className='w-full flex flex-row items-center justify-between'>
        <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh", marginBottom: '2vh' }}>
          What would you like Agentx to help you with
        </div>
        {
          serviceId.length > 0 && hasServiceChanged() && (
            srviceLoader
              ? (
                <CircularProgress size={20} />
              ) : (
                <button onClick={async () => { handleServiceChange() }}
                  style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>
                  Save
                </button>
              ))
        }
      </div>

      <div className='w-9/12 flex flex-row flex-wrap gap-2'>
        {
          agentServices.map((item, index) => (
            <div key={index} className='w-5/12 p-4 flex flex-col gap-2 items-start rounded-2xl'
              style={{
                borderWidth: 2, borderColor: serviceId.includes(item.id) ? '#7902DF' : '#00000008',
                backgroundColor: serviceId.includes(item.id) ? '#7902DF05' : 'transparent', cursor: 'pointer'
              }}

              onClick={() => {
                handleserviceId(item.id)
              }}
            >

              <div style={{ fontSize: 15, fontWeight: '700' }}>
                {item.title}
              </div>

              <div style={{ fontSize: 14, fontWeight: '500' }}>
                {item.description}
              </div>
              <Image src={serviceId.includes(item.id) ? '/otherAssets/selectedTickBtn.png' : "/otherAssets/unselectedTickBtn.png"}
                height={24}
                width={24}
                alt='icon'
                style={{ alignSelf: 'flex-end' }}
              />
            </div>
          ))
        }


      </div>

      <div className='w-full flex flex-row items-center justify-between'>

        <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh", marginBottom: '2vh' }}>
          What area of real estate do you focus on?
        </div>
        {
          selectedArea.length > 0 && hasAreaFocusChanged() && (
            areaLoading
              ? (
                <CircularProgress size={20} />
              ) : (
                <button onClick={async () => { handleAreaChange() }}
                  style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>
                  Save
                </button>
              ))
        }

      </div>


      <div className='w-9/12 flex flex-row flex-wrap gap-2 '>
        {
          agentAreasOfFocus.map((item, index) => (
            <div key={index} className='w-5/12 p-4 flex flex-col justify-betweeen items-start rounded-2xl'
              style={{
                borderWidth: 2, borderColor: selectedArea.includes(item.id) ? '#7902DF' : '#00000008',
                backgroundColor: selectedArea.includes(item.id) ? '#7902DF05' : 'transparent', cursor: 'pointer'
              }}
              onClick={() => {
                handleAreaSelect(item.id)
              }}
            >

              <div style={{ fontSize: 15, fontWeight: '700' }}>
                {item.title}
              </div>

              <div style={{ fontSize: 14, fontWeight: '500' }}>
                {item.description}
              </div>
              <Image src={selectedArea.includes(item.id) ? '/otherAssets/selectedTickBtn.png' : "/otherAssets/unselectedTickBtn.png"}
                height={24}
                width={24}
                alt='icon'
                style={{ alignSelf: 'flex-end' }}
              />
            </div>
          ))
        }


      </div>


    </div>
  )
}

export default BasicInfo