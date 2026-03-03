import { toast } from "@/utils/toast"
import { AuthToken } from "../agency/plan/AuthDetails"
import Apis from "../apis/Apis"
import axios from "axios"

//functiion to get cards list
export const getCardsList = async (selectedUser = null) => {
    try {
        // setGetCardLoader(true);
        let token = AuthToken()

        let ApiPath = Apis.getCardsList

        if (selectedUser) {
            ApiPath = `${ApiPath}?userId=${selectedUser.id}`
        }

        const response = await axios.get(ApiPath, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        console.log('response of fetch cards list', response)

        if (response) {
            if (response.data.status === true) {
                return response.data.data
            }
        }
    } catch (error) {
        toast.error('Error fetching cards list')
    } finally {
        // //console.log;
        // setGetCardLoader(false);
    }
}

export const getCardImage = (item) => {
    if (item.brand === 'visa') {
        return '/svgIcons/Visa.svg'
    } else if (item.brand === 'Mastercard') {
        return '/svgIcons/mastercard.svg'
    } else if (item.brand === 'amex') {
        return '/svgIcons/Amex.svg'
    } else if (item.brand === 'discover') {
        return '/svgIcons/Discover.svg'
    } else if (item.brand === 'dinersClub') {
        return '/svgIcons/DinersClub.svg'
    }
}
