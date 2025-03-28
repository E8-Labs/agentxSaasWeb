import Apis from '@/components/apis/Apis';
import axios from 'axios';
import React, { useEffect, useState } from 'react'

const DefaultData = ({ setServicesData }) => {

    const [DefaultData, setDefaultData] = useState([]);

    const getDefaultData = async () => {
        try {
            //// //console.log;
            const ApiPath = Apis.defaultData;
           // //console.log;
            const response = await axios.get(ApiPath, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response) {
               // //console.log;
                setDefaultData(response.data.data);
                setServicesData(response.data.data.agentServices);
            } else {
                alert(response.data)
            }

        } catch (error) {
           // console.error("ERror occured in default data api is :----", error);
        }
    }

    useEffect(() => {
        getDefaultData();
    }, [])

    return (
        <div>DefaultData</div>
    )
}

export default DefaultData