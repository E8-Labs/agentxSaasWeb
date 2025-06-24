import Image from 'next/image'
import React from 'react'

const CustomerProfile = () => {

    //styles
    const styles = {
        fontBold: {
            fontWeight: "700",
            fontSize: 18
        }
    }

    return (
        <div className='border rounded-lg w-full'>
            <div className='flex flex-row items-center justify-between w-full'>
                <div className='w-full flex flex-row items-center justify-between'>
                    <div>
                        Customer Profile
                    </div>
                    <button>
                        <Image
                            alt='*'
                            src={"/"}
                            height={18}
                            width={18}
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CustomerProfile
