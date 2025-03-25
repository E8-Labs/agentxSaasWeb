"use client";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import { GetFormattedDateString } from "@/utilities/utility";
import SelectedUserDetails from "./SelectedUserDetails";
import { UserFilterModal } from "./UserFilterModal";
import { Box, CircularProgress, Modal } from '@mui/material'

import moment from "moment";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null); // For menu position
  const [selectedUser, setSelectedUser] = useState(null); // To know which user is selected for action

  const [filters, setFilters] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [search, setSearch] = useState("");
  const filterRef = useRef(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const [leadsSort, setLeadsSort] = useState(false);
  const [minsSort, setMinsSort] = useState(false);
  const [spentSort, setSpentSort] = useState(false);
  const [balanceSort, setBalanceSort] = useState(false);

  const [selectedSort, setSelectedSort] = useState(null);
  const [selectedSortOrder, setSelectedSortOrder] = useState("ASC");

  const LimitPerLoad = 30;

  let sortData = { sort: "", sortOrder: "" };

  useEffect(() => {
    getUsersList();
  }, []);

  useEffect(() => {
    if (filterRef.current) {
      clearTimeout(filterRef.current);
    }
    filterRef.current = setTimeout(() => {
      console.log("Timer clicked", search);
      setHasMore(true);
      setUsers([]);
      let sortData = {
        sort: selectedSort,
        sortOrder: selectedSortOrder,
      };

      getUsersList(0, filters, sortData);
      // getUsersList();
    }, 400);
  }, [search]);

  const getUsersList = async (offset = 0, filters = null, sortData = null) => {
    console.log("filters in function are", filters);
    try {
      setLoading(true);
      const data = localStorage.getItem("User");
      if (data) {
        let u = JSON.parse(data);
        let apiPath = Apis.getUsers + `?offset=${offset}`;
        if (search && search.length > 0) {
          apiPath = `${apiPath}&search=${search}`;
        }

        if (filters) {
          if (filters.agent) {
            apiPath += `&minAgents=${filters.agent[0]}&maxAgents=${filters.agent[1]}`;
          }
          if (filters.balance) {
            apiPath += `&minBalance=${filters.balance[0]}&maxBalance=${filters.balance[1]}`;
          }
          if (filters.minsUsed) {
            apiPath += `&minMinsUsed=${filters.minsUsed[0]}&maxMinsUsed=${filters.minsUsed[1]}`;
          }
          if (filters.teams) {
            apiPath += `&minTeams=${filters.teams[0]}&maxTeams=${filters.teams[1]}`;
          }
          if (filters.totalSpent) {
            apiPath += `&minSpent=${filters.totalSpent[0]}&maxSpent=${filters.totalSpent[1]}`;
          }
          if (filters.renewalFromDate) {
            apiPath += `&fromChargeDate=${moment(
              filters.renewalFromDate
            ).format("YYYY-MM-DD")}`;
          }
          if (filters.renewalToDate) {
            apiPath += `&toChargeDate=${moment(filters.renewalToDate).format(
              "YYYY-MM-DD"
            )}`;
          }
          if (filters.selectedCreatedFromDate) {
            apiPath += `&fromCreatedDate=${moment(
              filters.selectedCreatedFromDate
            ).format("YYYY-MM-DD")}`;
          }
          if (filters.selectedCreatedToDate) {
            apiPath += `&toCreatedDate=${moment(
              filters.selectedCreatedToDate
            ).format("YYYY-MM-DD")}`;
          }
          if (filters.selectedPlans && filters.selectedPlans.length > 0) {
            const planString = filters.selectedPlans.join(",");
            apiPath += `&plan=${planString}`;
          }
          if (
            filters.selectedAffiliates &&
            filters.selectedAffiliates.length > 0
          ) {
            const affiliates = filters.selectedAffiliates.join(",");
            apiPath += `&closer=${affiliates}`;
          }
        }

        if (sortData) {
          apiPath = `${apiPath}&sort=${sortData.sort}&sortOrder=${sortData.sortOrder}`;
        }

        // console.log("Url ", apiPath);
        // return
        const response = await axios.get(apiPath, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response.data?.status) {
          if (offset == 0) {
            setUsers([...response.data.data]);
          } else {
            setUsers((prevUsers) => [...prevUsers, ...response.data.data]);
          }
          if (response.data.data.length < LimitPerLoad) {
            console.log("Has more", response.data.data.length);
            setHasMore(false);
          }
        }
      }
    } catch (e) {
      console.log("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ zIndex: 1000 }} className="flex flex-col items-center w-full">
      <UserFilterModal
        showFilterModal={showFilterModal}
        filters={{}}
        updateFilters={(filter) => {
          console.log("Filters selected", filter);
          // let f = { ...filters, filter }
          setFilters(filter);
          if (filter?.finalUpdate === true) {
            let sortData = {
              sort: selectedSort,
              sortOrder: selectedSortOrder,
            };

            getUsersList(0, filter, sortData);
            setShowFilterModal(false);
          }
        }}
        onDismissCallback={() => {
          setShowFilterModal(false);
        }}
      />

      <div className="flex flex-row justify-start items-center gap-4 p-6 w-full">
        <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border rounded pe-2">
          <input
            // style={styles.paragraph}
            className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0"
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Handle search input
            }}
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
            // console.log('filter modal trigered 12')

            setShowFilterModal(true);
          }}
        >
          <Image
            src={"/assets/filterIcon.png"}
            height={16}
            width={16}
            alt="*"
          />
        </button>
      </div>
      {/* Scrollable Table Wrapper */}
      <div
        className="h-[90svh] border overflow-auto pb-[100px] w-full"
        style={{ scrollbarWidth: "none" }}
      >
        <InfiniteScroll
          className="flex flex-col w-full"
          endMessage={
            <p
              style={{
                textAlign: "center",
                paddingTop: "10px",
                fontWeight: "400",
                fontFamily: "inter",
                fontSize: 16,
                color: "#00000060",
              }}
            >
              {`You're all caught up`}
            </p>
          }
          scrollableTarget="scrollableDiv1"
          dataLength={users.length}
          next={() => {
            console.log("Load more leads");
            let sortData = {
              sort: selectedSort,
              sortOrder: selectedSortOrder,
            };

            getUsersList(users.length, filters, sortData);
          }}
          hasMore={hasMore}
          loader={
            <div className="w-full flex flex-row justify-center mt-8">
              {loading && hasMore && (
                <CircularProgress size={35} sx={{ color: "#7902DF" }} />
              )}
            </div>
          }
          style={{ overflow: "unset" }}
        >
          <div className="h-[90svh] w-full overflow-auto pb-[100px]" id="scrollableDiv1">
            <table className="table-auto w-full border-collapse border border-none">
              {/* Table Header */}
              <thead className="w-full" style={{
                overflowX: 'auto',
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 10,
              }}>
                <tr className="bg-gray-100 text-sm font-semibold text-gray-600 ">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className=" py-2 text-left w-[110px] flex flex-row gap-2">
                    <button className=""
                      onClick={() => {

                        let sortOrder = selectedSortOrder;
                        if (selectedSort == "Leads") {
                          sortOrder = selectedSortOrder == "ASC" ? "DESC" : "ASC";
                        }

                        setSelectedSortOrder(sortOrder);

                        sortData = {
                          sort: "Leads",
                          sortOrder: sortOrder,
                        };
                        setSelectedSort("Leads");
                        getUsersList(0, filters, sortData);
                      }}
                    >
                      Leads
                      {selectedSort === "Leads" ? (
                        <Image
                          src={
                            selectedSortOrder == "DESC"
                              ? "/downArrow.png"
                              : "/upArrow.png"
                          }
                          height={3}
                          width={10}
                          className="inline-block align-middle"
                          alt="*"
                        />
                      ) : null}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">Plan</th>
                  <th className="px-4 py-2 text-left w-[100px]">Teams</th>
                  <th className=" py-2 text-left flex flex-row  w-[100px]">
                    <button className=""
                      onClick={() => {
                        let sortOrder = selectedSortOrder;
                        if (selectedSort == "TotalSpent") {
                          sortOrder = selectedSortOrder == "ASC" ? "DESC" : "ASC";
                        }
                        setSelectedSortOrder(sortOrder);
                        sortData = {
                          sort: "TotalSpent",
                          sortOrder: sortOrder,
                        };
                        setSelectedSort("TotalSpent");
                        getUsersList(0, filters, sortData);
                      }}
                    >
                      Total Spents
                      {selectedSort === "TotalSpent" && (
                        <Image
                          src={
                            selectedSortOrder == "DESC"
                              ? "/downArrow.png"
                              : "/upArrow.png"
                          }
                          height={3}
                          width={12}
                          className="inline-block align-middle"
                          alt="*"
                        />
                      )}
                    </button>
                  </th>
                  <th className=" py-2 text-left w-[100px]">
                    <button className="whitespace-nowrap"
                      onClick={() => {
                        let sortOrder = selectedSortOrder;
                        if (selectedSort == "MinutesUsed") {
                          sortOrder = selectedSortOrder == "ASC" ? "DESC" : "ASC";
                        }
                        setSelectedSortOrder(sortOrder);
                        sortData = {
                          sort: "MinutesUsed",
                          sortOrder: sortOrder,
                        };
                        getUsersList(0, filters, sortData);
                        setSelectedSort("MinutesUsed");
                      }}
                    >
                      Mins Used
                      {selectedSort === "MinutesUsed" && (
                        <Image
                          src={
                            selectedSortOrder == "DESC"
                              ? "/downArrow.png"
                              : "/upArrow.png"
                          }
                          height={3}
                          width={12}
                          className="inline-block align-middle"
                          alt="*"
                        />
                      )}
                    </button>
                  </th>
                  <th className=" py-2 text-left  w-[150px]">
                    <button className="whitespace-nowrap"
                      onClick={() => {
                        let sortOrder = selectedSortOrder;
                        if (selectedSort == "MinutesBalance") {
                          sortOrder = selectedSortOrder == "ASC" ? "DESC" : "ASC";
                        }
                        setSelectedSortOrder(sortOrder);
                        sortData = {
                          sort: "MinutesBalance",
                          sortOrder: sortOrder,
                        };
                        setSelectedSort("MinutesBalance");

                        getUsersList(0, filters, sortData);
                      }}
                    >
                      Balance
                      {selectedSort === "MinutesBalance" && (
                        <Image
                          src={
                            selectedSortOrder == "DESC"
                              ? "/downArrow.png"
                              : "/upArrow.png"
                          }
                          height={3}
                          width={12}
                          className="inline-block align-middle"
                          alt="*"
                        />
                      )}
                    </button>
                  </th>
                  <th className=" py-2 text-left  w-[150px]">
                    <button className="whitespace-nowrap"
                      onClick={() => {

                        let sortOrder = selectedSortOrder;
                        if (selectedSort == "Renewal") {
                          sortOrder = selectedSortOrder == "ASC" ? "DESC" : "ASC";
                        }

                        setSelectedSortOrder(sortOrder);

                        sortData = {
                          sort: "Renewal",
                          sortOrder: sortOrder,
                        };
                        setSelectedSort("Renewal");
                        getUsersList(0, filters, sortData);
                      }}>
                      Renewal
                      {selectedSort === "Renewal" ? (
                        <Image
                          src={
                            selectedSortOrder == "DESC"
                              ? "/downArrow.png"
                              : "/upArrow.png"
                          }
                          height={3}
                          width={10}
                          className="inline-block align-middle"
                          alt="*"
                        />
                      ) : null
                      }
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left w-[150px]">Agents</th>
                  <th className="px-4 py-2 text-left w-[150px]">Referred</th>
                  <th className="px-4 py-2 text-left w-[150px]">Closer</th>
                  <th className="px-4 py-2 text-left w-[150px]">Source</th>
                  <th className="px-4 py-2 text-left w-[150px]">Created</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {users.map((item, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 text-sm text-gray-900 border-b cursor-pointer ${index % 2 == 0 ? "bg-gray-100" : ""
                      }`}
                    onClick={() => {
                      console.log("selected item", item);
                      setSelectedUser(item);
                      // setShowUserDetails(true)
                    }}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        {item.thumb_profile_image ? (
                          <Image
                            src={item.thumb_profile_image}
                            height={40}
                            width={40}
                            className="rounded-full object-cover"
                            style={{ minWidth: "40px", minHeight: "40px" }} // Ensures consistency
                            alt="User"
                          />
                        ) : (
                          <div
                            className="w-[40px] h-[40px] rounded-full bg-black flex items-center justify-center text-white text-lg font-meduim uppercase"
                            style={{ minWidth: "40px", minHeight: "40px" }}
                          >
                            {item.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <span className="whitespace-nowrap">{item.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-2">{item.email}</td>
                    <td className="px-4 py-2">{item.leads || "0"}</td>
                    <td className="px-4 py-2">{item.plan || "-"}</td>
                    <td className="px-4 py-2">{item.team || "-"}</td>
                    <td className="px-4 py-2  ">${item.totalSpent || "0"}</td>
                    <td className="px-4 py-2 w-[100px] whitespace-nowrap">
                      {parseFloat((item.minutesUsed || 0) / 60).toFixed(2)} mins
                    </td>
                    <td className="px-4 py-2 w-[100px]  whitespace-nowrap">
                      {parseFloat((item.totalSecondsAvailable / 60).toFixed(2))}{" "}mins
                    </td>
                    <td className="px-4 py-2 w-[100px]  whitespace-nowrap">
                      {GetFormattedDateString(item.nextChargeDate)}
                    </td>
                    <td className="px-4 py-2">{item.agents || "-"}</td>
                    <td className="px-4 py-2">{item.campaignee || "-"}</td>
                    <td className="px-4 py-2">{item.closerName || "-"}</td>
                    <td className="px-4 py-2">{item.uniqueUrl || "-"}</td>
                    <td className="px-4 py-2">
                      {GetFormattedDateString(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfiniteScroll>
      </div>
      {/* {selectedUser && (
        <SelectedUserDetails
          open={selectedUser ? true : false}
          close={() => {
            setSelectedUser(null);
          }}
          selectedUser={selectedUser}
        />
      )} */}

      <Modal
        open={selectedUser ? true : false}
        onClose={() => {
          setSelectedUser(null);
        }}
        BackdropProps={{
          timeout: 200,
          sx: {
            backgroundColor: "#00000020",
            zIndex: 1200, // Keep backdrop below Drawer
          },
        }}
        sx={{
          zIndex: 1300, // Keep Modal below the Drawer
        }}

      >
        <Box
          className="w-11/12  p-8 rounded-[15px]"
          sx={{
            ...styles.modalsStyle,
            backgroundColor: "white",
            position: "relative",
            zIndex: 1301, // Keep modal content above its backdrop
          }}

        >
          <SelectedUserDetails
            selectedUser={selectedUser}
            handleDel={() => {
              setUsers((prev) => prev.filter((u) =>
                u.id != selectedUser.id
              ))
              setSelectedUser(null)
            }}

          />
        </Box>
      </Modal>
    </div>
  );
}

export default AdminUsers;

const styles = {
  modalsStyle: {
    height: "auto",
    bgcolor: "transparent",
    p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-50%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
}
