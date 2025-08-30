import axios from "axios"
import { AuthToken } from "../agency/plan/AuthDetails"
import Apis from "../apis/Apis"

export const getUserPlans =async () =>{
    try{
        let token = AuthToken()

        const response = await axios.get(Apis.getPlans,{
            headers:{
                "Authorization":'Bearer '+token
            }
        })


        if(response){
            if(response.data.status == true){
                console.log('user plans are', response.data)
                return response.data.data
            }else{
                return null
            }
        }
        
    }catch (error){
        console.log('error in get plans api', error)
    }
}