import axios from 'axios'
import React from 'react'
import Apis from './Apis'

export const UpdateProfile = async (apidata) => {
    console.log('apidata', apidata)
    try {
        const data = localStorage.getItem("User")
        if (data) {
            let u = JSON.parse(data)
            let path = Apis.updateProfileApi;
            console.log("Authtoken is", u.token);
            const response = await axios.post(path, apidata, {
                headers: {
                    'Authorization': 'Bearer ' + u.token,
                    "Content-Type": 'application/json'
                }
            })

            if (response) {
                if (response.data.status === true) {
                    console.log('updateProfile data is', response.data)
                    u.user = response.data.data
                    localStorage.setItem("User", JSON.stringify(u))
                    return response.data.data
                }
            }
        }
    } catch (e) {
        console.log('error in update profile is', e)
    }

}