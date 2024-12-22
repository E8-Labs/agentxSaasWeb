'use-client'
import React, { useState } from 'react'
import Image from 'next/image'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

function MyPhoneNumber() {

    const [openMoreDropdown, setOpenMoreDropdown] = useState("")
    const [moreDropdown, setMoreDropdown] = useState("");



    const numbers = [
        {
            id: 1,
            number: '+1 (496) 426-1093',

        }, {
            id: 2,
            number: '+1 (496) 426-1093',

        }, {
            id: 3,
            number: '+1 (496) 426-1093',

        }, {
            id: 4,
            number: '+1 (496) 426-1093',

        }, {
            id: 5,
            number: '+1 (496) 426-1093',

        },
    ]

    const handleMoreClose = (event) => {
        // setSelectedItem(event.target.textContent)
        setOpenMoreDropdown(false);
    };

    return (
        <div className='w-full flex flex-col items-start px-8 py-2' style={{ paddingBottom: '50px', height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}>
            <div className='w-full flex flex-row items-center justify-between'>
                <div className='flex flex-col'>
                    <div style={{ fontSize: 22, fontWeight: "700", color: '#000' }}>
                        My Numbers
                    </div>

                    <div style={{ fontSize: 12, fontWeight: "500", color: '#00000090' }}>
                        {"Account > My Numbers"}
                    </div>
                </div>

                <button className=''>
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#7902DF', textDecorationLine: 'underline' }}>
                        Add New Number
                    </div>
                </button>
            </div>


            <div className='w-full flex flex-col items-start gap-4 mt-10'>
                {
                    numbers.map((item) => (
                        <div key={item.id} className='w-7/12 flex'>
                            {/* <button className='w-full flex'
                            > */}
                            <div className='w-full border rounded-lg p-4'>
                                <div className='w-full flex flex-row items-center justify-between'>

                                    <div className="flex flex-col items-start gap-4">
                                        <div className='flex flex-row items-center gap-2'>
                                            <div className='' style={{ fontSize: 16, fontWeight: '700' }}>
                                                +1 (496) 426-1093
                                            </div>

                                            <div style={{ fontSize: 11, fontWeight: '500' }}>
                                                Outbound
                                            </div>
                                        </div>

                                        <div style={{ fontSize: 13, fontWeight: '500' }}>
                                            Assigned Agents
                                        </div>
                                    </div>

                                    <div className='flex flex-col items-end gap-2'>
                                        <button id='more-menu'
                                            onClick={(event) => {
                                                setOpenMoreDropdown(true);
                                                setMoreDropdown(event.currentTarget);
                                            }}>
                                            <Image src={"/otherAssets/threeDotsIcon.png"}
                                                height={24}
                                                width={24}
                                                alt='more'
                                            />
                                        </button>

                                        {/* <button> */}
                                        <div style={{ fontSize: 15, fontWeight: '700', color: '#7902DF' }}>
                                            {`{Ann's ai}`}
                                        </div>
                                        {/* </button> */}
                                    </div>


                                </div>
                            </div>
                            {/* </button> */}

                            <Menu
                                id="more-menu"
                                anchorEl={moreDropdown}
                                open={openMoreDropdown}
                                onClose={handleMoreClose}
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        fontSize: 15,
                                        fontWeight: '500',
                                        color: 'black',
                                        padding: '10px 20px',
                                    }}
                                    onClick={handleMoreClose}
                                >
                                    <Image
                                        src="/otherAssets/editIcon.png"
                                        alt="Edit"
                                        width={24}
                                        height={24}
                                    />
                                    Edit
                                </MenuItem>
                                <MenuItem
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        fontSize: 15,
                                        fontWeight: '500',
                                        color: 'red',
                                        padding: '10px 20px',
                                        width:'13vw'
                                    }}
                                    onClick={handleMoreClose}
                                >
                                    <Image
                                        src="/otherAssets/deleteIcon.png"
                                        alt="Delete"
                                        width={24}
                                        height={24}
                                    />
                                    Delete
                                </MenuItem>
                            </Menu>
                        </div>
                    ))
                }


            </div>
        </div>
    )
}

export default MyPhoneNumber


const styles = {
    itemText: {
        fontSize: 15,
        fontWeight: '500',
        color: 'black'
    }, modalsStyle: {
        height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    headingStyle: {
        fontSize: 12,
        fontWeight: "400",
        color: '#00000050'
    },
    inputStyle: {
        fontSize: 15,
        fontWeight: "500",
        marginTop: 10
    }
}