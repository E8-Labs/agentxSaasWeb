import axios from "axios"
import { AuthToken } from "../agency/plan/AuthDetails"
import Apis from "../apis/Apis"
import { Scopes } from "../dashboard/myagentX/Scopes"

export const getTempletes = async (type) => {
    try {
        let token = AuthToken()
        // console.log('token', token)
        let path = Apis.templets
        if (type) {
            path = path + "?communicationType=" + type
        }
        console.log('path', path)

        const response = await axios.get(path, {
            headers: {
                "Authorization": "Bearer " + token,
            }
        })

        if (response) {
            console.log('response of get templetes', response)
            return response.data.data
        }
    } catch (e) {
        console.log('error in get templetes', e)
    }
}


export const getA2PNumbers = async () => {
    try {
        let token = AuthToken()
        // console.log('token', token)
        let path = Apis.a2pNumbers

        console.log('path', path)

        const response = await axios.get(path, {
            headers: {
                "Authorization": "Bearer " + token,
            }
        })

        if (response) {
            console.log('response of get a2p verified numbers', response)
            return response.data.data
        }
    } catch (e) {
        console.log('error in get templetes', e)
    }
}


export const getTempleteDetails = async (temp) => {
    try {
        let token = AuthToken()
        // console.log('token', token)
        let path = `${Apis.templets}/${temp.templateId}`
        console.log('path', path)

        const response = await axios.get(path, {
            headers: {
                "Authorization": "Bearer " + token,
            }
        })

        if (response) {
            console.log('response of get templete details', response)
            return response.data.data

        }
    } catch (e) {
        console.log('error in get templetes', e)
    }
}


export const createTemplete = async (data) => {
    try {
        let token = AuthToken()
        console.log('data', data)

        let formdata = new FormData();

        // if(data.templateName){
        formdata.append("templateName", data.templateName)
        // }
        // if(data.communicationType){
        formdata.append("communicationType", data.communicationType)
        // }
        // if(data.subject){
        formdata.append("subject", data.subject)
        // }
        // if(data.content){
        formdata.append("content", data.content)

        // If data.attachments is an array of files
        if (data.attachments && Array.isArray(data.attachments)) {
            data.attachments.forEach(file => {
                formdata.append("attachments", file)
            })
        } else if (data.attachments) {
            // If it's a single file
            formdata.append("attachments", data.attachments)
        }

        // }
        if (data.ccEmails && Array.isArray(data.ccEmails)) {
            // Ensure it's a proper JSON array string
            formdata.append("ccEmails", JSON.stringify(data.ccEmails));
        }
        for (let pair of formdata.entries()) {
            console.log(pair[0] + ":", pair[1]);
        }

        let path = Apis.templets
        console.log('path', path)

        const response = await axios.post(path, formdata, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/form-data'
            }
        })

        if (response) {
            console.log('response', response.data)
            return response
        }
    } catch (e) {
        console.log('error in create tempelate', e)
        if (e.response) {
            return e.response
        }
        return null
    }

}


export const updateTemplete = async (data, tempId) => {
    try {
        let token = AuthToken()
        console.log('data', data)

        let formdata = new FormData();

        // if(data.templateName){
        formdata.append("templateName", data.templateName)
        // }
        // if(data.communicationType){
        formdata.append("communicationType", data.communicationType)
        // }
        // if(data.subject){
        formdata.append("subject", data.subject)
        // }
        // if(data.content){
        formdata.append("content", data.content)
        if (data.attachments && Array.isArray(data.attachments)) {
            data.attachments.forEach(file => {
                formdata.append("attachments", file)
            })
        } else if (data.attachments) {
            // If it's a single file
            formdata.append("attachments", data.attachments)
        }
        // }
        if (data.ccEmails && Array.isArray(data.ccEmails)) {
            // Ensure it's a proper JSON array string
            formdata.append("ccEmails", JSON.stringify(data.ccEmails));
        }
        for (let pair of formdata.entries()) {
            console.log(pair[0] + ":", pair[1]);
        }

        let path = `${Apis.templets}/${tempId}`
        console.log('path', path)

        const response = await axios.put(path, formdata, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/form-data'
            }
        })

        if (response) {
            console.log('response of update', response.data)
            return response
        }
    } catch (e) {
        console.log('error in create tempelate', e)
        if (e.response) {
            return e.response
        }
        return null
    }

}


export const deleteTemplete = async (temp) => {
    try {
        let token = AuthToken()
        // console.log('token', token)
        let path = `${Apis.templets}/${temp.id}`
        console.log('path', path)

        const response = await axios.delete(path, {
            headers: {
                "Authorization": "Bearer " + token,
            }
        })

        if (response) {
            console.log('response of delete templetes', response)
            return response.data.data

        }
    } catch (e) {
        console.log('error in get templetes', e)
    }
}



export const getGmailAccounts = async () => {
    try {
        let token = AuthToken()
        // console.log('token', token)
        let path = Apis.gmailAccount
        console.log('path', path)

        const response = await axios.get(path, {
            headers: {
                "Authorization": "Bearer " + token,
            }
        })

        if (response) {
            console.log('response of get accounts', response)
            return response.data.data

        }
    } catch (e) {
        console.log('error in get accounts', e)
    }
}


export const connectGmailAccount = async (data) => {
    try {
        let token = AuthToken()
        // console.log('data', data)

        let apiData = {
            email: data.email,
            displayName: data.name,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            scope: Scopes.join(" "),
            expiryDate: Date.now() + (data.expires_in * 1000)
        }

        console.log('apiData', apiData)
        let path = Apis.connectGmailAccount
        console.log('path', path)
        // return
        const response = await axios.post(path, apiData, {
            headers: {
                'Authorization': 'Bearer ' + token,
                // 'Content-Type': 'multipart/form-data'
            }
        })

        if (response) {
            console.log('response', response.data)
            return response
        }
    } catch (e) {
        console.log('error in connect account', e)
        if (e.response) {
            return e.response
        }
        return null
    }

}

export const deleteAccount = async (account) => {
    try {
        let token = AuthToken()
        // console.log('token', token)
        let path = `${Apis.gmailAccount}/${account.id}`
        console.log('path', path)

        const response = await axios.delete(path, {
            headers: {
                "Authorization": "Bearer " + token,
            }
        })

        if (response) {
            console.log('response of delete account', response)
            return response.data.data

        }
    } catch (e) {
        console.log('error in get templetes', e)
    }
}




