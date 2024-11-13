import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
//import for input drop down menu
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const CreateAgent4 = ({ handleContinue, handleBack }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const [selectNumber, setSelectNumber] = useState('');

    const handleSelectNumber = (event) => {
        setSelectNumber(event.target.value);
    };

    const handleToggleClick = () => {
        setToggleClick(!toggleClick)
    }

    const PhoneNumbers = [
        {
            id: 1,
            number: "03011958712"
        },
        {
            id: 2,
            number: "03281575712"
        },
        {
            id: 3,
            number: "03058191079"
        },
    ]

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "700"
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "500",
            color: "#000000"
        },
        dropdownMenu: {
            fontSize: 15,
            fontWeight: "500",
            color: "#00000070"
        },
        callBackStyles: {
            height: "71px", width: "210px",
            border: "1px solid #15151550", borderRadius: "20px",
            fontWeight: "600", fontSize: 15
        }
    }


    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-gray-100 rounded-lg w-10/12 h-[90vh] py-4 overflow-auto flex flex-col justify-between'>

                <div>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            Let's talk digits
                        </div>
                        <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

                            <div style={styles.headingStyle}>
                                Select a phone number you'd like to use to call with
                            </div>

                            <div className='border rounded-lg'>
                                <Box className="w-full">
                                    <FormControl className="w-full">
                                        <Select
                                            className='border-none rounded-lg outline-none'
                                            displayEmpty
                                            value={selectNumber}
                                            onChange={handleSelectNumber}
                                            renderValue={(selected) => {
                                                if (selected === '') {
                                                    return <div>Select Number</div>;
                                                }
                                                return selected;
                                            }}
                                            sx={{
                                                ...styles.dropdownMenu,
                                                backgroundColor: '#FFFFFF',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    border: 'none',
                                                },
                                            }}
                                        >
                                            <MenuItem value="">
                                                <div style={styles.dropdownMenu}>None</div>
                                            </MenuItem>
                                            {
                                                PhoneNumbers.map((item, index) => (
                                                    <MenuItem key={item.id} style={styles.dropdownMenu} value={item.number}>{item.number}</MenuItem>
                                                ))
                                            }
                                            {/* <MenuItem value={20}>03058191079</MenuItem>
                                        <MenuItem value={30}>03281575712</MenuItem> */}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </div>


                            <div style={styles.headingStyle}>
                                What number should we forward live transfers to when a lead wants to talk to you?
                            </div>

                            <div className='flex flex-row items-center gap-4'>
                                <button className='flex flex-row items-center justify-center' style={styles.callBackStyles}>
                                    Use +92 3011958712
                                </button>
                                <button className='flex flex-row items-center justify-center' style={{ ...styles.callBackStyles, width: "242px" }}>
                                    Use my cell or office number
                                </button>
                            </div>

                            <div className='mt-4' style={styles.dropdownMenu}>
                                Enter Number
                            </div>

                            <input
                                placeholder='Phone Number'
                                className='border-2 rounded p-2 outline-none'
                                style={styles.inputStyle}
                            />

                            <div style={styles.headingStyle}>
                                What number should we forward live transfers to when a lead wants to talk to you?
                            </div>
                            <input
                                placeholder='Phone Number'
                                className='border-2 rounded p-2 outline-none'
                                style={styles.inputStyle}
                            />

                            <div className='flex flex-row items-center gap-4 justify-start mt-6'>
                                <button onClick={handleToggleClick}>
                                    {
                                        toggleClick ?
                                            <div className='bg-purple flex flex-row items-center justify-center rounded' style={{ height: "24px", width: "24px" }}>
                                                <Image src={"/assets/whiteTick.png"} height={8} width={10} alt='*' />
                                            </div> :
                                            <div className='bg-none border-2 flex flex-row items-center justify-center rounded' style={{ height: "24px", width: "24px" }}>
                                            </div>
                                    }
                                </button>
                                <div style={{ color: "#151515", fontSize: 15, fontWeight: "600" }}>
                                    Don't make live transfers. Prefer the AI Agent schedules them for a call back.
                                </div>
                            </div>




                            {/* <Body /> */}
                        </div>
                    </div>
                </div>

                <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleContinue} handleBack={handleBack} />
                </div>

            </div>
        </div>
    )
}

export default CreateAgent4
