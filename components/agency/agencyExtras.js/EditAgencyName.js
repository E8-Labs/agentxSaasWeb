import { UpdateProfile } from '@/components/apis/UpdateProfile';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { CircularProgress } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';


const EditAgencyName = ({
    flex= false
}) => {

    const inputRef = useRef(null);

    const [userData, setUserData] = useState(null);
    const [agencyName, setAgencyName] = useState("");
    const [isNameChanged, setIsNameChanged] = useState(false);
    const [loading, setloading] = useState(false);
    //snack
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Success);

    useEffect(() => {
        const localData = localStorage.getItem("User");
        if (localData) {
            const d = JSON.parse(localData);
            console.log("User Data", d?.user);
            setUserData(d);
            setAgencyName(d?.user?.company)
        }
    }, []);

    useEffect(() => {
        if (agencyName === userData?.user?.company) {
            setIsNameChanged(false);
        }
    }, [agencyName]);

    //update agencyName
    const handleNameSave = async () => {
        try {
            setloading(true);
            const data = { company: agencyName };
            await UpdateProfile(data);
            setSnackMsg("Agency Name Updated");
            setloading(false);
            setIsNameChanged(false);
        } catch (e) {
            console.error("Error occured in update agency name is ", e);
            setloading(false);
        }
    };

    return (
        <div className={`w-full ${flex && "flex flex-row items-center gap-4"}`}>
            <AgentSelectSnackMessage
                isVisible={snackMsg !== null}
                message={snackMsg}
                hide={() => { setSnackMsg(null) }}
                type={snackMsgType}
            />
            <div className='flex w-full flex-row justify-end'>
                {
                    isNameChanged ? (
                        <div>
                            {
                                loading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <button
                                        type="button"
                                        className='border-none outline-none text-purple'
                                        onClick={handleNameSave}
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: "600"
                                        }}>
                                        Save
                                    </button>
                                )
                            }
                        </div>
                    ) : (
                        <div>
                            {
                                agencyName && (
                                    <button
                                        type="button"
                                        className='border-none outline-none'
                                        onClick={() => inputRef.current?.focus()}
                                    >
                                        <Image
                                            src="/otherAssets/editIcon.png"
                                            alt="*"
                                            height={20}
                                            width={20}
                                        />
                                    </button>
                                )
                            }
                        </div>
                    )
                }
            </div>
            <input
                ref={inputRef}
                className="border border-transparent outline-none focus:ring-0 focus:border-purple-500 rounded-lg focus:outline-none sm:text-lg lg:text-2xl lg:font-bold"
                placeholder="Agency Name"
                value={agencyName}
                onChange={(e) => {
                    setAgencyName(e.target.value);
                    setIsNameChanged(true);
                }}
            />
        </div>
    )
}

export default EditAgencyName
