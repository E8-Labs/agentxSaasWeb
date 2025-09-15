import axios from "axios"
import { AuthToken } from "../agency/plan/AuthDetails"
import Apis from "../apis/Apis"


export const downgradeToStarterFeatures = [
    "10 AI Agents",
    "GHL Subaccount & Snapshots",
    "10,000 Contacts",
    "Priority Support ",
    "Ultra Priority Calling",
    "4 Team Seats",
    "Zoom Support Webinar",
    "450 AI Credits",
]

export const downgradeToGrowthFeatures = [
    "Unlimited Agents",
    "1000 AI Credits",
    "Unlimited Contacts",
    "Success Manager",
    "Unlimited Team Seats",
]

export const getUserPlans = async () => {
    try {
        let token = AuthToken()

        let path = Apis.getPlans
        console.log('path of get plans', path)
        const response = await axios.get(path, {
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
            console.log('response of puase cancelation', response.data)
            if (response.data.status == true) {
                return response.data
            } else {
                return response.data
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
            console.log('response of claimGiftMins', response.data)
            if (response.data.status == true) {
                return response.data
            } else {
                return response.data
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


export const checkReferralCode = async (code) => {
    try {
        let token = AuthToken()

        console.log('trying to obtain offer')

        const response = await axios.post(Apis.validateReferralCode,{
            referralCode:code
        }, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type":'application/json'
            }
        })

        if (response) {
            console.log('response of referral code validations', response.data)
            if (response.data.status == true) {
                return response.data
            } else {
                return response.data
            }
        }

    } catch (error) {
        console.log('error referral code validations api', error)
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


export const getMonthlyPrice = (selectedPlan) => {
    if (!selectedPlan) {
        return 0;
    }
    
    const price = selectedPlan.discountedPrice || selectedPlan.discountPrice || selectedPlan.originalPrice ||  0;
    const billingCycle = selectedPlan.billingCycle || selectedPlan.duration;


    console.log("selected plan in monthly plan func is",selectedPlan)
    
    if (billingCycle === "monthly") {
        return price;
    } else if (billingCycle === "quarterly") {
        return (price * 3) / 3; // Price per month for quarterly
    } else if (billingCycle === "yearly") {
        return (price * 12) / 12; // Price per month for yearly
    } else {
        return price;
    }
}

export const getTotalPrice = (selectedPlan) => {
    console.log("Selected plan for pricing:", selectedPlan);
    if (!selectedPlan) {
        return 0;
    }
    
    const price = selectedPlan.discountedPrice || selectedPlan.discountPrice || selectedPlan.originalPrice || 0;
    const billingCycle = selectedPlan.billingCycle || selectedPlan.duration;
    
    if (billingCycle === "monthly") {
        return price;
    } else if (billingCycle === "quarterly") {
        return price * 3;
    } else if (billingCycle === "yearly") {
        return price * 12;
    } else {
        return price;
    }
}


// Returns a human-friendly next charge date string based on plan billing cycle
// monthly: +30 days, quarterly: +3 calendar months, yearly: +12 calendar months
export const getNextChargeDate = (selectedPlan, fromDate = new Date()) => {
    try {
        const billingCycle = (selectedPlan && (selectedPlan.billingCycle || selectedPlan.duration)) || "monthly";

        const baseDate = new Date(fromDate);
        const nextDate = new Date(baseDate);

        if (billingCycle === "monthly") {
            // exactly 30 days from now as requested
            nextDate.setDate(nextDate.getDate() + 30);
        } else if (billingCycle === "quarterly") {
            // add 3 calendar months
            const month = nextDate.getMonth();
            nextDate.setMonth(month + 3);
        } else if (billingCycle === "yearly") {
            // add 12 calendar months
            const month = nextDate.getMonth();
            nextDate.setMonth(month + 12);
        } else {
            // default to 30 days if unknown
            nextDate.setDate(nextDate.getDate() + 30);
        }

        const formatted = nextDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        return formatted;
    } catch (e) {
        return "";
    }
}

