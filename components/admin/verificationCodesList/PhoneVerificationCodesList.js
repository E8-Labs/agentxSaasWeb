import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@mui/material';
import parsePhoneNumberFromString from 'libphonenumber-js';
import moment from 'moment';
import { PersistanceKeys } from '@/constants/Constants';

const LimitPerPage = 30;

function PhoneVerificationCodesList() {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationCodes, setVerificationCodes] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const localCache = localStorage.getItem(PersistanceKeys.LocalVerificationCodes);
    if (localCache) {
      const parsed = JSON.parse(localCache);
      setVerificationCodes(parsed);
      setIsCached(true);
      if (parsed.length < LimitPerPage) setHasMore(false);
    } else {
      getCodes(0);
    }
  }, []);

  const getCodes = async (offset = 0) => {
    try {
      setLoading(true);

      const localData = localStorage.getItem("User");
      const AuthToken = localData ? JSON.parse(localData).token : null;

      const ApiPath = `${Apis.getVerificationCodes}?offset=${offset}`;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.data) {
        const newData = response.data.data;
        const updated = offset === 0 ? newData : [...verificationCodes, ...newData];

        setVerificationCodes(updated);
        localStorage.setItem(PersistanceKeys.LocalVerificationCodes, JSON.stringify(updated));
        if (newData.length < LimitPerPage) setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching phone verification codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
    );
    return phoneNumber
      ? phoneNumber.formatInternational()
      : "Invalid phone number";
  };

  return (
    <div className="w-full items-start">
      <div className="py-4 px-10" style={{ fontSize: 24, fontWeight: "600" }}>
        Phone Verification Codes
      </div>

      <div className="w-full flex flex-row mt-3 px-10 mt-12">
        <div className="w-3/12"><div style={styles.text}>Name</div></div>
        <div className="w-3/12"><div style={styles.text}>Phone Number</div></div>
        <div className="w-2/12"><div style={styles.text}>New Code</div></div>
        <div className="w-2/12"><div style={styles.text}>Status</div></div>
        <div className="w-2/12"><div style={styles.text}>Date</div></div>
      </div>

      <div className="h-[77vh] overflow-auto" id="scrollableDiv1" style={{ scrollbarWidth: "none" }}>
        <InfiniteScroll
          className="lg:flex hidden flex-col w-full"
          scrollableTarget="scrollableDiv1"
          dataLength={verificationCodes.length}
          hasMore={hasMore}
          next={() => getCodes(verificationCodes.length)}
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
          {verificationCodes.length > 0 ? (
            verificationCodes.map((item) => (
              <div
                key={item.id}
                className="w-full flex flex-row items-center mt-5 px-10 hover:bg-[#402FFF05] py-2"
                style={{ cursor: "pointer" }}
              >
                <div className="w-3/12 flex flex-row gap-2 items-center">
                  {item.User?.thumb_profile_image ? (
                    <Image
                      src={item.User.thumb_profile_image}
                      height={40}
                      width={40}
                      style={{ borderRadius: "100%" }}
                      alt="*"
                    />
                  ) : (
                    <div className="h-[40px] w-[40px] rounded-full bg-black text-white flex items-center justify-center">
                      {item.User?.name?.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div style={styles.text2}>{item.User?.name}</div>
                </div>

                <div className="w-3/12">
                  <div style={styles.text2}>
                    {item.phone ? formatPhoneNumber(item.phone) : "-"}
                  </div>
                </div>
                <div className="w-2/12"><div style={styles.text2}>{item.code}</div></div>
                <div className="w-2/12"><div style={styles.text2}>{item.status}</div></div>
                <div className="w-2/12">
                  <div style={styles.text2}>
                    {moment(item.createdAt).format("MMMM DD hh:mma")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="text-center mt-4" style={{ fontWeight: "bold", fontSize: 20 }}>
                No phone number found
              </div>
            )
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default PhoneVerificationCodesList;

// styles
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
};
