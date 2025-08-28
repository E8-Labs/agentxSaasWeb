import Apis from '@/components/apis/Apis';
import { Box, CircularProgress, Modal } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';
import SelectedUserDetails from '../users/SelectedUserDetails';
import SelectedAgencyDetails from './adminAgencyView/SelectedAgencyDetails';


function AdminAgencyDetails() {

  useEffect(() => {
    getAgencyDetails()
  }, [])

  const [loading, setLoading] = useState(false)
  const [agencies, setAgencies] = useState([])
  const [hasMore, setHasMore] = useState(true);
  const LimitPerPage = 30;

  //selected item
  const [selectedUser, setSelectedUser] = useState(null);


  const getAgencyDetails = async (offset = 0, loading = true) => {
    try {
      if (loading) {
        setLoading(true);
      }

      const localData = localStorage.getItem("User");
      const AuthToken = localData ? JSON.parse(localData).token : null;

      const ApiPath = `${Apis.getAdminAgencies}?offset=${offset}`;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.data?.agencies) {
        const newData = response.data.data.agencies;
        console.log('reponse.data', response.data)
        const updated = offset === 0 ? newData : [...agencies, ...newData];

        setAgencies(updated);
        if (newData.length < LimitPerPage) setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching agencies:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full items-start">
      <div className="py-4 px-10" style={{ fontSize: 24, fontWeight: "600" }}>
        Agency
      </div>

      <div className="w-full flex flex-row mt-3 px-10 mt-12">
        <div className="w-3/12"><div style={styles.text}>Agency Name</div></div>
        <div className="w-2/12"><div style={styles.text}>Sub Account</div></div>
        <div className="w-1/12"><div style={styles.text}>Plan</div></div>
        <div className="w-1/12"><div style={styles.text}>Total Spent</div></div>
        <div className="w-1/12"><div style={styles.text}>Min Used</div></div>
        <div className="w-1/12"><div style={styles.text}>Renewal</div></div>
        <div className="w-1/12"><div style={styles.text}>Agents</div></div>
        <div className="w-2/12"><div style={styles.text}>Created</div></div>
      </div>

      <div className="h-[77vh] overflow-auto" id="scrollableDiv1" style={{ scrollbarWidth: "none" }}>
        <InfiniteScroll
          className="lg:flex hidden flex-col w-full"
          scrollableTarget="scrollableDiv1"
          dataLength={agencies.length}
          hasMore={hasMore}
          next={() => getAgencyDetails(agencies.length, false)}
          loader={
            <div className="w-full flex flex-row justify-center mt-8">
              <CircularProgress size={35} />
            </div>
          }
          endMessage={
            <p className="text-center py-4 text-[#00000060] text-base">
              {`You're all caught up`}
            </p>
          }
        >
          {agencies.length > 0 ? (
            agencies.map((item) => (
              <div
                key={item.id}
                className="w-full flex flex-row items-center mt-5 px-10 hover:bg-[#402FFF05] py-2"
                style={{ cursor: "pointer" }}
                onClick={() => { setSelectedUser(item) }}
              >
                <div className="w-3/12 flex flex-row gap-2 items-center">
                  <div className="h-[40px] w-[40px] rounded-full bg-black text-white flex items-center justify-center">
                    {item.agencyName?.slice(0, 1).toUpperCase()}
                  </div>
                  <div style={styles.text2}>{item.agencyName}</div>
                </div>

                <div className="w-2/12">
                  <div style={styles.text2}>{item.subAccountsCount}</div>
                </div>
                <div className="w-1/12"><div style={styles.text2}>{item.plan}</div></div>
                <div className="w-1/12"><div style={styles.text2}>${item.totalSpent}</div></div>
                <div className="w-1/12"><div style={styles.text2}>{item.minutesUsed} min</div></div>
                <div className="w-1/12"><div style={styles.text2}>{item.renewal}</div></div>
                <div className="w-1/12"><div style={styles.text2}>{item.agentsCount}</div></div>
                <div className="w-2/12">
                  <div style={styles.text2}>
                    {moment(item.createdAt).format("MMM DD, YYYY")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="text-center mt-4" style={{ fontWeight: "bold", fontSize: 20 }}>
                No agency found
              </div>
            )
          )}
        </InfiniteScroll>
      </div>

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
          <SelectedAgencyDetails
            selectedUser={selectedUser}
            handleDel={() => {
              setAgencies((prev) => prev.filter((u) =>
                u.id != selectedUser.id
              ));
              setSelectedUser(null);
            }}
            handleClose={() => { setSelectedUser(null); }}
            handlePauseUser={(d) => {
              console.log("User paused");

              const updatedStatus = selectedUser.profile_status === "active" ? "paused" : "active";

              const updatedUser = {
                ...selectedUser,
                profile_status: updatedStatus
              };

              // ✅ Update the user in the list
              setAgencies((prev) =>
                prev.map((u) =>
                  u.id === updatedUser.id ? updatedUser : u
                )
              );

              // ✅ Re-send updated user to child
              setSelectedUser(updatedUser);
            }}
          />
        </Box>
      </Modal>

    </div>
  )
}

export default AdminAgencyDetails
const styles = {
  text: {
    fontSize: 15,
    color: "#00000090",
    fontWeight: "600",
  },
  text2: {
    textAlignLast: "left",
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
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
};