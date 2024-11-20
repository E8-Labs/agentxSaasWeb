import Apis from '@/components/apis/Apis';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const AssignLead = () => {

    const [initialLoader, setInitialLoader] = useState(false);
    const [agentsList, setAgentsList] = useState([]);
    const [stages, setStages] = useState([]);
    const [SelectedAgents, setSelectedAgents] = useState([]);

    useEffect(() => {
        getAgents()
    }, []);

    //get agents api
    const getAgents = async () => {
        try {
            setInitialLoader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
                console.log("USer details are :", UserDetails);
            }

            console.log("Auth token is :--", AuthToken);

            const ApiPath = Apis.getAgents;
            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get agents api is:", response.data);
                setAgentsList(response.data.data);
                setStages(response.data.data.stages);
            }

        } catch (error) {
            console.error("ERrror occured in agents api is :", error);
        } finally {
            setInitialLoader(false);
            console.log("Api call completed")
        }
    }

    const handleAssignAgent = (id) => {
        setSelectedAgents((prevSelectedItems) => {
            if (prevSelectedItems.includes(id)) {
                // Remove the ID if it's already selected
                return prevSelectedItems.filter((itemId) => itemId !== id);
            } else {
                // Add the ID to the selected items
                return [...prevSelectedItems, id];
            }
        });
    }

    const styles = {
        heading: {
            fontWeight: "700",
            fontSize: 17
        },
        paragraph: {
            fontWeight: "500",
            fontSize: 12
        },
        paragraph2: {
            fontWeight: "500",
            fontSize: 12
        }
    }
    return (
        <div>
            <div className='flex flex-row items-center justify-between mt-4'>
                <div style={{ fontSize: 24, fontWeight: "700" }}>
                    Select your Agent
                </div>
                <div className='text-purple' style={styles.paragraph}>
                    Contacts Selected
                </div>
            </div>
            <div className='mt-2' style={styles.paragraph2}>
                Only outbound models can be selected to make calls
            </div>

            <div className='max-h-[40vh] overflow-auto'>
                {
                    agentsList.map((item, index) => (
                        <button key={index} className='border rounded-lg p-2 mt-4'
                            onClick={() => { handleAssignAgent }}>
                            <div className='flex flex-row items-center justify-between'>
                                <div className='flex flex-row items-center gap-2'>
                                    <Image src={"/assets/avatar1.png"} height={42} width={42} alt='*' />
                                    <span style={styles.heading}>
                                        {item.name}
                                    </span>
                                </div>
                                <div>
                                    {item.agents[0].agentRole}
                                </div>
                            </div>

                            <div className='flex flex-row items-center gap-2'>
                                <div style={styles.paragraph}>
                                    <span className='text-purple'>Pipeline 1 |</span> Active in
                                </div>

                                <div className='flex flex-row w-full overflow-auto' style={{ scrollbarWidth: "none" }}>
                                    {
                                        item.stages.map((item, index) => (
                                            <div className='px-3 py-1 rounded-3xl border' style={styles.paragraph} key={index}>
                                                {item.stageTitle}
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* <div className='px-3 py-1 rounded-3xl border' style={styles.paragraph}>
                                    New Lead
                                </div> */}
                            </div>
                        </button>
                    ))
                }
            </div>


        </div>
    )
}

export default AssignLead