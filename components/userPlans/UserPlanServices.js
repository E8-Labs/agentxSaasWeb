import axios from "axios"
import { AuthToken } from "../agency/plan/AuthDetails"
import Apis from "../apis/Apis"

export const getUserPlans = async () => {
    try {
        let token = AuthToken()

        const response = await axios.get(Apis.getPlans, {
            headers: {
                "Authorization": 'Bearer ' + token
            }
        })


        if (response) {
            if (response.data.status == true) {
                console.log('user plans are', response.data)
                return response.data.data
            } else {
                return null
            }
        }

    } catch (error) {
        console.log('error in get plans api', error)
    }
}


export const initiateCancellation = async () => {
    try {
        let token = AuthToken()

        const response = await axios.post(Apis.initiateCancelation,{}, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type":'application/json'
            }
        })

        if (response) {
            if (response.data.status == true) {
                console.log('response of initiate cancelation', response.data)
                return response.data.data
            } else {
                return null
            }
        }

    } catch (error) {
        console.log('error initiate api', error)
    }
}

export const pauseSubscription = async () => {
    try {
        let token = AuthToken()
        // console.log('token', token)

        const response = await axios.post(Apis.pauseSubscription,{}, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type":'application/json'

            }
        })


        if (response) {
            if (response.data.status == true) {
                console.log('response of puase cancelation', response.data)
                return response.data.data
            } else {
                return null
            }
        }

    } catch (error) {
        console.log('error in pause api', error)
    }
}

export const claimGift = async () => {
    try {
        let token = AuthToken()
        // console.log('token', token)

        const response = await axios.post(Apis.claimGiftMins,{}, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type":'application/json'

            }
        })


        if (response) {
            if (response.data.status == true) {
                console.log('response of claimGiftMins', response.data)
                return response.data.data
            } else {
                return null
            }
        }

    } catch (error) {
        console.log('error claimGiftMins api', error)
    }
}