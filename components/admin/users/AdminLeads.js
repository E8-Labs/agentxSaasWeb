import React, { useEffect } from 'react'
import Image from 'next/image';
import axios from 'axios';
import Apis from '../../apis/Apis';
import AdminUsers from './AdminUsers';

function AdminLeads({selectedUser}) {

    useEffect(()=>{
        getLeads()
    },[])

    const getLeads = async () => {
        try {
            let data = localStorage.getItem("User")
            if (data) {
                console.log("selected user id",selectedUser.id);
                let d = JSON.parse(data)
    
                let ApiPath = Apis.getLeads;
                ApiPath = ApiPath + "?userId=" + selectedUser.id
                console.log('apiPath', ApiPath)
    
                // return
                const response = await axios.get(ApiPath, {
                    headers: {
                        Authorization: "Bearer " + d.token,
                        // "Content-Type": "application/json"
                    },
                });
    
                if (response) {
                    if (response.data.status === true) {
    
                        console.log('leads are', response.data.data)
                    }else{
                        console.log('leads are', response.data.data)
    
                    }
                }
            }
    
    
            // }
    
        } catch (error) {
            console.error("Error occured in get leads api is :", error);
        } finally {
            // setSheetsLoader(false);
            ////console.log("ApiCall completed");
        }
    };

    return (
        <div className="w-full flex flex-col items-center bg-white">
            <div
                className="flex flex-row items-center justify-between w-full px-10 mt-2"
            >
                <div style={{ fontWeight: "600", fontSize: 24 }}>Leads</div>
                {/* <div className="flex fex-row items-center gap-6">
          <button
            style={{
              backgroundColor: toggleClick.length > 0 ? "#7902DF" : "",
              color: toggleClick.length > 0 ? "white" : "#000000",
            }}
            className="flex flex-row items-center gap-4 h-[50px] rounded-lg bg-[#33333315] w-[189px] justify-center"
            onClick={() => {
              if (userLocalData.plan) {
                setAssignLeadModal(true);
              } else {
                setSnackMessage("Add payment method to continue");
                setShowSnackMessage(true);
                setMessageType(SnackbarTypes.Warning);
              }
            }}
            disabled={!toggleClick.length > 0}
          >
            {toggleClick.length > 0 ? (
              <Image
                src={"/assets/callBtnFocus.png"}
                height={17}
                width={17}
                alt="*"
              />
            ) : (
              <Image
                src={"/assets/callBtn.png"}
                height={17}
                width={17}
                alt="*"
              />
            )}
            <span style={styles.heading}>Start Calling</span>
          </button>
          <div className="flex flex-col">
            <NotficationsDrawer />
          </div>
        </div> */}
            </div>


            <div className="flex flex-row items-center justify-between w-full mt-4 w-full">
                <div className="flex flex-row items-center gap-4 overflow-none flex-shrink-0 w-[90%]">
                    <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border rounded pe-2">
                        <input
                            style={styles.paragraph}
                            className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0"
                            placeholder="Search by name, email or phone"
                            value={""}
                            // onChange={(e) => {
                            //     const value = e.target.value;
                            //     setSearchLead(e.target.value);
                            //     handleSearchChange(value);
                            // }}
                        />
                        <button className="outline-none border-none">
                            <Image
                                src={"/assets/searchIcon.png"}
                                height={24}
                                width={24}
                                alt="*"
                            />
                        </button>
                    </div>
                    <button
                        className="outline-none flex-shrink-0"
                        onClick={() => {
                            // setShowFilterModal(true);
                        }}
                    >
                        <Image
                            src={"/assets/filterIcon.png"}
                            height={16}
                            width={16}
                            alt="*"
                        />
                    </button>
                    {/* Show filters here in a row*/}
                    {/* <div
                        className="flex flex-row items-center gap-4 flex-shrink-0 overflow-auto w-[70%] "
                        style={{
                            scrollbarColor: "#00000000",
                            scrollbarWidth: "none",
                        }}
                    >
                        {filtersSelected.map((filter, index) => {
                            ////console.log("Showing Filter ", filter);
                            return (
                                <div className="flex-shrink-0" key={filter.key + index}>
                                    <div
                                        className="px-4 py-2 bg-[#402FFF10] text-purple  flex-shrink-0 [#7902DF10] rounded-[25px] flex flex-row items-center gap-2"
                                        style={{ fontWeight: "500", fontSize: 15 }}
                                    >
                                        {getFilterTitle(filter)}
                                        <button
                                            className="outline-none"
                                            onClick={() => {
                                                let filters = [];
                                                let stages = [];
                                                let pipeline = null;
                                                let fromDate = null;
                                                let toDate = null;
                                                filtersSelected.map((f, ind) => {
                                                    if (index != ind) {
                                                        filters.push(f);
                                                        if (f.key == "stage") {
                                                            stages.push(f.values[0]);
                                                        }
                                                        if (f.key == "pipeline") {
                                                            pipeline = f.values[0];
                                                        }
                                                        if (f.key == "date") {
                                                            fromDate = f.values[0];
                                                            toDate = f.values[1];
                                                        }
                                                    } else {
                                                    }
                                                });

                                                ////console.log("Stage ids ", stages);
                                                ////console.log("Date ", [fromDate, toDate]);
                                                ////console.log("Pipeline ", pipeline);
                                                // console.log("Stages inheriting from", stages);
                                                setSelectedStage(stages);
                                                setSelectedFromDate(fromDate);
                                                setSelectedToDate(toDate);
                                                setSelectedPipeline(pipeline);
                                                //   setFilterLeads([]);
                                                //   setLeadsList([]);
                                                //   setTimeout(() => {
                                                //     let filterText = getFilterText();
                                                //     handleFilterLeads(0, filterText);
                                                //   }, 1000);

                                                //   filters.splice(index, 1);
                                                ////console.log("Removing filter at ", filters);
                                                setFiltersSelected(filters);
                                            }}
                                        >
                                            <Image
                                                src={"/otherAssets/crossIcon.png"}
                                                height={20}
                                                width={20}
                                                alt="*"
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div> */}
                </div>

                {/* <div className="flex flex-row items-center gap-2 w-[10%]">
                    {/* {toggleClick.length > 0 && (
                        <div>
                            {toggleClick.length === FilterLeads.length ? (
                                <div>
                                    {LeadsList.length > 0 && ( */}
                    {/* <div className="flex flex-row items-center gap-2">
                        <button
                            className="h-[20px] w-[20px] border rounded bg-purple outline-none flex flex-row items-center justify-center"
                            onClick={() => {
                                // setToggleClick([]);
                            }}
                        >
                            <Image
                                src={"/assets/whiteTick.png"}
                                height={10}
                                width={10}
                                alt="*"
                            />
                        </button>
                        <div style={{ fontSize: "15", fontWeight: "600" }}>
                            Select All
                        </div>
                    </div> */}
                     {/* )}
                </div>  ) : ( */}
                                <div className="flex flex-row items-center gap-2">
                                    <button
                                        className="h-[20px] w-[20px] border-2 rounded outline-none"
                                        onClick={() => {
                                            setToggleClick(FilterLeads.map((item) => item.id));
                                        }}
                                    ></button>
                                    <div style={{ fontSize: "15", fontWeight: "600" }}>
                                        Select All
                                    </div>
                                </div>
                            {/* )} */}
            </div>
            {/* )} */}
        </div>
    )
}

export default AdminLeads


const styles = {
    heading: {
      fontWeight: "700",
      fontSize: 17,
    },
    paragraph: {
      fontWeight: "500",
      fontSize: 15,
    },
}