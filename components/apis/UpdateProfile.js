import axios from "axios";
import React from "react";
import Apis from "./Apis";
import { PersistanceKeys } from "@/constants/Constants";

export const UpdateProfile = async (apidata) => {
  // console.log('apidata', apidata)

  let SavedLocation = localStorage.getItem(
    PersistanceKeys.LocalStorageCompleteLocation
  );
  if (SavedLocation) {
    // console.log("User location saved ", SavedLocation);
    let parsedLocation = JSON.parse(SavedLocation);
    apidata.lat = parsedLocation.latitude;
    apidata.lang = parsedLocation.longitude;
  }
  // console.log("Token sending in api is", apidata);
  // UpdateProfile()
  try {
    const data = localStorage.getItem("User");
    if (data) {
      let u = JSON.parse(data);
      let path = Apis.updateProfileApi;
      // console.log("Authtoken is", u.token);
      console.log("Api Data passsed is", apidata)
      // return
      const response = await axios.post(path, apidata, {
        headers: {
          Authorization: "Bearer " + u.token,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        if (response.data.status === true) {
          console.log('updateProfile data is', response.data)
          u.user = response.data.data;

          //// console.log('u', u)
          localStorage.setItem("User", JSON.stringify(u));
          console.log('trying to send event')
          window.dispatchEvent(
            new CustomEvent("UpdateProfile", { detail: { update: true } })
          );
          return response.data.data;
        }
      }
    }else{
      console.log('no data ')
    }
  } catch (e) {
    console.log('error in update profile is', e)
  }
};
