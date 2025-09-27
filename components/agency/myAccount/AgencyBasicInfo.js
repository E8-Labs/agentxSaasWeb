"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import getProfileDetails from "@/components/apis/GetProfile";
import { UpdateProfile } from "@/components/apis/UpdateProfile";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import { UserTypes } from "@/constants/UserTypes";

function AgencyBasicInfo({
  selectedAgency
}) {
  const router = useRouter();

  const [serviceLoader, setServiceLoader] = useState(false);

  const [focusedName, setFocusedName] = useState(false);

  const [focusedEmail, setFocusedEmail] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [isNameChanged, setIsNameChanged] = useState(false);

  const [loading, setloading] = useState(false);

  const [loading5, setloading5] = useState(false);



  const [selectedImage, setSelectedImage] = useState("");
  const [dragging, setDragging] = useState(false);


  const [websiteUrl, setWebsiteUrl] = useState("")

  const [company, setCompany] = useState("")
  const [minSize, setMinSize] = useState("")
  const [maxSize, setMaxSize] = useState("")

  const sizeList = [
    { label: "1-10", min: 1, max: 10 },
    { label: "11-50", min: 11, max: 50 },
    { label: "51-100", min: 51, max: 100 },
    { label: "100+", min: 101, max: 1000 }, // You can set a reasonable upper bound
  ];




  //fetching the data
  useEffect(() => {
    const LocalData = localStorage.getItem("User");
    if (selectedAgency) {
      const agencyData = localStorage.getItem("AdminProfileData");
      if (agencyData) {
        const data = JSON.parse(agencyData)
        setValues(data)
      }
    } else {
      if (LocalData) {
        const userData = JSON.parse(LocalData);
        console.log("user data is:", userData)
        const data = userData?.user
        setValues(data);
      }
    }

    getProfile();
  }, []);

  const setValues = (data) => {
    console.log("Data passed for values are", data);
    setName(data.name);
    setSelectedImage(data.thumb_profile_image);
    setEmail(data.email);

    setPhone(data.phone);

    setCompany(data.company);
    // setProjectSize(data.projectSizeKw);
    setWebsiteUrl(data.website);
    setMinSize(data.companySizeMin);
    setMaxSize(data.companySizeMax);
  }

  const uploadeImage = async (imageUrl) => {
    try {
      const data = localStorage.getItem("User");
      if (data) {
        let u = JSON.parse(data);
        const apidata = new FormData();

        apidata.append("media", imageUrl);
        if (selectedAgency) {
          apidata.append("userId", selectedAgency.id);
        }

        // //console.log;
        for (let pair of apidata.entries()) {
          // //console.log; // Debug FormData contents
        }
        let path = Apis.updateProfileApi;

        // //console.log;
        // //console.log;
        // return
        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          if (response.data.status === true) {
            // //console.log;
            u.user = response.data.data;

            //// //console.log
            localStorage.setItem("User", JSON.stringify(u));
            // //console.log;
            window.dispatchEvent(
              new CustomEvent("UpdateProfile", { detail: { update: true } })
            );
            return response.data.data;
          }
        }
      }
    } catch (e) {
      // //console.log;
    }
  };

  //function to fetch the profile data
  const getProfile = async () => {
    try {
      await getProfileDetails(selectedAgency);
    } catch (error) {
      // console.error("Error occured in api is error", error);
    }
  };

  //function to handle image selection
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setloading5(true);
      const imageUrl = URL.createObjectURL(file); // Generate preview URL

      setSelectedImage(imageUrl); // Set the preview image

      uploadeImage(file);
    } catch (error) {
      // console.error("Error uploading image:", error);
    } finally {
      setloading5(false);
    }
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
      heading: "Commercial real estate",
      subHeading:
        "Dealing with commercial real estate like offices, retail spaces, and industrial properties",
    },
    {
      id: 2,
      heading: "Residential real estate",
      subHeading: "Buying and selling residential properties",
    },
    {
      id: 3,
      heading: "Investment property",
      subHeading:
        "Helping clients invest in income-generating propertiesd) Selling high-end, luxury homes in exclusive areas",
    },
    {
      id: 4,
      heading: "Land broker",
      subHeading: "Specializing in the sale of undeveloped land",
    },
    {
      id: 5,
      heading: "Sale associate",
      subHeading: "Selling newly built homes for builders and developers",
    },
    {
      id: 6,
      heading: "Relocation consultant",
      subHeading:
        "Assisting people with finding homes and moving when they relocate",
    },
    {
      id: 7,
      heading: "Real estate management",
      subHeading:
        "Managing properties, including leasing and maintenance, for owners",
    },
  ];

  useEffect(() => {
    getAgentDefaultData();
  }, []);

  const getAgentDefaultData = async () => {
    try {
      setServiceLoader(true);
      let data = localStorage.getItem("User");
      if (data) {
        let d = JSON.parse(data);
        let AgentTypeTitle = d.user.userType;
        // //console.log;

        let ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`;
        if (selectedAgency) {
          ApiPath = ApiPath + `?userId=${selectedAgency.id}`
        }
        console.log("Get agency default api", ApiPath);
        const response = await axios.get(ApiPath, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response) {
          //console.log;
          setAgentServices(response.data.data.agentServices);
          setAgentAreasOfFocus(response.data.data.areaOfFocus);
          setAgentIndustries(response.data.data.userIndustry);
        } else {
          alert(response.data.message);
        }
      }
    } catch (error) {
      setServiceLoader(false);
      // console.error("ERror occured in default data api is :----", error);
    } finally {
      setServiceLoader(false);
    }
  };

  const handleNameSave = async () => {
    try {
      setloading(true);
      const data = { name: name };
      await UpdateProfile(data);
      setloading(false);
      setIsNameChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2"
      style={{
        paddingBottom: "50px",
        height: "100%",
        overflow: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div className="w-full flex flex-row items-center justify-between">
        <div>
          <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
            Basic Information
          </div>

          <div style={{ fontSize: 12, fontWeight: "500", color: "#00000090" }}>
            {"Account > Basic Information"}
          </div>
        </div>
        <div>
          <button
            className="text-red text-start mt-4 bg-[#FF4E4E40] px-3 py-1 rounded-3xl"
            style={{ fontWeight: "600", fontSize: 17 }}
            onClick={() => {
              localStorage.clear();
              // localStorage.removeItem("User");
              // localStorage.removeItem("localAgentDetails");
              if (typeof document !== "undefined") {
                document.cookie =
                  "User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              }
              // router.push("/");
              window.location.href = "/";
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <button
        className="mt-8"
        onClick={() => {
          if (typeof document !== "undefined") {
            document.getElementById("fileInput").click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {loading5 ? (
          <CircularProgress size={20} />
        ) : (
          <div
            className="flex flex-row items-end"
            style={
              {
                // border: dragging ? "2px dashed #0070f3" : "",
              }
            }
          >
            {selectedImage ? (
              <div style={{ marginTop: "20px" }}>
                <Image
                  src={selectedImage}
                  height={74}
                  width={74}
                  // layout="intrinsic"
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  alt="profileImage"
                />
              </div>
            ) : (
              <Image
                src={"/agentXOrb.gif"}
                height={74}
                width={74}
                alt="profileImage"
              />
            )}

            <Image
              src={"/otherAssets/cameraBtn.png"}
              style={{ marginLeft: -25 }}
              height={36}
              width={36}
              alt="profileImage"
            />
          </div>
        )}
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Full Name
      </div>

      <div
        className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
        style={{
          border: `1px solid ${focusedName ? "#8a2be2" : "#00000010"}`,
          transition: "border-color 0.3s ease",
        }}
      >
        <input
          className="w-11/12 outline-none focus:ring-0"
          onFocus={() => setFocusedName(true)}
          onBlur={() => setFocusedName(false)}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setIsNameChanged(true);
          }}
          type="text"
          placeholder="Name"
          style={{ border: "0px solid #7902DF", outline: "none" }}
        />
        {isNameChanged &&
          (loading ? (
            <CircularProgress size={20} />
          ) : (
            <button
              onClick={async () => {
                handleNameSave();
              }}
              style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
            >
              Save
            </button>
          ))}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Email address
      </div>
      <div
        className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0"
        style={{
          border: `1px solid ${focusedEmail ? "#8a2be2" : "#00000010"}`,
          transition: "border-color 0.3s ease",
        }}
      >
        <input
          readOnly
          className="w-11/12 outline-none focus:ring-0"
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          type="text"
          placeholder="Email"
          style={{ border: "0px solid #000000", outline: "none" }}
        />
        {/* {
 email.length > 0 && (
 <button style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>Save</button>
 )
 } */}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Phone number
      </div>
      <div
        className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0"
        style={{
          border: `1px solid ${focusedEmail ? "#8a2be2" : "#00000010"}`,
          transition: "border-color 0.3s ease",
        }}
      >
        <input
          readOnly
          className="w-11/12 outline-none focus:ring-0"
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={phone}
          onChange={(event) => {
            // setEmail(event.target.value)
          }}
          type="text"
          placeholder="Email"
          style={{ border: "0px solid #000000", outline: "none" }}
        />
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Company
      </div>
      <div
        className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0"
        style={{
          border: `1px solid `,
          transition: "border-color 0.3s ease",
          border: `1px solid ${"#00000010"}`,
        }}
      >
        <input
          // readOnly
          className="w-11/12 outline-none focus:ring-0"
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={company}
          onChange={(event) => {
            setCompany(event.target.value)
          }}
          type="text"
          placeholder="Email"
          style={{ border: "0px solid #000000", outline: "none" }}
        />
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Website
      </div>
      <div
        className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0"
        style={{
          border: `1px solid`,
          transition: "border-color 0.3s ease",
          border: `1px solid ${"#00000010"}`,
        }}
      >
        <input
          // readOnly
          className="w-11/12 outline-none focus:ring-0"
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={websiteUrl}
          onChange={(event) => {
            setWebsiteUrl(event.target.value)
          }}
          type="text"
          placeholder="Website"
          style={{ border: "0px solid #000000", outline: "none" }}
        />
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Company Size
      </div>

      <div className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5">
        <select
          className="w-full p-2 border border-[#00000020] rounded-md outline-none"
          value={`${minSize}-${maxSize}`}
          onChange={(e) => {
            const [min, max] = e.target.value.split("-");
            setMinSize(parseInt(min));
            setMaxSize(parseInt(max));
          }}
        >
          <option value="">Select company size</option>
          {sizeList.map((size) => (
            <option key={size.label} value={`${size.min}-${size.max}`}>
              {size.label}
            </option>
          ))}
        </select>
      </div>


    </div>
  );
}

export default AgencyBasicInfo;

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: "600",
  },
};
