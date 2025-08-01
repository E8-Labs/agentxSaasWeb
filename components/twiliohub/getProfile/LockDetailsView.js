import Image from 'next/image'
import React from 'react'

const LockDetailsView = ({
    description = "Customer Profile needs to be approved to continue.",
    btnTitle = "Complete CNAM",
    profileStatus,
    handleShowAddModal,
    showBtn = false,
    unLockDescription,
    businessProfileData,
}) => {

    console.log("profile status is", profileStatus);

    const styles = {
        normalFont: {
            fontSize: 15,
            fontWeight: "500"
        }
    }

    return (
        <div className='bg-[#00000005] px-4 py-2 rounded-b-lg w-full flex flex-row items-center justify-between' style={{ borderTop: "1px solid #00000010" }}>
            <div className='flex flex-row items-center gap-2'>
                {
                    (!showBtn && profileStatus) ? (
                        <Image
                            src={"/twiliohubassets/lock.jpg"}
                            alt='lock'
                            width={16}
                            height={18}
                        />
                    ) : (
                        ""
                    )
                }
                {
                    profileStatus ? (
                        <div style={styles.normalFont}>
                            {description}
                        </div>
                    ) : (
                        <div style={styles.normalFont}>
                            {unLockDescription}
                        </div>
                    )
                }
            </div>
            {
                // (!showBtn && !profileStatus && businessProfileData && businessProfileData.profileType !== "individual") && (
                (!showBtn && !profileStatus && (!businessProfileData || businessProfileData.profileType !== "individual")) && (
                    <button
                        className='border-none outline-none text-purple'
                        style={styles.normalFont}
                        onClick={handleShowAddModal}>
                        {btnTitle}
                    </button>
                )
            }
            {
                (businessProfileData && businessProfileData.profileType == "individual") && (
                    <button
                        // className='border-none outline-none text-purple'
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                        // style={styles.normalFont}
                        // onClick={handleShowAddModal}
                    >
                        You need a Business Primary Profile
                    </button>
                )
            }
        </div>
    )
}

export default LockDetailsView;
