import axios from 'axios'
import React from 'react'
import Apis from './Apis'

export const UpdateProfile = async (apidata) => {
   // console.log('apidata', apidata)
    try {
        const data = localStorage.getItem("User")
        if (data) {
            let u = JSON.parse(data)
            let path = Apis.updateProfileApi;
           // console.log("Authtoken is", u.token);
           // console.log("Api Data passsed is", apidata)
            // return
            const response = await axios.post(path, apidata, {
                headers: {
                    'Authorization': 'Bearer ' + u.token,
                    "Content-Type": 'application/json'
                }
            })

            if (response) {
                if (response.data.status === true) {
                   // console.log('updateProfile data is', response.data)
                    u.user = response.data.data

                    //// console.log('u', u)
                    localStorage.setItem("User", JSON.stringify(u))
                   // console.log('trying to send event')
                    window.dispatchEvent(new CustomEvent("UpdateProfile", { detail: { update: true } }));
                    return response.data.data
                }
            }
        }
    } catch (e) {
       // console.log('error in update profile is', e)
    }

}