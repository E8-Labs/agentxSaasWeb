import axios from "axios";
import React from "react";
import Apis from "./Apis";
import { PersistanceKeys } from "@/constants/Constants";

export const UpdateProfile = async (apidata) => {
  // //console.log

  let SavedLocation = localStorage.getItem(
    PersistanceKeys.LocalStorageCompleteLocation
  );
  if (SavedLocation) {
    // //console.log;
    let parsedLocation = JSON.parse(SavedLocation);
    apidata.lat = parsedLocation.latitude;
    apidata.lang = parsedLocation.longitude;
  }
  // //console.log;
  // UpdateProfile()
  try {
    const data = localStorage.getItem("User");
    if (data) {
      let u = JSON.parse(data);
      let path = Apis.updateProfileApi;
      // //console.log;
      //console.log
      // return
      const response = await axios.post(path, apidata, {
        headers: {
          Authorization: "Bearer " + u.token,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        if (response.data.status === true) {
          //console.log
          u.user = response.data.data;

          //// //console.log
          localStorage.setItem("User", JSON.stringify(u));
          //console.log
          window.dispatchEvent(
            new CustomEvent("UpdateProfile", { detail: { update: true } })
          );
          return response.data.data;
        }
      }
    }else{
      //console.log
    }
  } catch (e) {
    //console.log
  }
};
