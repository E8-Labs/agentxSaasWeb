import getProfileDetails from '@/components/apis/GetProfile';
import { UpdateProfile } from '@/components/apis/UpdateProfile';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { useUser } from '@/hooks/redux-hooks';
import { Box, CircularProgress, Modal } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';


const EditAgencyName = ({
    flex = false,
}) => {

    const [userData, setUserData] = useState(null);
    const [agencyName, setAgencyName] = useState("");
    const [loading, setloading] = useState(false);
    //show edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    //snack
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Success);

    const {user:reduxUser, setUser:setReduxUser} = useUser();

    useEffect(() => {
        fetchData();

    }, [reduxUser?.company]); // Watch for changes in reduxUser.company

    const fetchData = async () => {
        setUserData(reduxUser);
        setAgencyName(reduxUser?.company || "");
    }



    //update agencyName
    const handleNameSave = async () => {
        try {
            setloading(true);
            const data = { company: agencyName };
            // console.log("Data of update api is", data);
            // return
            const response = await UpdateProfile(data);
            console.log("Response of update api is", response);
            
            // Update Redux store with updated user data from API response
            if (response) {
                const localData = JSON.parse(localStorage.getItem("User") || '{}');
                const updatedUserData = {
                    token: localData.token,
                    user: response // response is the updated user object from UpdateProfile
                };
                setReduxUser(updatedUserData);
            }
            
            setSnackMsg("Agency Name Updated");
            setloading(false);
            setShowEditModal(false);
        } catch (e) {
            console.error("Error occured in update agency name is ", e);
            setloading(false);
        }
    };

    //close modal and donot save data
    const handleCancel = () => {
        setAgencyName(userData?.company);
        setShowEditModal(false);
    }

    return (
        <div className={`w-full ${flex && "flex flex-row items-center gap-4"}`}>
            <AgentSelectSnackMessage
                isVisible={snackMsg !== null}
                message={snackMsg}
                hide={() => { setSnackMsg(null) }}
                type={snackMsgType}
            />
            <div className='flex w-full flex-row justify-start items-center gap-2'>
                <div className='sm:text-lg lg:text-2xl lg:font-bold truncate overflow-hidden whitespace-nowrap'>
                    {agencyName || "Agency Name"}
                </div>
                <button
                    type="button"
                    className='border-none outline-none'
                    onClick={() => {
                        setShowEditModal(true);
                    }}
                >
                    <Image
                        src="/otherAssets/editIcon.png"
                        alt="*"
                        height={20}
                        width={20}
                    />
                </button>
            </div>
            {
                setShowEditModal && (
                    <EditAgency
                        name={agencyName}
                        setAgencyName={setAgencyName}
                        open={showEditModal}
                        onSave={handleNameSave}
                        onCancel={handleCancel}
                        userData={userData}
                        loading={loading}
                    />
                )
            }
        </div>
    )
}

export default EditAgencyName;

//edit agency modal
export const EditAgency = ({
    name,
    setAgencyName,
    open,
    onSave,
    onCancel,
    userData,
    loading
}) => {

    const inputRef = useRef(null);

    const [isNameChanged, setIsNameChanged] = useState(false);

    //store value in input field
    useEffect(() => {

    }, []);

    //disable button
    useEffect(() => {
        if (name === userData?.user?.company) {
            setIsNameChanged(false);
        }
    }, [name]);


    return (
        <Modal
            open={open}
            closeAfterTransition
            BackdropProps={{
                timeout: 1000,
                sx: {
                    backgroundColor: "#00000020",
                    ////backdropFilter: "blur(5px)"
                },
            }}>
            <Box className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
                    <div className='text-xl font-bold'>
                        Edit Agency Name
                    </div>
                    <div className='w-full mt-4'>
                        <input
                            ref={inputRef}
                            className="w-full border outline-none focus:ring-0 focus:border-purple-500 rounded-lg focus:outline-none"
                            placeholder="Agency Name"
                            value={name}
                            onChange={(e) => {
                                setAgencyName(e.target.value);
                                setIsNameChanged(true);
                            }}
                            style={{
                                fontSize: 15,
                                fontWeight: "500"
                            }}
                        />
                    </div>
                    <div className='w-full flex flex-row items-center mt-4'>
                        <button
                            className='hover:text-purple w-1/2'
                            onClick={onCancel}>
                            Cancel
                        </button>
                        {
                            loading ? (
                                <div className='w-1/2 flex flex-row items-center justify-center'>
                                    <CircularProgress
                                        size={20}
                                    />
                                </div>
                            ) : (
                                <button
                                    className={`${!isNameChanged ? "bg-[#00000030]" : "bg-purple"} text-white rounded-xl w-1/2 h-[50px]`}
                                    disabled={!isNameChanged}
                                    onClick={onSave}>
                                    Save
                                </button>
                            )
                        }
                    </div>
                </div>
            </Box>
        </Modal>
    )
}
