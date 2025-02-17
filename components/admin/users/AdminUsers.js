"use client";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CircularProgress } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import { GetFormattedDateString } from "@/utilities/utility";
import SelectedUserDetails from "./SelectedUserDetails";
import { UserFilterModal } from "./UserFilterModal";

import Modal, { Box } from "@mui/material";

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

  const LimitPerLoad = 30;

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
      getUsersList(0);
    }, 400);
  }, [search]);

  const getUsersList = async (offset = 0) => {
    try {
      setLoading(true);
      const data = localStorage.getItem("User");
      if (data) {
        let u = JSON.parse(data);
        let apiPath = Apis.getUsers + `?offset=${offset}`;
        if (search && search.length > 0) {
          apiPath = `${apiPath}&search=${search}`;
        }

        console.log("Url ", apiPath);
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
    <div className="flex flex-col items-center w-full">
      <UserFilterModal
        showFilterModal={showFilterModal}
        filters={{}}
        updateFilters={(filters) => {
          console.log("Filters selected", filters);
          setFilters(filters);
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
        className="h-[90svh] overflow-auto pb-[100px] w-full"
        id="scrollableDiv1"
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
            getUsersList(users.length);
          }}
          hasMore={hasMore}
          loader={
            <div className="w-full flex flex-row justify-center mt-8">
              {loading && (
                <CircularProgress size={35} sx={{ color: "#7902DF" }} />
              )}
            </div>
          }
          style={{ overflow: "unset" }}
        >
          <table className="table-auto w-full border-collapse border border-none">
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-100 text-sm font-semibold text-gray-600">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Leads</th>
                <th className="px-4 py-2 text-left">Plan</th>
                <th className="px-4 py-2 text-left">Teams</th>
                <th className="px-4 py-2 text-left">Total Spent</th>
                <th className="px-4 py-2 text-left">Mins Used</th>
                <th className="px-4 py-2 text-left">Mins Balance</th>
                <th className="px-4 py-2 text-left">Renewal</th>
                <th className="px-4 py-2 text-left">Agents</th>
                <th className="px-4 py-2 text-left">Referred by</th>
                <th className="px-4 py-2 text-left">Closer</th>
                <th className="px-4 py-2 text-left">Source</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {users.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 text-sm text-gray-900 border-b cursor-pointer ${
                    index % 2 == 0 ? "bg-gray-100" : ""
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
                          className="rounded-full"
                          alt="User"
                        />
                      ) : (
                        <div className="w-[40px] h-[40px] rounded-full bg-black flex items-center justify-center text-white">
                          {item.name[0]}
                        </div>
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">{item.email}</td>
                  <td className="px-4 py-2">{item.leads || "0"}</td>
                  <td className="px-4 py-2">{item.plan || "-"}</td>
                  <td className="px-4 py-2">{item.team || "-"}</td>
                  <td className="px-4 py-2">${item.totalSpent || "0"}</td>
                  <td className="px-4 py-2">
                    {parseFloat((item.minutesUsed || 0) / 60).toFixed(2)} mins
                  </td>
                  <td className="px-4 py-2">
                    {parseFloat((item.totalSecondsAvailable / 60).toFixed(2))}{" "}
                    mins
                  </td>
                  <td className="px-4 py-2">
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
        </InfiniteScroll>
      </div>
      {selectedUser && (
        <SelectedUserDetails
          open={selectedUser ? true : false}
          close={() => {
            setSelectedUser(null);
          }}
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
}

export default AdminUsers;
