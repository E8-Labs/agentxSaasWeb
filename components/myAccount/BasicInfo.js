'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { TextField, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import getProfileDetails from '../apis/GetProfile';


function BasicInfo() {

  const router = useRouter();
  const [focusedName, setFocusedName] = useState(false);
  const [focusedFarm, setFocusedFarm] = useState(false);
  const [focusedBrokerage, setFocusedBrokerage] = useState(false);
  const [focusedTransaction, setFocusedTransaction] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);


  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [farm, setFarm] = useState("")
  const [transaction, setTransaction] = useState("")
  const [brokerAge, setBrokerAge] = useState("")
  const [phone, setPhone] = useState("")

  const [selected, setSelected] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null);

  //code for image select and drag and drop
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragging, setDragging] = useState(false);

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
    }
    getProfile();
  }, []);

  //function to fetch the profile data
  const getProfile = async () => {
    try {

      await getProfileDetails();

    } catch (error) {
      console.error("Error occured in api is error", error);
    }
  }

  //function to handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleDrop = (event) => {
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

  const agentHelps = [
    {
      id: 1,
      heading: 'Qualify Buyers & Sellers',
      subHeading: 'Determine if the person is a qualified buyer/seller, if pre-qualified, or working with agent.',

    }, {
      id: 2,
      heading: 'Follow up and Nurture',
      subHeading: 'Engage in conversation to build a dialogue with customers.',

    }, {
      id: 3,
      heading: 'Property Search & Selection',
      subHeading: 'Provide access to properties matching the criteria and arrange property viewings.',

    }, {
      id: 4,
      heading: 'Financing Assistance',
      subHeading: 'Assist in providing mortgage financing insights. Provide information on available financing options.',

    }, {
      id: 5,
      heading: 'Market Analysis & Advice',
      subHeading: 'Offer insights into market trends and property values. Provide advice on the local property market.',

    }, {
      id: 6,
      heading: 'Property Valuation & Pricing Strategy',
      subHeading: 'Conduct a Comparative Market Analysis (CMA) to determine the market value.',

    }, {
      id: 7,
      heading: 'Customer Service',
      subHeading: 'Keep clients informed throughout the process. Address questions and concerns promptly.',

    }, {
      id: 8,
      heading: 'Closing Assistance',
      subHeading: 'Ensure all necessary documents and steps are taken to a close the deal in a proper fashion.',

    },
  ]

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
            // localStorage.clear();
            localStorage.removeItem("User");
            localStorage.removeItem("localAgentDetails");
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
        onClick={() => document.getElementById("fileInput").click()}
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
          }}
          type="text"
          placeholder="Name"
          style={{ border: '0px solid #7902DF', outline: "none" }}
        />
        {
          name.length > 0 && (
            <button style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>Save</button>
          )
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
          }}
          type="text"
          placeholder="Farm"
          style={{ border: '0px solid #000000', outline: "none" }}
        />
        {
          farm.length > 0 && (
            <button style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>Save</button>
          )
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
          }}
          type="text"
          placeholder="Brokerage"
          style={{ border: '0px solid #000000', outline: "none" }}
        />
        {
          brokerAge.length > 0 && (
            <button style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>Save</button>
          )
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
          className='w-11/12 outline-none focus:ring-0'
          onFocus={() => setFocusedTransaction(true)}
          onBlur={() => setFocusedTransaction(false)}
          value={transaction}
          onChange={(event) => {
            setTransaction(event.target.value)
          }}
          type="text"
          placeholder="Value"
          style={{ border: '0px solid #000000', outline: "none" }}
        />
        {
          transaction.length > 0 && (
            <button style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>Save</button>
          )
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
          className='w-11/12 outline-none focus:ring-0'
          onFocus={() => setFocusedEmail(true)}
          onBlur={() => setFocusedEmail(false)}
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
        className='flex items-center rounded-lg px-3 py-2 w-6/12 mt-5'
      // style={{
      //   border: `1px solid ${focusedEmail ? "#8a2be2" : '#00000010'}`, transition: "border-color 0.3s ease",
      // }}
      >
        <input
          className='w-11/12'
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value)
          }}
          type="text"
          placeholder="Phone"
          style={{ border: 'none', outline: "none" }}
        />
        {/* {
          email.length > 0 && (
            <button style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>Save</button>
          )
        } */}
      </div>

      <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh", marginBottom: '2vh' }}>
        What would you like Agentx to help you with
      </div>


      <div className='w-9/12 flex flex-row flex-wrap gap-2'>
        {
          agentHelps.map((item) => (
            <div key={item.id} className='w-5/12 p-4 flex flex-col gap-2 items-start rounded-2xl'
              style={{
                borderWidth: 2, borderColor: selected?.id === item.id ? '#7902DF' : '#00000008',
                backgroundColor: selected?.id === item.id ? '#7902DF05' : 'transparent', cursor: 'pointer'
              }}

              onClick={() => {
                setSelected(item)
              }}
            >

              <div style={{ fontSize: 15, fontWeight: '700' }}>
                {item.heading}
              </div>

              <div style={{ fontSize: 14, fontWeight: '500' }}>
                {item.subHeading}
              </div>
              <Image src={selected?.id === item.id ? '/otherAssets/selectedTickBtn.png' : "/otherAssets/unSelectedTickBtn.png"}
                height={24}
                width={24}
                alt='icon'
                style={{ alignSelf: 'flex-end' }}
              />
            </div>
          ))
        }


      </div>

      <div style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: "4vh", marginBottom: '2vh' }}>
        What area of real estate do you focus on?
      </div>


      <div className='w-9/12 flex flex-row flex-wrap gap-2  '>
        {
          areas.map((item) => (
            <div key={item.id} className='w-5/12 p-4 flex flex-col justify-betweeen items-start rounded-2xl'
              style={{
                borderWidth: 2, borderColor: selectedArea?.id === item.id ? '#7902DF' : '#00000008',
                backgroundColor: selectedArea?.id === item.id ? '#7902DF05' : 'transparent', cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedArea(item)
              }}
            >

              <div style={{ fontSize: 15, fontWeight: '700' }}>
                {item.heading}
              </div>

              <div style={{ fontSize: 14, fontWeight: '500' }}>
                {item.subHeading}
              </div>
              <Image src={selectedArea?.id === item.id ? '/otherAssets/selectedTickBtn.png' : "/otherAssets/unSelectedTickBtn.png"}
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