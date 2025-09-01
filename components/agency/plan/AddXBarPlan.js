import Apis from "@/components/apis/Apis";
import { Modal, Box, Switch, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { AuthToken } from "./AuthDetails";
import axios from "axios";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import Image from "next/image";
import { min } from "draft-js/lib/DefaultDraftBlockRenderMap";
// import { AiOutlineInfoCircle } from 'react-icons/ai';

export default function AddXBarPlan({
  open,
  handleClose,
  onPlanCreated,
  agencyPlanCost,
  isEditPlan,
  selectedPlan
}) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [minutes, setMinutes] = useState("");
  const [addPlanLoader, setAddPlanLoader] = useState(false);
  const [minCostErr, setMinCostErr] = useState(false);

  const [snackMsg, setSnackMsg] = useState(null);
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);

  const [snackBannerMsg, setSnackBannerMsg] = useState(null);
  const [snackBannerMsgType, setSnackBannerMsgType] = useState(SnackbarTypes.Error);

  //plan passed is
  const [planPassed, setPlanPassed] = useState(null);

  //check if is edit plan is true then store the predefault values
  useEffect(() => {
    console.log("Test log xbars")
    if (selectedPlan) {
      setPlanPassed(selectedPlan);
      console.log("Value of selected plan passed is", selectedPlan);
      setTitle(selectedPlan?.title);
      setTag(selectedPlan?.tag ?? "");
      setPlanDescription(selectedPlan?.planDescription);
      setOriginalPrice((selectedPlan?.discountedPrice / selectedPlan?.minutes).toFixed(2));
      const OriginalPrice = selectedPlan?.originalPrice
      if (OriginalPrice > 0) {
        setDiscountedPrice(OriginalPrice);
      }
      setMinutes(selectedPlan?.minutes);
    }
  }, [selectedPlan]);

  //auto check minCostError
  useEffect(() => {
    if (originalPrice && minutes) {
      const P = originalPrice / minutes;
      console.log("Calculated price is", P);
      if (P < agencyPlanCost) {
        const cal = originalPrice * minutes;
        setMinCostErr(true);
        // setSnackBannerMsg(`Price/min can't be less than ${agencyPlanCost.toFixed(2)} cents or more then ${minutes}`);
        setSnackBannerMsg(`Price/Min should be ${agencyPlanCost.toFixed(2)}$ or less than  ${originalPrice / agencyPlanCost.toFixed(2)}`);
        setSnackBannerMsgType(SnackbarTypes.Warning);
      } else if (P > agencyPlanCost) {
        setSnackBannerMsg(null);
        setMinCostErr(false);
      }
    }
  }, [minutes, originalPrice]);

  //profit text color
  const getClr = () => {
    const percentage =
      ((originalPrice - agencyPlanCost) / agencyPlanCost) * 100;

    if (percentage >= 0 && percentage <= 50) {
      return "#FF4E4E";
    } else if (percentage > 50 && percentage <= 75) {
      return "orange";
    } else if (percentage > 75 && percentage < 100) {
      return "yellow";
    } else if (percentage >= 100) {
      return "#01CB76";
    }
  };

  //reset values after plan added
  const handleResetValues = () => {
    setTitle("")
    setTag("")
    setPlanDescription("")
    setOriginalPrice("")
    setDiscountedPrice("")
    setMinutes("")
    setMinCostErr(false)
    setSnackMsg(null)
    setSnackMsgType(null)
    setAddPlanLoader(false);
  }

  //code to add plan
  const handleAddPlanClick = async () => {
    try {
      setAddPlanLoader(true);
      console.log("Working");

      const ApiPath = Apis.addXBarOptions;
      const Token = AuthToken();

      const formData = new FormData();
      formData.append("title", title);
      formData.append("tag", tag);
      formData.append("planDescription", planDescription);
      formData.append("originalPrice", discountedPrice || 0);
      formData.append("discountedPrice", originalPrice * minutes);
      if (discountedPrice > 0) {
        const percentage = (((discountedPrice - originalPrice) / discountedPrice) *
          100).toFixed(2);
        formData.append("percentageDiscount", percentage);
      } else {
        formData.append("percentageDiscount", 0)
      }
      formData.append("minutes", minutes);

      for (let [key, value] of formData.entries()) {
        console.log(`${key} = ${value}`);
      }

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + Token,
        },
      });

      if (response) {
        console.log("Response of add xbars api is", response.data);
        setAddPlanLoader(false);
        onPlanCreated(response);
        if (response.data.status === true) {
          //update the xbars state on localstorage to update checklist
          const localData = localStorage.getItem("User");
          if (localData) {
            let D = JSON.parse(localData);
            D.user.checkList.checkList.plansXbarAdded = true;
            localStorage.setItem("User", JSON.stringify(D));
          }
          window.dispatchEvent(new CustomEvent("UpdateAgencyCheckList", { detail: { update: true } }));

          setSnackMsg(response.data.message);
          handleResetValues()
          setSnackMsgType(SnackbarTypes.Success);
          handleClose(response.data.message);
        } else if (response.data.status === false) {
          setSnackMsg(response.data.message);
          setSnackMsgType(SnackbarTypes.Error);
        }
      }
    } catch (error) {
      setAddPlanLoader(false);
      console.error("Error is", error);
    } finally {
      setAddPlanLoader(false);
    }
  };

  //code to update plan
  const handleUpdatePlanClick = async () => {
    try {
      setAddPlanLoader(true);
      console.log("Working");

      // const ApiPath = Apis.addXBarOptions; //vincecamuto
      const url = `${Apis.updateAgencyXBar}/${planPassed.id}`;
      const Token = AuthToken();
      console.log("Url for udate ageny is", url);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("tag", tag);
      formData.append("planDescription", planDescription);
      formData.append("originalPrice", discountedPrice || 0);
      if (discountedPrice > 0) {
        const percentage = (((discountedPrice - originalPrice) / discountedPrice) *
          100).toFixed(2);
        formData.append("percentageDiscount", percentage);
      } else {
        formData.append("discountedPrice", 0);
      }
      formData.append(
        "percentageDiscount",
        100 - (originalPrice / discountedPrice) * 100
      );
      formData.append("minutes", minutes);

      const response = await axios.put(url, formData, {
        headers: {
          Authorization: "Bearer " + Token,
        },
      });

      if (response) {
        console.log("Response of add xbars api is", response.data);
        setAddPlanLoader(false);
        onPlanCreated(response);
        if (response.data.status === true) {
          //update the xbars state on localstorage to update checklist
          const localData = localStorage.getItem("User");
          if (localData) {
            let D = JSON.parse(localData);
            D.user.checkList.checkList.plansXbarAdded = true;
            localStorage.setItem("User", JSON.stringify(D));
          }
          window.dispatchEvent(new CustomEvent("UpdateAgencyCheckList", { detail: { update: true } }));

          setSnackMsg(response.data.message);
          setSnackMsgType(SnackbarTypes.Success);
          handleResetValues()
          handleClose(response.data.message);
        } else if (response.data.status === false) {
          setSnackMsg(response.data.message);
          setSnackMsgType(SnackbarTypes.Error);
        }
      }
    } catch (error) {
      setAddPlanLoader(false);
      console.error("Error is", error);
    } finally {
      setAddPlanLoader(false);
    }
  };

  const shouldContinue = () => {
    if (!title || !planDescription || !originalPrice || originalPrice === "0" || discountedPrice === "0" || minCostErr) {
      return true
      // || !tag|| minutes === "0"
    } else {
      return false
    }
  }

  const styles = {
    labels: {
      fontSize: "15px",
      fontWeight: "500",
      color: "#00000050",
    },
    inputs: {
      fontSize: "15px",
      fontWeight: "500",
      color: "#000000",
    },
    text: {
      fontSize: "15px",
      fontWeight: "500",
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
      borderRadius: "15px",
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
      // textDecoration: "line-through",
      color: "#7902DF",
      fontSize: 18,
      fontWeight: "600",
    },
    discountedPrice: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 22,
      // marginLeft: "10px",
    },
  };

  return (
    <Modal
      open={open}
    // onClose={() => {
    //   handleResetValues();
    //   handleClose("");
    // }}
    >
      {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
      <Box className="bg-white rounded-xl max-w-[80%] w-[95%] h-[90vh] border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col">
        <AgentSelectSnackMessage
          isVisible={snackMsg !== null}
          message={snackMsg}
          hide={() => {
            setSnackMsg(null);
          }}
          type={snackMsgType}
        />

        <AgentSelectSnackMessage
          isVisible={snackBannerMsg !== null}
          message={snackBannerMsg}
          hide={() => {
            // setSnackMsg(null);
          }}
          type={snackBannerMsgType}
        />

        <div className="w-full flex flex-row h-[100%] items-start">
          <div className="w-6/12 h-[100%] p-6">
            <div
              className="overflow-y-auto h-[90%] scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{isEditPlan ? "Edit Plan" : "New XBar Option"}</h2>
              </div>

              {/* Plan Name */}
              <label style={styles.labels}>XBar Name</label>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 rounded p-2 mb-4 mt-1 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                placeholder="Type here"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />

              {/* Tag Option */}
              <label style={styles.labels}>Tag</label>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1"
                placeholder="Popular, best deals"
                value={tag}
                onChange={(e) => {
                  setTag(e.target.value);
                }}
              />

              {/* Description */}
              <label style={styles.labels}>Description</label>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1"
                placeholder="Type here"
                value={planDescription}
                onChange={(e) => {
                  setPlanDescription(e.target.value);
                }}
              />

              <div className="w-full flex flex-row items-center gap-2">
                <div className="w-full">
                  {/* Price */}
                  <label style={styles.labels}>Price</label>
                  <div className={`border ${minCostErr ? "border-red" : "border-gray-200"} rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full`}>
                    <div className="" style={styles.inputs}>
                      $
                    </div>
                    <input
                      style={styles.inputs}
                      type="text"
                      className={`w-full border border-none outline-none focus:outline-none focus:ring-0 focus:border-none rounded`}
                      placeholder=""
                      value={originalPrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits and one optional period
                        const sanitized = value.replace(/[^0-9.]/g, '');

                        // Prevent multiple periods
                        const valid = sanitized.split('.').length > 2
                          ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                          : sanitized;
                        // if (valid === 0) {
                        //   setSnackMsg("Price cannot be zero");
                        //   setSnackMsgType(SnackbarTypes.Warning);
                        // }
                        setOriginalPrice(valid);
                      }}
                    />
                  </div>
                  {/*minCostErr && (
                    <div className="flex flex-row items-center gap-2 mb-4">
                      <Image
                        src={"/agencyIcons/InfoIcon.jpg"}
                        alt="info"
                        height={20}
                        width={20}
                      />
                      <p
                        className="flex items-center gap-1"
                        style={{ fontSize: "15px", fontWeight: "500" }}
                      >
                        Min cost per min is 20 cents
                      </p>
                    </div>
                  )*/}



                  {/* Strikethrough Price */}
                  <label style={styles.labels}>
                    Strikethrough Price (Optional)
                  </label>
                  <div className={`border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full`}>
                    <div className="" style={styles.inputs}>
                      $
                    </div>
                    <input
                      style={styles.inputs}
                      type="text"
                      className="w-full border border-none outline-none focus:outline-none focus:ring-0 focus:border-none rounded"
                      placeholder=""
                      value={discountedPrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits and one optional period
                        const sanitized = value.replace(/[^0-9.]/g, '');

                        // Prevent multiple periods
                        const valid = sanitized.split('.').length > 2
                          ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                          : sanitized;
                        setDiscountedPrice(valid);
                      }}
                    />
                  </div>

                  {/* Minutes */}
                  <label style={styles.labels}>Bonus Minutes</label>
                  <input
                    style={styles.inputs}
                    type="text"
                    className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1"
                    placeholder=""
                    value={minutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only digits and one optional period
                      const sanitized = value.replace(/[^0-9.]/g, '');

                      // Prevent multiple periods
                      const valid = sanitized.split('.').length > 2
                        ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                        : sanitized;
                      setMinutes(valid);
                    }}
                  />
                </div>


              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button
                disabled={addPlanLoader}
                onClick={() => {
                  handleResetValues();
                  handleClose("");
                }}
                className="text-purple-600 font-semibold border rounded-lg w-[12vw] text-center"
              >
                Cancel
              </button>
              {addPlanLoader ? (
                <CircularProgress size={30} />
              ) : (
                <button
                  className={` ${shouldContinue() ? "bg-[#00000050]" : "bg-purple "} w-[12vw] hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg`}
                  // onClick={handleAddPlanClick}
                  onClick={() => {
                    if (isEditPlan) {
                      handleUpdatePlanClick();
                    } else {
                      handleAddPlanClick();
                    }
                  }}
                  disabled={shouldContinue()}
                >
                  {isEditPlan ? "Update" : "Create Plan"}
                </button>
              )}
            </div>
          </div>

          <div
            className="w-6/12 h-full rounded-tr-xl rounded-br-xl"
            style={{
              backgroundImage: "url('/agencyIcons/addPlanBg4.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="p-6 flex flex-col items-center h-[100%]">
              <div className="flex justify-end w-full items-center h-[5%]">
                <button
                  // disabled={addPlanLoader}
                  onClick={() => {
                    handleResetValues();
                    handleClose("");
                  }}
                >
                  <Image
                    src={"/assets/cross.png"}
                    alt="*"
                    height={14}
                    width={14}
                  />
                </button>
              </div>
              {/*
                            (allowTrial && trialValidForDays) && (
                                <div className='w-11/12 rounded-t-xl bg-gradient-to-r from-[#7902DF] to-[#C502DF] px-4 py-2'>
                                    <div className='flex flex-row items-center gap-2'>
                                        <Image
                                            src={"/agencyIcons/batchIcon.jpg"}
                                            alt='*'
                                            height={24}
                                            width={24}
                                        />
                                        <div style={{ fontWeight: "600", fontSize: 18, color: "white" }}>
                                            First {trialValidForDays} Days Free
                                        </div>
                                    </div>
                                </div>
                            )
                        */}
              <div className="w-11/12 h-[80%] flex flex-col items-center justify-center">
                <div
                  className="px-4 py-1 pb-4"
                  style={{
                    ...styles.pricingBox,
                    border: "none",
                    backgroundColor: "white",
                  }}
                >
                  <div
                    style={{
                      ...styles.triangleLabel,
                      borderTopRightRadius: "15px",
                    }}
                  ></div>
                  {/* Triangle price here */}
                  {
                    discountedPrice && originalPrice && (
                      <span style={styles.labelText}>
                        {(
                          ((discountedPrice - originalPrice) / discountedPrice) *
                          100
                        ).toFixed(0) || "-"}
                        %
                      </span>
                    )
                  }
                  <div
                    className="flex flex-row items-start gap-3"
                    style={styles.content}
                  >
                    <div className="w-full">
                      <div className="flex flex-row items-center gap-3">
                        <div
                          style={{
                            color: "#151515",
                            fontSize: 22,
                            fontWeight: "600",
                          }}
                        >
                          {title || "XBar"} | {minutes || "Bonus Mins"}
                        </div>
                        {tag ? (
                          <div
                            className="rounded-full bg-purple text-white p-3 py-2"
                            style={{ fontSize: 14, fontWeight: "500" }}
                          >
                            {tag}
                          </div>
                        ) : (
                          <div className="rounded-md bg-gray-200 text-white w-[127px] h-[28px]" />
                        )}
                      </div>
                      <div className="flex flex-row items-center justify-between mt-2">
                        <div className="flex flex-col justify-start">
                          {planDescription ? (
                            <div
                              className=""
                              style={{
                                color: "#00000060",
                                fontSize: 15,
                                //   width: "60%",
                                fontWeight: "500",
                              }}
                            >
                              {planDescription}
                            </div>
                          ) : (
                            <div className="rounded-md bg-gray-200 text-white w-[150px] h-[32px]" />
                          )}
                        </div>
                        <div className="flex flex-row items-center gap-2">
                          {discountedPrice && (
                            <div style={styles.originalPrice} className="line-through">
                              ${discountedPrice}
                            </div>
                          )}
                          {originalPrice && (
                            <div className="flex flex-row justify-start items-start ">
                              <div style={styles.discountedPrice}>
                                ${originalPrice}
                              </div>
                              <p style={{ color: "#15151580" }}></p>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// <div>
//     <div className='flex flex-row items-center justify-between w-full'>
//         <div style={{ fontWeight: "600", fontSize: 38 }}>
//             {title ? (
//                 <div>
//                     {title}
//                 </div>
//             ) : "My Plan"}
//         </div>
//         {
//             tag ? (
//                 <div
//                     className='rounded-full bg-purple text-white p-3 py-2'
//                     style={styles.text}>
//                     {tag}
//                 </div>
//             ) : (
//                 <div
//                     className='rounded-md bg-white text-white w-[127px] h-[28px]' />
//             )
//         }
//     </div>
//     <div className={`mt-4 flex flex-row items-center ${(!originalPrice || !discountedPrice) && "gap-2"}`} style={{ fontSize: 30, fontWeight: "600" }}>
//         {
//             discountedPrice ? (
//                 <div className='line-through text-[#00000030]'>${discountedPrice}</div>
//             ) : (
//                 <div className='bg-white rounded-md w-[58px] h-[28px]' />
//             )
//         }
//         {
//             originalPrice ? (
//                 <div>${(originalPrice * minutes).toFixed(2)}</div>
//             ) : (
//                 <div className='bg-white rounded-md w-[58px] h-[28px]' />
//             )
//         }
//     </div>
//     <div className='mt-4 text-[#00000070]' style={styles.text}>
//         Minutes
//     </div>
//     <div className='mt-1 text-[#000000]' style={styles.text}>
//         {
//             minutes ? (
//                 <div>
//                     {minutes}
//                 </div>
//             ) : (
//                 <div className="bg-white w-full rounded-md h-[28px]" />
//             )
//         }
//     </div>
//     <div className='mt-4 text-[#00000070]' style={styles.text}>
//         Description
//     </div>
//     <div className='mt-1 text-[#000000]' style={styles.text}>
//         {
//             planDescription ? (
//                 <div>
//                     {planDescription}
//                 </div>
//             ) : (
//                 <div className="bg-white w-full rounded-md h-[28px]" />
//             )
//         }
//     </div>
// </div>
