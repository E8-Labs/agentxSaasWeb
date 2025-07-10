import Image from 'next/image'
import React from 'react'

const LockDetailsView = ({
    title = "Customer Profile needs to be approved to continue.",
    btnTitle = "Complete Cnam",
    profileStatus,
    handleShowAddModal,
    showBtn = false
}) => {

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
                    profileStatus ? (
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
                <div style={styles.normalFont}>
                    {title}
                </div>
            </div>
            {
                !profileStatus || showBtn && (
                    <button
                        className='border-none outline-none text-purple'
                        style={styles.normalFont}
                        onClick={handleShowAddModal}>
                        {btnTitle}
                    </button>
                )
            }
        </div>
    )
}

export default LockDetailsView
