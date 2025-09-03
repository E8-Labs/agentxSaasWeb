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


export const getDiscount = async () => {
    try {
        let token = AuthToken()

        console.log('trying to obtain offer')

        const response = await axios.post(Apis.continueToDiscount,{}, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type":'application/json'
            }
        })

        if (response) {
            console.log('response of discount', response.data)
            if (response.data.status == true) {
                return response.data.data
            } else {
                return null
            }
        }

    } catch (error) {
        console.log('error discount api', error)
    }
}

export const completeCancelation = async () => {
    try {
        let token = AuthToken()

        console.log('trying to obtain offer')

        const response = await axios.post(Apis.completeCancelatiton,{}, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type":'application/json'
            }
        })

        if (response) {
            console.log('response of completeCancelatiton', response.data)
            if (response.data.status == true) {
                return response.data
            } else {
                return response.data
            }
        }

    } catch (error) {
        console.log('error completeCancelatiton api', error)
    }
}


export const purchaseMins = async (mins) => {
    try {
        let token = AuthToken()

        console.log('trying to obtain offer')

        const response = await axios.post(Apis.purchaseDiscountedMins,{
            requestedMinutes:mins
        }, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type":'application/json'
            }
        })

        if (response) {
            console.log('response of completeCancelatiton', response.data)
            if (response.data.status == true) {
                return response.data
            } else {
                return response.data
            }
        }

    } catch (error) {
        console.log('error completeCancelatiton api', error)
    }
}


export const calculatePlanPrice = (selectedPlan) => {
    console.log("Scale plan value passed is", selectedPlan);
    if (!selectedPlan) {
        return "-";
    }
    if (selectedPlan.billingCycle === "monthly") {
        return "$" + (1 * selectedPlan.discountPrice);
    } else if (selectedPlan.billingCycle === "quarterly") {
        return "$" + (3 * ( selectedPlan.discountPrice)).toFixed(2);
    } else if (selectedPlan.billingCycle === "yearly") {
        return "$" + (12 * ( selectedPlan.discountPrice)).toFixed(2);
    } else {
        return "-";
    }
}

